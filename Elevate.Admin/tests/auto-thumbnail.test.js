// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  balanceLines,
  cleanText,
  extractThumbnailContent,
  firstPhrase,
  hashString,
  stripEnumeration,
  wrapText,
} from '../src/utils/thumbnailContent.js'
import {
  PILL,
  STAGE,
  TYPE,
  naturalTails,
  pickPillText,
  planDeco,
  planThumbnailScene,
  titlePhrase,
} from '../src/utils/thumbnailLayout.js'

/** 브라우저 글꼴 폭과 비슷한 고정 폭 (em). Canvas가 없는 jsdom에서 배치 규칙만 확인한다. */
function measure(text, style) {
  let em = 0
  for (const char of Array.from(String(text))) {
    if (/[\u3131-\uD79D]/.test(char)) em += 0.9
    else if (/[A-Z]/.test(char)) em += 0.64
    else if (/[a-z]/.test(char)) em += 0.52
    else if (/\d/.test(char)) em += 0.56
    else if (char === ' ') em += 0.26
    else em += 0.36
  }
  return em * style.size
}

const fits = (text) => measure(text, TYPE.pill) <= PILL.maxText

function content(overrides = {}) {
  return { title: '공동 작업으로 모둠 보고서 함께 쓰기', summary: '', headings: [], items: [], paragraphs: [], ...overrides }
}

describe('thumbnail text helpers', () => {
  it('cleans tags, entities and emoji the public cards never show', () => {
    expect(cleanText('⛏️ <b>Minecraft</b>&nbsp;수업 👩‍🏫 &amp; 놀이')).toBe('Minecraft 수업 & 놀이')
  })

  it('strips numbering and trailing punctuation from headings and list items', () => {
    expect(stripEnumeration('1. 소개')).toBe('소개')
    expect(stripEnumeration('STEP 2) 정리하기')).toBe('정리하기')
    expect(stripEnumeration('① 준비물')).toBe('준비물')
    expect(stripEnumeration('- 모듈 생성')).toBe('모듈 생성')
    expect(stripEnumeration('이제 아래가 자동으로 관리됩니다:')).toBe('이제 아래가 자동으로 관리됩니다')
  })

  it('keeps the first phrase without cutting after numbers', () => {
    expect(firstPhrase('5. Forms 퀴즈 만들기 및 기능')).toBe('Forms 퀴즈 만들기 및 기능')
    expect(firstPhrase('링크 하나로 함께 편집합니다. 두 번째 문장')).toBe('링크 하나로 함께 편집합니다')
    expect(firstPhrase('')).toBe('')
  })

  it('reads headings, own list text and real paragraphs from editor HTML', () => {
    const html = [
      '<h2>1. 문서 공유하기</h2>',
      '<p>공유 버튼을 눌러 권한을 정합니다.</p>',
      '<ul><li><p>편집 권한으로 링크 보내기</p><ul><li><p>안쪽 항목</p></li></ul></li><li><p>메모 남기기</p></li></ul>',
      '<h3>공동 작업으로 모둠 보고서 함께 쓰기</h3>',
      '<blockquote><p>인용 문단</p></blockquote>',
      '<img src="https://example.test/screen.png">',
    ].join('')
    const result = extractThumbnailContent({ title: '공동 작업으로 모둠 보고서 함께 쓰기', excerpt: '<p>요약&nbsp;문장</p>', html })
    expect(result).toEqual({
      title: '공동 작업으로 모둠 보고서 함께 쓰기',
      summary: '요약 문장',
      headings: ['문서 공유하기'],
      items: ['편집 권한으로 링크 보내기', '안쪽 항목', '메모 남기기'],
      paragraphs: ['공유 버튼을 눌러 권한을 정합니다.', '인용 문단'],
    })
    expect(extractThumbnailContent({ title: '  ', html: '' }).title).toBe('새 게시글')
  })

  it('wraps by words, splits long words and adds an ellipsis only past the line limit', () => {
    const width = (text) => Array.from(text).length
    expect(wrapText('하나 둘 셋 넷', 5, 3, width)).toEqual(['하나 둘', '셋 넷'])
    expect(wrapText('가나다라마바사', 3, 3, width)).toEqual(['가나다', '라마바', '사'])
    expect(wrapText('하나 둘 셋 넷 다섯 여섯', 5, 2, width)).toEqual(['하나 둘', '셋 넷…'])
  })

  it('balances title lines instead of leaving one word alone', () => {
    const width = (text) => measure(text, TYPE.h)
    const title = '조선소 용접 품질 및 작업 지원 AI Agent 구축'
    expect(wrapText(title, 62, 2, width).at(-1)).toBe('구축')
    const lines = balanceLines(title, 62, 2, width)
    expect(lines).toHaveLength(2)
    expect(lines.join(' ')).toBe(title)
    expect(lines[1].split(' ').length).toBeGreaterThan(1)
    for (const box of [40, 46, 52, 58]) {
      const dashed = balanceLines('Onenote로 자료 정리하기 기초 - 기본 기능부터 유용한 Tip까지', box, 3, width)
      expect(dashed.slice(1).some((line) => line.startsWith('-')), dashed.join(' / ')).toBe(false)
    }
  })

  it('hashes deterministically', () => {
    expect(hashString('word/제목')).toBe(hashString('word/제목'))
    expect(hashString('word/제목')).not.toBe(hashString('excel/제목'))
  })
})

