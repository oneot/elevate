/**
 * GitHub 카드 마스코트 (2026-10-22 사용자 요청).
 *   "깃허브 게시물들은 첨부한 마스코트들이 조금 더 크게 배치가 되어서 다른 게시물들보다 조금 더 귀여운 느낌이 나면 좋을 것 같아."
 *   "마스코트가 글 당 1-2마리 랜덤하게 들어가면 좋을 듯"
 * - 배정: GitHub 글마다 마리 수(1~2)·캐릭터·자세를 코드가 무작위로 고른다. AI에게 고르게 하면 매번 비슷한 것을 고른다.
 *   다른 GitHub 글이 덜 쓴 캐릭터와 자세를 먼저 골라 카드 목록에서 같은 마스코트가 되풀이되지 않게 한다.
 *   plan(plan.mjs, redraw.mjs plan)이 한 실행의 글들을 차례로 배정해 넘기고(MASCOTS), 없으면 prepare.mjs가 고른다.
 *   작업 지시(task.md)와 글 버전 기록(source.json → sources/<앱>/<slug>.json의 mascots)에 남는다.
 *   두 마리면 서로 다른 캐릭터이고, 첫째가 주인공(더 크게)이다.
 * - 검사: render.mjs(zoom·export)가 GitHub AI 장면의 마스코트를 재고 checkMascots로 판정한다(audit).
 *   validate.mjs가 같은 렌더를 다시 하므로 배정과 다르거나, 작거나, 가려졌거나, 글자를 가리면 결과를 받지 않는다.
 * 다른 앱의 장면·작업 지시·검사는 바뀌지 않는다(hasMascots). 버전 기록 읽기(readMascotRecords) 밖은 순수 함수다 (단위 테스트 대상).
 */
import { randomInt } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './posts.mjs'

/** 캐릭터별 자세 5개 (assets/mascots/<이름>.png). 사용자가 보낸 그림 copilot_pose1~5, ducky_pose1~5, mona_pose1~5 순서다. */
export const MASCOT_POSES = {
  copilot: ['copilot-front', 'copilot-34', 'copilot-side', 'copilot-turn', 'copilot-down'],
  ducky: ['ducky-front', 'ducky-side2', 'ducky-side', 'ducky-down', 'ducky-up'],
  mona: ['mona-front', 'mona-34', 'mona-side', 'mona-34b', 'mona-tilt'],
}
export const MASCOT_NAMES = Object.values(MASCOT_POSES).flat()

/**
 * 크기는 무대 너비 기준 cqw. 주인공은 지금 카드(w 11)의 두 배쯤, 둘째는 조금 작게 둔다.
 * visible: 창·카드 뒤나 무대 밖으로 잘리지 않고 보이는 비율, opacity: 이보다 투명하면 안 됨, textArea: 마스코트가 덮어도 되는 글자 면적(cqw²),
 * tile: 앱 타일을 덮어도 되는 비율, floats: GitHub 장면의 K.float 상한(마스코트가 놀이 요소를 맡는다).
 */
export const MASCOT_RULES = {
  hero: { min: 20, from: 22, to: 28 },
  second: { min: 14, from: 15, to: 19 },
  max: 30,
  visible: 0.6,
  opacity: 0.9,
  textArea: 1,
  tile: 0.15,
  floats: 1,
}

/** 마스코트를 넣는 앱 (GitHub만). */
export const hasMascots = (category) => category === 'github'

export const characterOf = (name) => Object.keys(MASCOT_POSES).find((character) => MASCOT_POSES[character].includes(name)) || null

/**
 * 글 하나의 마스코트를 고른다: 1~2마리(반반), 서로 다른 캐릭터, 캐릭터마다 자세 5개 중 하나. 첫째가 주인공이다.
 * 다른 GitHub 글이 덜 쓴 캐릭터와 자세를 먼저 고르고, 똑같이 쓴 것 중에서는 무작위다.
 * @param {(n: number) => number} rand 0 이상 n 미만 정수 (기본 crypto.randomInt)
 * @param {string[]} used 다른 GitHub 글에 이미 배정된 마스코트 (여러 번 나오면 그만큼 많이 쓴 것)
 * @returns {string[]}
 */
