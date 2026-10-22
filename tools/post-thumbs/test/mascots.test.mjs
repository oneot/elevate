import { strict as assert } from 'node:assert'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { ROOT } from '../lib/posts.mjs'
import {
  MASCOT_NAMES, MASCOT_POSES, MASCOT_RULES, assignMascots, characterOf, checkMascots, hasMascots, mascotAssignmentProblem, mascotTask, mascotsFromEnv, maskCount, pickMascots,
  readMascotRecords, visibleMascotPixels,
} from '../lib/mascots.mjs'
import { assignedMascots } from '../render.mjs'

/** rand(n)가 차례로 돌려줄 값 (테스트용). */
const sequence = (...values) => {
  let i = 0
  return (n) => {
    const value = values[i++]
    assert.ok(value >= 0 && value < n, `rand(${n}) got ${value}`)
    return value
  }
}

describe('GitHub mascot assignment', () => {
  it('draws from the fifteen poses the user sent, five per character, all in assets/mascots', () => {
    assert.deepEqual(Object.keys(MASCOT_POSES), ['copilot', 'ducky', 'mona'])
    assert.equal(MASCOT_NAMES.length, 15)
    for (const poses of Object.values(MASCOT_POSES)) assert.equal(poses.length, 5)
    for (const name of MASCOT_NAMES) assert.ok(existsSync(join(ROOT, 'assets/mascots', `${name}.png`)), `${name}.png`)
    assert.ok(!MASCOT_NAMES.includes('mona-front-lg'))
    assert.equal(characterOf('ducky-up'), 'ducky')
    assert.equal(characterOf('unknown'), null)
  })

  it('gives GitHub posts mascots and leaves every other app alone', () => {
    assert.equal(hasMascots('github'), true)
    for (const app of ['m365', 'copilot', 'copilot-studio', 'teams', 'word', 'azure']) assert.equal(hasMascots(app), false)
  })

  it('picks one or two mascots of different characters with the hero first', () => {
    // count 1+1=2, copilot (0 of copilot/ducky/mona), pose 4 → copilot-down, then mona (1 of ducky/mona), pose 2 → mona-side
    assert.deepEqual(pickMascots(sequence(1, 0, 4, 1, 2)), ['copilot-down', 'mona-side'])
    assert.deepEqual(pickMascots(sequence(0, 1, 0)), ['ducky-front'])
  })

  it('varies the number, characters and poses from post to post', () => {
    const counts = new Set()
    const heroes = new Set()
    const poses = new Set()
    for (let i = 0; i < 3000; i += 1) {
      const picked = pickMascots()
      assert.equal(mascotAssignmentProblem(picked), null, picked.join(','))
      counts.add(picked.length)
      heroes.add(characterOf(picked[0]))
      for (const name of picked) poses.add(name)
    }
    assert.deepEqual([...counts].sort(), [1, 2])
    assert.equal(heroes.size, 3)
    assert.equal(poses.size, MASCOT_NAMES.length)
  })

  it('prefers the characters and poses other GitHub posts use least', () => {
    const used = [...MASCOT_POSES.ducky, ...MASCOT_POSES.mona, 'copilot-front', 'copilot-34']
    // 한 마리, 남은 캐릭터는 Copilot뿐, 안 쓴 자세 side·turn·down 중 둘째(turn)
    assert.deepEqual(pickMascots(sequence(0, 0, 1), used), ['copilot-turn'])
    for (let i = 0; i < 300; i += 1) {
      const picked = pickMascots(undefined, ['mona-tilt', 'ducky-side'])
      assert.equal(characterOf(picked[0]), 'copilot')
      assert.ok(!picked.includes('mona-tilt') && !picked.includes('ducky-side'), picked.join(','))
    }
  })

  it('assigns the GitHub posts of one run in turn so they never repeat a pose and share the characters evenly', () => {
    const items = ['github', 'github-pages', 'agent-to-website', 'github-copilot', 'copilot-studio-multi-model-ai-agent-github-pages']
      .map((slug) => ({ key: `github/${slug}`, category: 'github', slug }))
    for (let run = 0; run < 500; run += 1) {
      const assigned = assignMascots([...items, { key: 'word/wordonline1', category: 'word' }])
      assert.equal('mascots' in assigned[5], false)
      const all = assigned.slice(0, 5).flatMap((item) => item.mascots)
      assert.equal(new Set(all).size, all.length, all.join(','))
      const perCharacter = Object.keys(MASCOT_POSES).map((character) => all.filter((name) => characterOf(name) === character).length)
      assert.ok(Math.max(...perCharacter) - Math.min(...perCharacter) <= 1, perCharacter.join(','))
    }
  })

  it('avoids what other posts already have but not the old mascots of a post being drawn again', () => {
    const records = new Map([['github/other', ['mona-tilt', 'ducky-side']], ['github/again', ['copilot-front']]])
    // github/again의 예전 배정은 셈하지 않으므로 Copilot(쓰임 0)의 첫 자세 copilot-front도 고를 수 있다.
    assert.deepEqual(assignMascots([{ key: 'github/again', category: 'github' }], records, sequence(0, 0, 0))[0].mascots, ['copilot-front'])
    for (let i = 0; i < 300; i += 1) {
      const [item] = assignMascots([{ key: 'github/new', category: 'github' }], records)
      assert.ok(!item.mascots.some((name) => ['mona-tilt', 'ducky-side', 'copilot-front'].includes(name)), item.mascots.join(','))
    }
  })

  it('reads the assignments kept in the GitHub version records', () => {
    const root = mkdtempSync(join(tmpdir(), 'mascot-records-'))
    try {
      assert.equal(readMascotRecords(root).size, 0)
      mkdirSync(join(root, 'sources/github'), { recursive: true })
      writeFileSync(join(root, 'sources/github/a.json'), JSON.stringify({ key: 'github/a', mascots: ['mona-tilt', 'copilot-34'] }))
      writeFileSync(join(root, 'sources/github/b.json'), JSON.stringify({ key: 'github/b' }))
      writeFileSync(join(root, 'sources/github/c.json'), '{')
      writeFileSync(join(root, 'sources/github/d.json'), JSON.stringify({ key: 'github/d', mascots: ['mona-front-lg'] }))
      assert.deepEqual([...readMascotRecords(root)], [['github/a', ['mona-tilt', 'copilot-34']]])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('takes the assignment plan passed to prepare (MASCOTS) as JSON from Actions or a comma list', () => {
    for (const none of [undefined, '', '  ', 'null']) assert.equal(mascotsFromEnv(none), null)
    assert.deepEqual(mascotsFromEnv('[\n  "mona-tilt",\n  "ducky-side"\n]'), ['mona-tilt', 'ducky-side'])
    assert.deepEqual(mascotsFromEnv('copilot-34, ducky-up'), ['copilot-34', 'ducky-up'])
    assert.throws(() => mascotsFromEnv('mona-tilt,mona-34'), /MASCOTS: 두 마리는 서로 다른 캐릭터/)
    assert.throws(() => mascotsFromEnv('["octocat"]'), /MASCOTS: 알 수 없는 마스코트/)
  })

  it('accepts only one or two known mascots of different characters', () => {
    assert.equal(mascotAssignmentProblem(['mona-tilt']), null)
    assert.equal(mascotAssignmentProblem(['mona-tilt', 'ducky-side']), null)
    for (const bad of [undefined, null, [], ['mona-tilt', 'ducky-side', 'copilot-34'], 'mona-tilt']) assert.match(mascotAssignmentProblem(bad), /1~2마리/)
    assert.match(mascotAssignmentProblem(['mona-front-lg']), /알 수 없는/)
    assert.match(mascotAssignmentProblem(['mona-tilt', 'mona-34']), /서로 다른 캐릭터/)
  })

  it('tells the AI which mascots to draw, how big and where, only for GitHub posts', () => {
    assert.equal(mascotTask(null), '')
    assert.equal(mascotTask([]), '')
    const two = mascotTask(['mona-tilt', 'ducky-side'])
    assert.match(two, /^\n\n## GitHub 마스코트/)
    assert.match(two, /2마리/)
    assert.ok(two.includes("K.mascot('mona-tilt', { …, w: 22~28 })") && two.includes("K.mascot('ducky-side', { …, w: 15~19 })"))
    assert.ok(two.includes('assets/mascots/mona-tilt.png') && two.includes('assets/mascots/ducky-side.png'))
    const one = mascotTask(['copilot-34'])
    assert.match(one, /1마리/)
    assert.doesNotMatch(one, /둘째/)
  })

  it('keeps the task of other apps exactly as before', () => {
    const template = readFileSync(join(ROOT, 'TASK.md'), 'utf8')
    assert.equal(template.match(/\{\{MASCOTS\}\}/g)?.length, 1)
    assert.ok(template.includes('{{MODE}}{{MASCOTS}}\n\n## 읽을 것'))
    // prepare.mjs와 같은 치환: GitHub가 아니면 {{MASCOTS}} 자리에 아무것도 들어가지 않는다.
    const fill = (text, values) => text.replace(/\{\{(\w+)\}\}/g, (match, name) => values[name] ?? match)
    const values = { MODE: '처음 만드는 썸네일이다.', MASCOTS: mascotTask(null) }
    assert.equal(fill(template, values), fill(template.replace('{{MASCOTS}}', ''), values))
  })

  it('reads the assignment prepare left in the work folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'mascots-'))
    try {
      assert.equal(assignedMascots('github/github', root), null)
      mkdirSync(join(root, 'work/github__github'), { recursive: true })
      writeFileSync(join(root, 'work/github__github/source.json'), JSON.stringify({ key: 'github/github', mascots: ['mona-34', 'copilot-turn'] }))
      assert.deepEqual(assignedMascots('github/github', root), ['mona-34', 'copilot-turn'])
      writeFileSync(join(root, 'work/github__github/source.json'), JSON.stringify({ key: 'github/github' }))
      assert.equal(assignedMascots('github/github', root), null)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('GitHub mascot audit', () => {
  const big = (name, w = 24, visible = 0.95) => ({ name, w, visible })

  it('passes mascots drawn as assigned, big, visible and away from the text', () => {
    assert.deepEqual(checkMascots({ assigned: ['mona-tilt', 'ducky-side'], placed: [big('ducky-side', 16), big('mona-tilt', 25)], texts: [{ text: 'SMS', area: 0.4 }], tiles: [0.05], floats: 1 }), [])
    assert.deepEqual(checkMascots({ assigned: ['copilot-34'], placed: [big('copilot-34', MASCOT_RULES.hero.min)] }), [])
  })

  it('rejects missing, extra, swapped or repeated mascots', () => {
    const assigned = ['mona-tilt', 'ducky-side']
    for (const placed of [[], [big('mona-tilt')], [big('mona-tilt'), big('ducky-side', 16), big('copilot-34', 16)], [big('mona-34'), big('ducky-side', 16)], [big('mona-tilt'), big('mona-tilt', 16)]]) {
      const problems = checkMascots({ assigned, placed })
      assert.match(problems[0], /배정된 마스코트만 한 번씩 넣습니다: mona-tilt\(주인공\), ducky-side\(둘째\)/, placed.map((m) => m.name).join(','))
    }
  })

  it('asks for one or two mascots when there is no assignment', () => {
    assert.match(checkMascots({ placed: [] })[0], /1~2마리 .*지금 0마리/)
    assert.match(checkMascots({ placed: [big('mona-tilt'), big('ducky-side', 16), big('copilot-34', 16)] })[0], /지금 3마리/)
    assert.deepEqual(checkMascots({ placed: [big('ducky-side', 16), big('mona-tilt', 24)] }), [])
  })

  it('rejects mascots as small as the old cards, giant ones and a second one bigger than the hero', () => {
    assert.match(checkMascots({ assigned: ['mona-tilt'], placed: [big('mona-tilt', 11)] }).join(), /주인공 마스코트\(mona-tilt\) 너비가 11\.0cqw입니다\. w 22~28/)
    assert.match(checkMascots({ assigned: ['mona-tilt', 'ducky-side'], placed: [big('mona-tilt', 24), big('ducky-side', 12)] }).join(), /둘째 마스코트\(ducky-side\) 너비가 12\.0cqw/)
    assert.match(checkMascots({ assigned: ['mona-tilt'], placed: [big('mona-tilt', 34)] }).join(), /34\.0cqw입니다\. 30 이하로/)
    assert.match(checkMascots({ assigned: ['mona-tilt', 'ducky-side'], placed: [big('mona-tilt', 21), big('ducky-side', 26)] }).join(), /주인공\(mona-tilt, 21\.0cqw\)보다 큽니다/)
  })

  it('rejects mascots hidden behind the UI or cut off by the stage', () => {
    const problems = checkMascots({ assigned: ['copilot-front'], placed: [big('copilot-front', 24, 0.45)] })
    assert.deepEqual(problems, ['주인공 마스코트(copilot-front)가 45%만 보입니다 (창·카드·다른 요소 뒤나 무대 밖). 60% 이상 보이게 옮깁니다.'])
    assert.match(checkMascots({ assigned: ['copilot-front'], placed: [big('copilot-front', 24, 0.599)] }).join(), /59%만 보입니다/)
    assert.deepEqual(checkMascots({ assigned: ['copilot-front'], placed: [big('copilot-front', 24, MASCOT_RULES.visible)] }), [])
  })

  it('rejects faded or blurred mascots that the screenshots would still count as seen', () => {
    const faded = (extra) => checkMascots({ assigned: ['mona-34'], placed: [{ ...big('mona-34'), ...extra }] })
    assert.deepEqual(faded({ opacity: 0.5 }), ['주인공 마스코트(mona-34)를 흐리거나 투명하게 두지 않습니다. 선명하고 불투명하게 둡니다.'])
    assert.equal(faded({ blur: true }).length, 1)
    assert.deepEqual(faded({ opacity: 1, blur: false }), [])
  })

  it('rejects mascots over text or the app tile and more than one floating piece', () => {
    const texts = [{ text: 'Create account', area: 6.2 }, { text: 'Email', area: 1.2 }, { text: 'kim@school.kr', area: 0.3 }, { text: 'A', area: 2 }, { text: 'B', area: 3 }]
    const problems = checkMascots({ assigned: ['mona-tilt'], placed: [big('mona-tilt')], texts, tiles: [0.4], floats: 2 })
    assert.deepEqual(problems, [
      '마스코트가 글자를 가립니다: "Create account", "Email", "A" 외 1개. 글자가 없는 곳으로 옮기거나 창 뒤(z)로 보냅니다.',
      '마스코트가 앱 타일을 40% 가립니다. 타일과 겹치지 않게 둡니다.',
      'GitHub 장면은 K.float를 1개까지 둡니다 (지금 2개). 마스코트가 놀이 요소를 맡습니다.',
    ])
  })
})

describe('mascot pixels', () => {
  // 6×4 RGB 이미지. 마스코트(빨강)는 x 1~4, y 1~2에 그려지고, all에서는 창(흰색)이 x 3~4를 덮는다.
  const info = { width: 6, height: 4, channels: 3 }
  const image = (paint) => {
    const data = Buffer.alloc(info.width * info.height * 3, 0)
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const [r, g, b] = paint(x, y)
        data.set([r, g, b], (y * info.width + x) * 3)
      }
    }
    return data
  }
  const mascot = (x, y) => x >= 1 && x <= 4 && y >= 1 && y <= 2
  const window = (x) => x >= 3
  const green = [0, 255, 0]
  const shots = {
    top: image((x, y) => (mascot(x, y) ? [220, 40, 40] : window(x) ? [255, 255, 255] : green)),
    hid: image((x) => (window(x) ? [255, 255, 255] : green)),
    all: image((x, y) => (window(x) ? [255, 255, 255] : mascot(x, y) ? [220, 40, 40] : green)),
  }

  it('counts only the mascot pixels that nothing covers', () => {
    const { mask, visible } = visibleMascotPixels(shots, info, { x: 0, y: 0, w: 6, h: 4 })
    assert.equal(visible, 4)
    assert.equal(maskCount(mask, info, { x: 1, y: 1, w: 2, h: 2 }), 4)
    assert.equal(maskCount(mask, info, { x: 3, y: 0, w: 3, h: 4 }), 0)
  })

  it('does not count a mascot seen faintly through frosted glass', () => {
    const glass = { ...shots, all: image((x, y) => (window(x) && mascot(x, y) ? [245, 210, 210] : window(x) ? [255, 255, 255] : mascot(x, y) ? [220, 40, 40] : green)) }
    assert.equal(visibleMascotPixels(glass, info, { x: 0, y: 0, w: 6, h: 4 }).visible, 4)
  })

  it('looks only inside the mascot box and the image', () => {
    assert.equal(visibleMascotPixels(shots, info, { x: 2, y: -3, w: 1, h: 20 }).visible, 2)
    assert.equal(visibleMascotPixels(shots, info, { x: -5, y: -5, w: 3, h: 3 }).visible, 0)
  })
})