describe('pill phrase', () => {
  it('starts phrases where a Korean phrase can start', () => {
    expect(naturalTails('공동 작업으로 모둠 보고서 함께 쓰기')).toEqual(['모둠 보고서 함께 쓰기'])
    expect(naturalTails('조선소 용접 품질 및 작업 지원 AI Agent 구축')).toEqual(['작업 지원 AI Agent 구축'])
  })

  it.each([
    ['공동 작업으로 모둠 보고서 함께 쓰기', '모둠 보고서 함께 쓰기'],
    ['조선소 용접 품질 및 작업 지원 AI Agent 구축', '작업 지원 AI Agent 구축'],
    ['수행평가 점수표를 차트로 보기', '점수표를 차트로 보기'],
    ['Microsoft Forms 퀴즈 만들기', 'Forms 퀴즈 만들기'],
    ['깃허브 페이지에 코파일럿 스튜디오 에이전트 배포하기', '에이전트 배포하기'],
    ['Azure Functions 공지 챗봇 - 비밀 키 보호까지', '비밀 키 보호까지'],
  ])('%s → %s', (title, expected) => {
    expect(titlePhrase(title, fits)).toBe(expected)
  })

  it('prefers a short summary, skips text already on the thumbnail and never overflows', () => {
    expect(pickPillText(content({ summary: '템플릿으로 바로 완성. 자세한 설명' }), { measure })).toBe('템플릿으로 바로 완성')
    expect(pickPillText(content(), { measure, used: ['모둠 보고서 함께 쓰기'] })).not.toBe('모둠 보고서 함께 쓰기')
    for (const title of ['짧은 글', 'A'.repeat(80), '아주 긴 제목이 계속 이어지는 글 '.repeat(4)]) {
      const text = pickPillText(content({ title }), { measure })
      expect(measure(text, TYPE.pill)).toBeLessThanOrEqual(PILL.maxText + 0.01)
      expect(text.length).toBeGreaterThan(0)
    }
  })
})