export function pickMascots(rand = randomInt, used = []) {
  const uses = (name) => used.filter((usedName) => usedName === name).length
  const characterUses = (character) => MASCOT_POSES[character].reduce((sum, pose) => sum + uses(pose), 0)
  const fewest = (list, score) => {
    const least = Math.min(...list.map(score))
    return list.filter((item) => score(item) === least)
  }
  const count = 1 + rand(2)
  const characters = Object.keys(MASCOT_POSES)
  const picked = []
  for (let i = 0; i < count; i += 1) {
    const options = fewest(characters, characterUses)
    const character = options[rand(options.length)]
    characters.splice(characters.indexOf(character), 1)
    const poses = fewest(MASCOT_POSES[character], uses)
    picked.push(poses[rand(poses.length)])
  }
  return picked
}

/**
 * 한 실행에서 그릴 글들에 차례로 마스코트를 배정한다(plan.mjs, redraw.mjs plan). 앞 글의 배정도 쓴 것으로 보고 다음 글을 고르므로,
 * 여러 글을 동시에 그려도 서로 겹치지 않는다. 이번에 다시 그리는 글의 예전 배정은 셈하지 않는다.
 * @param {Array<{ key: string, category: string }>} items
 * @param {Map<string, string[]>} records 저장소 버전 기록의 GitHub 글별 배정 (readMascotRecords)
 * @returns {Array<object>} 같은 순서의 items. GitHub 글에는 mascots가 붙는다
 */
export function assignMascots(items, records = new Map(), rand = randomInt) {
  const targets = new Set(items.map((item) => item.key))
  const used = [...records].filter(([key]) => !targets.has(key)).flatMap(([, mascots]) => mascots)
  return items.map((item) => {
    if (!hasMascots(item.category)) return item
    const mascots = pickMascots(rand, used)
    used.push(...mascots)
    return { ...item, mascots }
  })
}

/** 저장소의 GitHub 글 버전 기록(sources/github/*.json)에 남은 배정: key → mascots. 배정이 없거나 올바르지 않은 기록은 뺀다. */
export function readMascotRecords(root = ROOT) {
  const dir = join(root, 'sources/github')
  const records = new Map()
  if (!existsSync(dir)) return records
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
    try {
      const { key, mascots } = JSON.parse(readFileSync(join(dir, file), 'utf8'))
      if (key && !mascotAssignmentProblem(mascots)) records.set(key, mascots)
    } catch {
      // 읽을 수 없는 기록은 배정이 없는 것으로 본다.
    }
  }
  return records
}

/**
 * plan이 넘긴 배정 (generate job의 환경 변수 MASCOTS: JSON 배열, 쉼표 목록, 없으면 빈 값이나 'null').
 * @returns {string[]|null} 없으면 null. 올바르지 않으면 오류를 던진다
 */
export function mascotsFromEnv(value) {
  const text = String(value ?? '').trim()
  if (!text || text === 'null') return null
  const list = text.startsWith('[') ? JSON.parse(text) : text.split(',').map((name) => name.trim()).filter(Boolean)
  const problem = mascotAssignmentProblem(list)
  if (problem) throw new Error(`MASCOTS: ${problem}`)
  return list
}

/** 배정이 올바른지 (1~2마리, 아는 이름, 서로 다른 캐릭터). @returns {string|null} 문제가 있으면 이유 */
export function mascotAssignmentProblem(list) {
  if (!Array.isArray(list) || list.length < 1 || list.length > 2) return '마스코트 배정은 1~2마리여야 합니다.'
  const unknown = list.filter((name) => !MASCOT_NAMES.includes(name))
  if (unknown.length) return `알 수 없는 마스코트입니다: ${unknown.join(', ')}`
  if (new Set(list.map(characterOf)).size !== list.length) return '두 마리는 서로 다른 캐릭터여야 합니다.'
  return null
}

const roles = (assigned) => assigned.map((name, i) => `${name}(${i ? '둘째' : '주인공'})`).join(', ')

/**
 * 작업 지시(TASK.md의 {{MASCOTS}})에 넣을 글. 배정이 없으면(GitHub가 아닌 앱) 빈 문자열이라 다른 앱의 작업 지시는 그대로다.
 * @param {string[]|null} assigned
 */
