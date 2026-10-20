/**
 * 자동 썸네일의 장면 배치를 정하는 순수 함수.
 * 공개 사이트 썸네일 kit(UI 미니어처 v2 '소프트 글래스')의 규칙과 좌표계를 그대로 따른다.
 * - 무대 16:9, 모든 값은 cqw (가로 0–100, 세로 0–56.25)
 * - 주 창 1개(아래쪽이 무대 밖으로 살짝 잘림) + 보조 카드 0–1개 + 알약 정확히 1개
 * - 핵심 라벨 ≥ 2.4cqw, 보조 ≥ 1.85cqw, 나머지 자리는 회색 막대(skeleton)
 * - 말줄임은 마지막 수단으로만 쓴다 (맞는 문구를 먼저 고른다)
 * Canvas가 없는 테스트에서도 쓸 수 있도록 글자 폭은 measure(text, style) → cqw 로 받는다.
 */
import { balanceLines, cleanText, firstPhrase, fitText, hashString, wrapText } from './thumbnailContent.js'

export const STAGE = { w: 100, h: 56.25 }

/** kit.css의 글자 스타일 (size: cqw, tracking: em). 550 굵기는 Windows 맑은 고딕에서 굵게 보여 500으로 쓴다. */
export const TYPE = {
  bar: { size: 2.6, weight: 600, tracking: -0.015 },
  h: { size: 3.6, weight: 700, tracking: -0.035, leading: 1.2 },
  h2: { size: 3, weight: 700, tracking: -0.03, leading: 1.25 },
  b: { size: 2.5, weight: 600, tracking: -0.015, leading: 1.35 },
  label: { size: 2.5, weight: 700, tracking: -0.015, leading: 1.35 },
  m: { size: 2.3, weight: 500, tracking: -0.01, leading: 1.35 },
  pill: { size: 2.65, weight: 600, tracking: -0.015 },
  num: { size: 1.7, weight: 700, tracking: 0 },
}

export const WINDOW = { r: 3, bar: 6.8, pad: 3, icon: 3.5, iconGap: 1.3, barPad: 2.6 }
export const ROW = { h: 5.6, gap: 1.2, r: 1.6, padX: 1.4, check: 2.6, checkGap: 1.2 }
export const CARD = { w: 30, r: 2.6, pad: 2.6, head: 3.4, icon: 2.8, iconGap: 1, badge: 3, badgeGap: 1.2, itemGap: 1.3 }
export const PILL = { h: 6.1, padLeft: 0.85, padRight: 2.4, pi: 4.4, icon: 2.45, gap: 1.2, maxText: 30, edge: 4, inset: 4.4 }
const SKELETON = { h: 1.3, step: 3 }
const SAFE_BOTTOM = STAGE.h - 2.4
/** 행·목차 항목으로 쓰기에 너무 짧은 글(예: '기록')은 건너뛴다. */
const MIN_LABEL_CHARS = 3

/* 유리 오브젝트 배치 (kit.js decoFor와 같은 표). 변형 0: 큰 것 오른쪽 아래, 작은 것 왼쪽 위. */
const SHAPES = ['blob', 'torus', 'orb', 'pebble', 'capsule']
const BIG = {
  blob: { o: [-11, -14], w: 44, r: 0 },
  torus: { o: [-12, -15], w: 42, r: 0 },
  orb: { o: [-10, -13], w: 38, r: 0 },
  pebble: { o: [-12, -12], w: 44, r: -10 },
  capsule: { o: [-7, -12], w: 40, r: 0 },
}
const SMALL = {
  blob: { o: [2.6, 2.2], w: 10.5 },
  torus: { o: [2.4, 2], w: 10 },
  orb: { o: [3, 2.6], w: 7.6 },
  pebble: { o: [2.4, 2.4], w: 10.5 },
  capsule: { o: [2, 1.6], w: 10 },
}

/**
 * 창 뒤에 까는 유리 오브젝트 2개(큰 것 1, 흐린 작은 것 1)의 모양과 위치.
 * 다크 무대는 흰 글자가 씻겨 보이지 않도록 큰 오브젝트를 항상 아래쪽에 둔다.
 */
