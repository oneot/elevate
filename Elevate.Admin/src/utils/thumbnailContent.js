/**
 * 자동 썸네일에 넣을 글 내용을 본문 HTML에서 고르고, 줄바꿈·말줄임을 계산하는 순수 함수 모음.
 * Canvas 그리기(autoThumbnail.js)와 분리해 jsdom에서 테스트한다.
 */

const EMOJI = /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|\uFE0F|\u200D|\u20E3/gu
const ELLIPSIS = '…'

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }

/** 이모지·HTML 태그 조각·연속 공백을 정리한다. 썸네일 글자는 공개 사이트처럼 이모지 없이 보여 준다. */
export function cleanText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .replace(EMOJI, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 앞에 붙은 번호·단계·글머리표를 뗀다 (목차 카드가 번호를 따로 붙인다). 예: '1. 소개' → '소개', 'STEP 2) 정리' → '정리'. */
export function stripEnumeration(value) {
  return cleanText(value)
    .replace(/^(?:[|·•▶▷►\-–—]+\s*)+/, '')
    .replace(/^(?:step|단계)?\s*\d+\s*[.):]\s*/i, '')
    .replace(/^[\u2460-\u2473]\s*/, '')
    .replace(/[\s:：;,·\-–—]+$/, '')
    .trim()
}