export function mascotTask(assigned) {
  if (!assigned?.length) return ''
  const [hero, second] = assigned
  const { hero: h, second: s, max, visible, floats } = MASCOT_RULES
  const files = assigned.map((name) => `\`assets/mascots/${name}.png\``).join(', ')
  return [
    '',
    '',
    '## GitHub 마스코트 (이 글에 배정됨)',
    '',
    `이 글에는 마스코트 ${assigned.length}마리가 무작위로 배정됐다: **\`${hero}\`(주인공)**${second ? `, \`${second}\`(둘째)` : ''}. 다른 마스코트로 바꾸거나 빼거나 더하지 않는다.`,
    'GitHub 카드는 다른 앱 카드보다 마스코트가 눈에 띄게 크고 귀여워야 한다. STYLE_GUIDE의 \'GitHub 마스코트\' 절을 따른다.',
    `- 먼저 ${files}를 view 도구로 열어 생김새와 보는 방향을 확인한다. 옆을 보는 자세는 주 화면 쪽을 보도록 \`flip\`을 정한다.`,
    `- 주인공은 \`K.mascot('${hero}', { …, w: ${h.from}~${h.to} })\`로 둔다(${h.min}cqw 미만 금지).`
      + (second ? ` 둘째는 \`K.mascot('${second}', { …, w: ${s.from}~${s.to} })\`로 주인공보다 작게 둔다(${s.min}cqw 미만 금지).` : '')
      + ` 어떤 마스코트도 ${max}cqw를 넘지 않는다.`,
    `- 창 모서리 뒤에서 내다보게 하거나(창 \`z: 2\`, 마스코트 \`z: 1\`), 창·카드 윗변에 앉히거나, 무대 가장자리에서 들어오게 해 화면과 어울리게 둔다. 마스코트마다 ${Math.round(visible * 100)}% 이상 보이고 얼굴이 가려지지 않게 한다.`,
    `- 마스코트가 글자와 앱 타일을 가리지 않는다. 자리를 만들려고 주 화면은 무대 너비의 52~64%로 조금 줄이고, \`K.float\`는 0~${floats}개만 쓴다. 앱 타일과 pill은 그대로 1개씩이다.`,
    '- `zoom`·`export`의 audit가 배정, 크기, 보이는 비율, 흐림·투명, 가린 글자, `K.float` 수를 검사한다. 경고가 0이 될 때까지 고친다.',
  ].join('\n')
}

const cqw = (value) => `${value.toFixed(1)}cqw`

/**
 * GitHub AI 장면의 마스코트 검사 (순수 함수). render.mjs가 렌더한 무대에서 잰 값을 넘긴다.
 * @param {{
 *   assigned?: string[]|null,                                  prepare가 배정한 마스코트 (없으면 1~2마리 규칙만)
 *   placed?: Array<{ name: string, w: number, visible: number, opacity?: number, blur?: boolean }>,
 *                                                              무대의 마스코트 (w: 너비 cqw, visible: 보이는 비율 0~1, opacity·blur: 흐리게 했는지)
 *   texts?: Array<{ text: string, area: number }>,             마스코트가 위를 덮은 글자 (area: 덮은 면적 cqw²)
 *   tiles?: number[],                                          앱 타일마다 마스코트가 덮은 비율
 *   floats?: number,                                           K.float 개수
 * }} measured
 * @returns {string[]} 문제 목록 (없으면 빈 배열)
 */