describe('scene plan (kit coordinates in cqw)', () => {
  const structured = content({
    summary: '링크 하나로 모둠원이 같은 문서를 동시에 편집합니다.',
    headings: ['문서 공유하기', '메모로 피드백', '버전 기록 살펴보기'],
    items: ['편집 권한으로 링크 보내기', '메모로 의견 남기기', '변경 내용 추적 켜기', '기록'],
    paragraphs: ['공유 버튼을 눌러 권한을 정합니다.'],
  })

  it('places glass objects from the kit table, keeping big objects low on the dark stage', () => {
    for (let seed = 0; seed < 64; seed += 1) {
      const light = planDeco(seed)
      const [small, big] = light.items
      expect(small.far).toBe(true)
      expect(big.far).toBe(false)
      expect(small.shape).not.toBe(big.shape)
      expect('x' in big).toBe(Boolean(light.v & 1))
      expect('y' in big).toBe(Boolean(light.v & 2))
      expect('x' in small).toBe(!(light.v & 1))
      expect(planDeco(seed, { dark: true }).items[1]).toHaveProperty('bottom')
    }
  })

  it('builds a window with checked rows, an outline card and one pill inside the stage', () => {
    const scene = planThumbnailScene(structured, { app: 'word', measure })
    expect(scene).toEqual(planThumbnailScene(structured, { app: 'word', measure }))
    expect(scene.card.kind).toBe('outline')
    expect(scene.card.items.map((item) => item.text)).toEqual(structured.headings)
    expect(scene.rows.map((row) => row.text)).toEqual(['편집 권한으로 링크 보내기', '메모로 의견 남기기', '변경 내용 추적 켜기'])
    expect(scene.rows.map((row) => row.highlight)).toEqual([true, false, false])
    for (const row of scene.rows) expect(row.y + row.h).toBeLessThanOrEqual(STAGE.h - 2.4)
    expect(scene.title.style).toBe(TYPE.h)

    const { window: win, card, pill } = scene
    expect(win.w).toBe(59)
    expect(card.x + card.w <= win.x || card.x >= win.x + win.w).toBe(true)
    expect(card.y + card.h).toBeLessThanOrEqual(STAGE.h - 3)
    expect(pill.x).toBeGreaterThanOrEqual(PILL.edge - 0.01)
    expect(pill.x + pill.w).toBeLessThanOrEqual(STAGE.w - PILL.edge + 0.01)
    expect([PILL.inset, STAGE.h - PILL.inset - PILL.h]).toContain(pill.y)
    expect(pill.text).toBe('모둠 보고서 함께 쓰기')
  })

  it('adds a summary card when there is no outline but the window has rows', () => {
    const scene = planThumbnailScene(content({
      title: '학급 상담 예약 에이전트 만들기',
      items: ['상담 가능 시간 안내', '예약 확인 메일 보내기'],
      paragraphs: ['Copilot Studio에서 토픽과 지식을 연결해 상담 예약을 자동화합니다. 예약 내용은 Excel 표에 기록됩니다.'],
    }), { app: 'copilot-studio', dark: true, measure })
    expect(scene.card.kind).toBe('summary')
    expect(scene.card.paragraph.lines.length).toBeGreaterThanOrEqual(2)
    expect(scene.paragraph).toBeNull()
    expect(scene.rows).toHaveLength(2)
  })

  it('uses one wide window when the post has only a title and a short paragraph', () => {
    const scene = planThumbnailScene(content({ title: 'Teams 새 기능 안내', paragraphs: ['짧은 공지입니다.'] }), { app: 'teams', measure })
    expect(scene.card).toBeNull()
    expect(scene.window).toMatchObject({ x: 10, w: 80 })
    expect(scene.rows).toEqual([])
    expect(scene.paragraph.lines).toEqual(['짧은 공지입니다.'])
    expect(scene.skeleton.length).toBeGreaterThan(0)
    expect(scene.pill.text).toBe('새 기능 안내')
  })

  it('shrinks long titles to the secondary heading size', () => {
    const scene = planThumbnailScene(content({
      title: 'Azure Functions와 GitHub Pages로 학교 공지 챗봇을 만들고 배포하는 전체 과정 정리 - 비밀 키 보호까지',
    }), { app: 'azure', measure })
    expect(scene.title.style).toBe(TYPE.h2)
    expect(scene.title.lines.length).toBeLessThanOrEqual(3)
  })
})