export function planDeco(seed, { dark = false } = {}) {
  const v = dark ? seed % 2 : seed % 4
  const fx = v & 1
  const fy = (v >> 1) & 1
  const big = SHAPES[(seed >>> 4) % SHAPES.length]
  let small = SHAPES[(seed >>> 9) % SHAPES.length]
  if (small === big) small = SHAPES[(SHAPES.indexOf(big) + 2) % SHAPES.length]
  const place = ([dx, dy], fromLeft, fromTop) => ({
    ...(fromLeft ? { x: dx } : { right: dx }),
    ...(fromTop ? { y: dy } : { bottom: dy }),
  })
  return {
    v,
    items: [
      { shape: small, w: SMALL[small].w, rotate: 0, far: true, ...place(SMALL[small].o, !fx, !fy) },
      { shape: big, w: BIG[big].w, rotate: BIG[big].r, far: false, ...place(BIG[big].o, Boolean(fx), Boolean(fy)) },
    ],
  }
}

function linesOf(text, width, style, measure) {
  return wrapText(text, width, 99, (value) => measure(value, style))
}

function fitsLines(text, width, style, measure, maxLines) {
  const lines = linesOf(text, width, style, measure)
  return lines.length > 0 && lines.length <= maxLines
}

function planTitle(title, width, measure) {
  for (const [style, maxLines] of [[TYPE.h, 2], [TYPE.h2, 2], [TYPE.h2, 3]]) {
    if (linesOf(title, width, style, measure).length <= maxLines) {
      return { style, lines: balanceLines(title, width, maxLines, (value) => measure(value, style)) }
    }
  }
  return { style: TYPE.h2, lines: wrapText(title, width, 3, (value) => measure(value, TYPE.h2)) }
}

function isLabel(text) {
  return Array.from(cleanText(text).replace(/\s/g, '')).length >= MIN_LABEL_CHARS
}

/** 문단 미리보기: 문장 단위로 maxLines 안에 들어가는 만큼만 쓰고, 한 문장도 안 들어가면 말줄임한다. */
function previewLines(text, width, style, measure, maxLines) {
  if (maxLines < 1) return []
  const sentences = cleanText(text).split(/(?<=[.!?。])\s+/).filter(Boolean)
  let kept = ''
  for (const sentence of sentences) {
    const candidate = kept ? `${kept} ${sentence}` : sentence
    if (!fitsLines(candidate, width, style, measure, maxLines)) break
    kept = candidate
  }
  return kept
    ? linesOf(kept, width, style, measure)
    : wrapText(text, width, maxLines, (value) => measure(value, style))
}