function normalized(value) {
  return cleanText(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

function sameText(a, b) {
  const left = normalized(a)
  const right = normalized(b)
  return Boolean(left) && Boolean(right) && (left === right || left.startsWith(right) || right.startsWith(left))
}

function unique(values) {
  const seen = new Set()
  return values.filter((value) => {
    const key = value.toLowerCase()
    if (!value || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * 첫 문장(또는 구절)만 남긴다. 알약 문구처럼 짧게 보여 줄 때 쓴다.
 * '1.'·'STEP 2.'처럼 숫자 뒤의 마침표에서는 자르지 않고, 앞의 번호는 뗀다.
 */
export function firstPhrase(text) {
  const cleaned = stripEnumeration(text)
  const parts = cleaned.split(/(?<!\d)[.!?。](?=\s|$)|[·|]/).map((part) => stripEnumeration(part)).filter(Boolean)
  const phrase = parts.find((part) => Array.from(part).length >= 4) || parts[0] || ''
  return phrase.replace(/[,:;~\-–—]+$/, '').trim()
}

/** 목록 항목 자신의 글자만 (안쪽 목록은 뺀다). */
function ownText(node) {
  const clone = node.cloneNode(true)
  clone.querySelectorAll('ul, ol').forEach((child) => child.remove())
  return cleanText(clone.textContent)
}

/**
 * 썸네일에 쓸 글 내용을 본문 HTML에서 고른다.
 * 공개 사이트 썸네일처럼 본문 이미지(스크린샷)는 쓰지 않고 글자 구조(소제목·목록·문단)만 쓴다.
 * @param {{ title?: string, excerpt?: string, html?: string }} source
 * @returns {{ title: string, summary: string, headings: string[], items: string[], paragraphs: string[] }}
 */
export function extractThumbnailContent({ title, excerpt, html } = {}) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html')
  const cleanTitle = cleanText(title) || '새 게시글'

  const headings = unique([...doc.querySelectorAll('h1, h2, h3, h4')].map((node) => stripEnumeration(node.textContent)))
    .filter((text) => text && !sameText(text, cleanTitle))
    .slice(0, 8)
  const items = unique([...doc.querySelectorAll('li')].map((node) => stripEnumeration(ownText(node))))
    .filter(Boolean)
    .slice(0, 12)
  // 목록·표 안의 <p>는 문단이 아니다 (Tiptap은 목록 항목을 <li><p>로 저장한다).
  const paragraphs = unique([...doc.querySelectorAll('p, blockquote')]
    .filter((node) => !node.closest('li, td, th') && !(node.tagName === 'P' && node.closest('blockquote')))
    .map((node) => cleanText(node.textContent)))
    .filter((text) => Array.from(text).length > 1 && !sameText(text, cleanTitle))
    .slice(0, 6)

  return { title: cleanTitle, summary: cleanText(excerpt), headings, items, paragraphs }
}

function withEllipsis(text, maxWidth, measure) {
  const chars = Array.from(text)
  while (chars.length > 0 && measure(`${chars.join('').trimEnd()}${ELLIPSIS}`) > maxWidth) chars.pop()
  return chars.length ? `${chars.join('').trimEnd()}${ELLIPSIS}` : ''
}

/**
 * 한 줄에 맞게 자르고 넘치면 말줄임표를 붙인다.
 * @param {string} text
 * @param {number} maxWidth
 * @param {(value: string) => number} measure
 */
export function fitText(text, maxWidth, measure) {
  const value = cleanText(text)
  return measure(value) <= maxWidth ? value : withEllipsis(value, maxWidth, measure)
}

/**
 * 단어(띄어쓰기) 단위로 줄을 나누고, 한 단어가 너무 길면 글자 단위로 나눈다.
 * maxLines를 넘으면 마지막 줄에 말줄임표를 붙인다.
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} maxLines
 * @param {(value: string) => number} measure
 * @returns {string[]}
 */
export function wrapText(text, maxWidth, maxLines, measure) {
  const value = cleanText(text)
  if (!value || maxLines < 1) return []

  const lines = []
  let current = ''
  for (const word of value.split(' ')) {
    const candidate = current ? `${current} ${word}` : word
    if (measure(candidate) <= maxWidth) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = ''
    if (measure(word) <= maxWidth) {
      current = word
      continue
    }
    for (const char of Array.from(word)) {
      if (current && measure(current + char) > maxWidth) {
        lines.push(current)
        current = char
      } else {
        current += char
      }
    }
  }
  if (current) lines.push(current)

  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  kept[maxLines - 1] = withEllipsis(kept[maxLines - 1], maxWidth, measure)
  return kept
}

/**
 * wrapText와 줄 수는 같게 두고 줄 길이를 고르게 나눈다 (제목·목차에서 낱말 하나만 다음 줄로 넘어가지 않게).
 * 말줄임이 붙었거나 낱말이 한 줄보다 길면 wrapText 결과를 그대로 쓴다.
 */
export function balanceLines(text, maxWidth, maxLines, measure) {
  const lines = wrapText(text, maxWidth, maxLines, measure)
  if (lines.length < 2 || lines.length > 3) return lines
  const words = cleanText(text).split(' ')
  if (lines.join(' ') !== words.join(' ') || words.some((word) => measure(word) > maxWidth)) return lines

  const widthOf = (from, to) => measure(words.slice(from, to).join(' '))
  let best = null
  const consider = (breaks) => {
    const bounds = [0, ...breaks, words.length]
    const widths = bounds.slice(1).map((end, index) => widthOf(bounds[index], end))
    if (widths.some((width) => width > maxWidth)) return
    // 줄이 '-'·':' 같은 이음표로 시작하지 않게 한다 (앞 줄 끝에 남긴다).
    if (bounds.slice(1, -1).some((start) => /^[-–—|:·]$/.test(words[start]))) return
    const score = Math.max(...widths)
    if (!best || score < best.score - 0.001) best = { score, bounds }
  }
  for (let a = 1; a < words.length; a += 1) {
    if (lines.length === 2) consider([a])
    else for (let b = a + 1; b < words.length; b += 1) consider([a, b])
  }
  if (!best) return lines
  return best.bounds.slice(1).map((end, index) => words.slice(best.bounds[index], end).join(' '))
}

/** 같은 글은 항상 같은 배치가 나오도록 하는 32비트 해시. */
export function hashString(value) {
  let hash = 2166136261
  for (const char of String(value)) {
    hash ^= char.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