export function checkMascots({ assigned = null, placed = [], texts = [], tiles = [], floats = 0 } = {}) {
  const rules = MASCOT_RULES
  const problems = []
  const names = placed.map((mascot) => mascot.name)
  if (assigned?.length) {
    const exact = names.length === assigned.length && assigned.every((name) => names.filter((placedName) => placedName === name).length === 1)
    if (!exact) problems.push(`배정된 마스코트만 한 번씩 넣습니다: ${roles(assigned)} (지금 ${names.join(', ') || '없음'}).`)
  } else if (placed.length < 1 || placed.length > 2) {
    problems.push(`GitHub 장면에는 마스코트를 1~2마리 넣습니다 (지금 ${placed.length}마리).`)
  }
  // 주인공은 배정의 첫째, 배정이 없으면 가장 큰 마스코트.
  const heroName = assigned?.length ? assigned[0] : [...placed].sort((a, b) => b.w - a.w)[0]?.name
  const hero = placed.find((mascot) => mascot.name === heroName)
  for (const mascot of placed) {
    const isHero = mascot === hero
    const rule = isHero ? rules.hero : rules.second
    const label = `${isHero ? '주인공' : '둘째'} 마스코트(${mascot.name})`
    if (mascot.w < rule.min - 0.05) {
      problems.push(`${label} 너비가 ${cqw(mascot.w)}입니다. w ${rule.from}~${rule.to}로 키웁니다 (최소 ${rule.min}${isHero ? '' : ', 주인공보다 작게'}).`)
    } else if (mascot.w > rules.max + 0.05) {
      problems.push(`${label} 너비가 ${cqw(mascot.w)}입니다. ${rules.max} 이하로 줄입니다.`)
    }
    if (!isHero && hero && mascot.w > hero.w + 0.05) {
      problems.push(`${label}(${cqw(mascot.w)})가 주인공(${hero.name}, ${cqw(hero.w)})보다 큽니다. 주인공을 더 크게 둡니다.`)
    }
    if (mascot.visible < rules.visible) {
      problems.push(`${label}가 ${Math.floor(mascot.visible * 100)}%만 보입니다 (창·카드·다른 요소 뒤나 무대 밖). ${Math.round(rules.visible * 100)}% 이상 보이게 옮깁니다.`)
    }
    if ((mascot.opacity ?? 1) < rules.opacity || mascot.blur) problems.push(`${label}를 흐리거나 투명하게 두지 않습니다. 선명하고 불투명하게 둡니다.`)
  }
  const covered = texts.filter((text) => text.area >= rules.textArea)
  if (covered.length) {
    const shown = covered.slice(0, 3).map((text) => `"${text.text.slice(0, 24)}"`).join(', ')
    problems.push(`마스코트가 글자를 가립니다: ${shown}${covered.length > 3 ? ` 외 ${covered.length - 3}개` : ''}. 글자가 없는 곳으로 옮기거나 창 뒤(z)로 보냅니다.`)
  }
  const tile = Math.max(0, ...tiles)
  if (tile > rules.tile) problems.push(`마스코트가 앱 타일을 ${Math.round(tile * 100)}% 가립니다. 타일과 겹치지 않게 둡니다.`)
  if (floats > rules.floats) problems.push(`GitHub 장면은 K.float를 ${rules.floats}개까지 둡니다 (지금 ${floats}개). 마스코트가 놀이 요소를 맡습니다.`)
  return problems
}

const clampRect = (rect, width, height) => {
  const x0 = Math.max(0, Math.floor(rect.x))
  const y0 = Math.max(0, Math.floor(rect.y))
  const x1 = Math.min(width, Math.ceil(rect.x + rect.w))
  const y1 = Math.min(height, Math.ceil(rect.y + rect.h))
  return { x0, y0, x1, y1 }
}

/**
 * 마스코트 하나가 무대에서 실제로 보이는 픽셀을 센다 (render.mjs가 같은 무대를 세 번 찍어 넘긴다).
 *   all: 그대로, top: 이 마스코트만 맨 위로 올림, hid: 이 마스코트만 숨김. 셋 다 마스코트 그림자를 끄고 같은 크기로 찍은 raw 픽셀이다.
 * 마스코트 픽셀은 top과 hid가 다른 곳이고, 보이는 픽셀은 그중 all이 top과 같은 곳(위를 덮은 창·카드·글자가 없음)이다.
 * 유리 창 뒤에 비쳐 보이는 마스코트는 all과 top이 달라 보이는 픽셀로 세지 않는다.
 * @param {{ all: Buffer, top: Buffer, hid: Buffer }} shots
 * @param {{ width: number, height: number, channels: number }} info
 * @param {{ x: number, y: number, w: number, h: number }} rect 마스코트 상자 (이미지 픽셀)
 * @returns {{ mask: Uint8Array, visible: number }} mask는 이미지 전체 크기이고 보이는 픽셀이 1이다
 */
export function visibleMascotPixels({ all, top, hid }, { width, height, channels }, rect, { paint = 24, same = 8 } = {}) {
  const mask = new Uint8Array(width * height)
  const { x0, y0, x1, y1 } = clampRect(rect, width, height)
  let visible = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const p = y * width + x
      const i = p * channels
      const drawn = Math.abs(top[i] - hid[i]) + Math.abs(top[i + 1] - hid[i + 1]) + Math.abs(top[i + 2] - hid[i + 2])
      if (drawn <= paint) continue
      const covered = Math.abs(all[i] - top[i]) + Math.abs(all[i + 1] - top[i + 1]) + Math.abs(all[i + 2] - top[i + 2])
      if (covered > same) continue
      mask[p] = 1
      visible += 1
    }
  }
  return { mask, visible }
}

/** rect(이미지 픽셀) 안에서 mask가 1인 픽셀 수. */
export function maskCount(mask, { width, height }, rect) {
  const { x0, y0, x1, y1 } = clampRect(rect, width, height)
  let count = 0
  for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) count += mask[y * width + x]
  return count
}