function sameKey(value) {
  return cleanText(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

const BOUNDARY_WORD = /^(?:및|또는|그리고|혹은|[-–—&·|:]|and|or|with|for)$/i
const BOUNDARY_END = /(?:으로써|로써|으로|로|와|과|에서|에게|에|을|를|하고|하며|하여|해서)$/

/**
 * 구절이 시작될 만한 자리(조사로 끝나는 낱말 뒤, '및'·'-' 뒤)에서 자른 뒷부분들. 긴 것부터.
 * 예: '공동 작업으로 모둠 보고서 함께 쓰기' → ['모둠 보고서 함께 쓰기']
 */
export function naturalTails(text) {
  const words = cleanText(text).split(' ').filter(Boolean)
  const tails = []
  for (let start = 1; start < words.length; start += 1) {
    const previous = words[start - 1]
    if ((BOUNDARY_WORD.test(previous) || BOUNDARY_END.test(previous)) && !BOUNDARY_WORD.test(words[start])) {
      tails.push(words.slice(start).join(' '))
    }
  }
  return tails
}

function charCount(text) {
  return Array.from(cleanText(text).replace(/\s/g, '')).length
}

/**
 * 제목에서 알약 문구를 고른다 (ok: 들어가고 겹치지 않는지).
 * 부제('-'·':' 뒤) → 구절 경계 뒷부분(6자 이상) → 첫 낱말만 뺀 나머지 → 짧은 구절 경계 뒷부분 → 마지막 두 낱말.
 * 예: '수행평가 점수표를 차트로 보기' → '점수표를 차트로 보기', 'Microsoft Forms 퀴즈 만들기' → 'Forms 퀴즈 만들기'
 */
export function titlePhrase(title, ok) {
  const value = cleanText(title)
  const parts = value.split(/\s+[-–—|:]\s+|:\s+/).map((part) => part.trim()).filter(Boolean)
  const words = value.split(' ').filter(Boolean)
  const tails = naturalTails(value).filter(ok)
  const firstDropped = words.length > 2 && !BOUNDARY_WORD.test(words[1]) ? words.slice(1).join(' ') : ''
  const candidates = [
    ...(parts.length > 1 ? [...parts.slice(1), parts[0]] : []),
    tails.find((tail) => charCount(tail) >= 6),
    firstDropped,
    tails[0],
    words.length > 2 ? words.slice(-2).join(' ') : '',
  ]
  return candidates.find((text) => text && ok(text)) || ''
}

/**
 * 알약 문구: 한국어 12자 안팎, 말줄임 없이 한 줄, 창·카드에 이미 보이는 글과 겹치지 않게.
 * 요약 첫 구절 → 제목 조각 → 요약의 뒷부분 → 쓰지 않은 소제목·목록 → 본문 첫 구절 → 제목 순으로 맞는 것을 쓴다.
 */
export function pickPillText(content, { measure, used = [] }) {
  const usedKeys = new Set([content.title, ...used].map(sameKey))
  const ok = (text) => {
    const value = cleanText(text)
    return Array.from(value).length >= 3
      && measure(value, TYPE.pill) <= PILL.maxText
      && !usedKeys.has(sameKey(value))
  }
  const summaryPhrase = firstPhrase(content.summary)
  const candidates = [
    summaryPhrase,
    titlePhrase(content.title, ok),
    ...naturalTails(summaryPhrase).filter((tail) => tail.includes(' ')),
    ...content.headings,
    ...content.items,
    ...content.paragraphs.slice(0, 2).map(firstPhrase),
  ]
  const picked = candidates.map((text) => cleanText(text)).find((text) => text && ok(text))
  if (picked) return picked
  const title = cleanText(content.title)
  if (measure(title, TYPE.pill) <= PILL.maxText) return title
  return fitText(title, PILL.maxText, (value) => measure(value, TYPE.pill))
}

function pillWidth(text, measure) {
  return PILL.padLeft + PILL.pi + PILL.gap + measure(text, TYPE.pill) + PILL.padRight
}

function planOutlineCard(headings, { x, y, bottomLimit, measure }) {
  const textWidth = CARD.w - CARD.pad * 2 - CARD.badge - CARD.badgeGap
  const lineHeight = TYPE.m.size * TYPE.m.leading
  const items = []
  let cursor = y + CARD.pad + CARD.head + 1.6 + 0.15 + 1.8
  for (const heading of headings) {
    if (items.length >= 4) break
    if (!isLabel(heading) || !fitsLines(heading, textWidth, TYPE.m, measure, 2)) continue
    const lines = balanceLines(heading, textWidth, 2, (value) => measure(value, TYPE.m))
    const height = lines.length * lineHeight
    if (cursor + height + CARD.pad > bottomLimit) break
    items.push({ number: items.length + 1, lines, y: cursor, text: heading })
    cursor += height + CARD.itemGap
  }
  if (items.length < 2) return null
  const height = cursor - CARD.itemGap + CARD.pad - y
  return { kind: 'outline', icon: 'text_bullet_list_ltr', label: '목차', x, y, w: CARD.w, h: height, items, lineHeight }
}

function planSummaryCard(text, { x, y, bottomLimit, measure }) {
  const width = CARD.w - CARD.pad * 2
  const lineHeight = TYPE.m.size * TYPE.m.leading
  const top = y + CARD.pad + CARD.head + 1.6 + 0.15 + 1.8
  const maxLines = Math.min(5, Math.floor((bottomLimit - CARD.pad - top) / lineHeight))
  const lines = previewLines(text, width, TYPE.m, measure, maxLines)
  if (lines.length < 2) return null
  return {
    kind: 'summary',
    icon: 'lightbulb',
    label: '요약',
    x,
    y,
    w: CARD.w,
    h: top + lines.length * lineHeight + CARD.pad - y,
    items: [],
    paragraph: { lines, y: top },
    lineHeight,
  }
}

function cardWindow(windowOnLeft) {
  return { x: windowOnLeft ? PILL.edge : STAGE.w - PILL.edge - 59, y: 9.5, w: 59, h: 50 }
}

const WIDE_WINDOW = { x: 10, y: 12.5, w: 80, h: 48 }

function rowCandidates(content, card) {
  const usedInCard = new Set((card?.items || []).map((item) => item.text))
  return content.items.length ? content.items : content.headings.filter((text) => !usedInCard.has(text))
}

/** 창 안: 제목 → 체크 행(첫 행 강조) 또는 문단 미리보기 → 회색 막대. */
function layoutWindow(win, { content, card, paragraphText, measure, seed }) {
  const innerX = win.x + WINDOW.pad
  const innerW = win.w - WINDOW.pad * 2
  const contentTop = win.y + WINDOW.bar + 3.2
  const title = planTitle(content.title, innerW, measure)
  const titleLineHeight = title.style.size * title.style.leading
  let cursor = contentTop + title.lines.length * titleLineHeight + 2.4

  const rowTextWidth = innerW - ROW.padX * 2 - ROW.check - ROW.checkGap
  const rows = []
  for (const text of rowCandidates(content, card)) {
    if (rows.length >= 3 || cursor + ROW.h > SAFE_BOTTOM) break
    if (!isLabel(text) || !fitsLines(text, rowTextWidth, TYPE.b, measure, 1)) continue
    rows.push({ text: cleanText(text), x: innerX, y: cursor, w: innerW, h: ROW.h, highlight: rows.length === 0 })
    cursor += ROW.h + ROW.gap
  }

  let paragraph = null
  if (!rows.length && paragraphText) {
    const lineHeight = TYPE.m.size * TYPE.m.leading
    const maxLines = Math.min(3, Math.floor((SAFE_BOTTOM - cursor) / lineHeight))
    const lines = previewLines(paragraphText, innerW, TYPE.m, measure, maxLines)
    if (lines.length) {
      paragraph = { lines, x: innerX, y: cursor, lineHeight }
      cursor += lines.length * lineHeight + 1.2
    }
  }

  const skeleton = []
  const widths = [0.92, 0.74, 0.86, 0.62, 0.8]
  for (let y = cursor + 0.8, index = seed % widths.length; y < STAGE.h + SKELETON.h; y += SKELETON.step, index += 1) {
    skeleton.push({ x: innerX, y, w: innerW * widths[index % widths.length], h: SKELETON.h })
  }

  return {
    title: { style: title.style, lines: title.lines, x: innerX, y: contentTop, lineHeight: titleLineHeight },
    rows,
    paragraph,
    skeleton,
    rowTextWidth,
  }
}

/**
 * 글 내용(extractThumbnailContent 결과)으로 장면을 배치한다.
 * 소제목이 둘 이상이면 목차 카드, 없으면 본문 첫 문단 요약 카드를 곁들이고, 둘 다 없으면 넓은 창 하나만 둔다.
 * 같은 글은 항상 같은 배치(창 좌우, 알약 위아래, 유리 오브젝트)가 나온다.
 * @param {{ title: string, summary: string, headings: string[], items: string[], paragraphs: string[] }} content
 * @param {{ app: string, dark?: boolean, measure: (text: string, style: object) => number }} options
 */
export function planThumbnailScene(content, { app, dark = false, measure }) {
  const seed = hashString(`${app}/${content.title}`)
  const windowOnLeft = Boolean((seed >>> 13) & 1)
  const sideX = windowOnLeft ? STAGE.w - PILL.edge - CARD.w : PILL.edge
  const paragraphText = content.paragraphs.find((text) => sameKey(text) !== sameKey(content.summary))
    || content.paragraphs[0]
    || content.summary

  let pillAtBottom = Boolean((seed >>> 17) & 1)
  let card = pillAtBottom
    ? planOutlineCard(content.headings, { x: sideX, y: 9.5, bottomLimit: STAGE.h - PILL.inset - PILL.h - 2.4, measure })
    : null
  if (!card) {
    pillAtBottom = false
    card = planOutlineCard(content.headings, { x: sideX, y: 17, bottomLimit: STAGE.h - 3, measure })
  }

  // 목차가 없을 때: 창의 행으로 쓸 글이 있으면 본문 첫 문단을 요약 카드로 곁들인다.
  if (!card && paragraphText) {
    const probe = layoutWindow(cardWindow(windowOnLeft), { content, card: null, paragraphText: '', measure, seed })
    if (probe.rows.length) {
      card = planSummaryCard(paragraphText, { x: sideX, y: 17, bottomLimit: STAGE.h - 3, measure })
    }
  }

  const win = card ? cardWindow(windowOnLeft) : { ...WIDE_WINDOW }
  const inner = layoutWindow(win, {
    content,
    card,
    paragraphText: card?.kind === 'summary' ? '' : paragraphText,
    measure,
    seed,
  })

  const used = [...inner.rows.map((row) => row.text), ...(card?.items || []).map((item) => item.text)]
  const pillText = pickPillText(content, { measure, used })
  const pw = pillWidth(pillText, measure)
  const pillOnLeft = card ? !windowOnLeft : windowOnLeft
  const pill = {
    text: pillText,
    x: pillOnLeft ? PILL.edge : STAGE.w - PILL.edge - pw,
    y: pillAtBottom && card ? STAGE.h - PILL.inset - PILL.h : PILL.inset,
    w: pw,
    h: PILL.h,
  }

  return {
    seed,
    dark,
    deco: planDeco(seed, { dark }),
    window: { ...win, r: WINDOW.r },
    title: inner.title,
    rows: inner.rows,
    paragraph: inner.paragraph,
    skeleton: inner.skeleton,
    card,
    pill,
  }
}
