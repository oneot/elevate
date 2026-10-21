import { strict as assert } from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import vm from 'node:vm'
import sharp from 'sharp'
import { APPS, ROOT } from '../lib/posts.mjs'
import { startServer } from '../render.mjs'

const PALETTE = JSON.parse(readFileSync(join(ROOT, 'assets/fluid/palette.json'), 'utf8'))
const FORMS = ['fold', 'ribbon', 'sphere', 'bubbles']

/** kit.js를 브라우저 없이 불러온다 (render.html이 palette.js 다음에 불러오는 것과 같다). */
function loadKit(search = '') {
  const window = { FLUID_PALETTE: PALETTE }
  vm.runInNewContext(readFileSync(join(ROOT, 'kit.js'), 'utf8'), { window, location: { search }, URLSearchParams })
  return window
}

describe('v3 fluid kit', () => {
  it('has a colour ramp and the four fluid forms for every app', async () => {
    for (const app of APPS) {
      const ramp = PALETTE[app]
      assert.ok(Array.isArray(ramp) && ramp.length >= 4, `${app}: palette.json needs at least 4 colours`)
      for (const colour of ramp) assert.match(colour, /^#[0-9a-f]{6}$/i, `${app}: ${colour}`)
      for (const form of FORMS) {
        const file = join(ROOT, 'assets/fluid', app, `${form}.webp`)
        assert.ok(existsSync(file), `${app}/${form}.webp is missing (python3 make_fluid.py ${app})`)
        const meta = await sharp(file).metadata()
        assert.ok(meta.hasAlpha && meta.width >= 300, `${app}/${form}.webp should be a transparent image of at least 300px`)
      }
    }
  })

  it('draws every stage with the fluid skin, its ramp and fluid forms by default', () => {
    const w = loadKit()
    assert.equal(w.SKIN, 'fluid')
    w.scene('excel/sample', (K) => K.win({ x: 7, y: 9, w: 62, h: 50, title: '명렬표' }))
    const html = w.renderScene('excel/sample', 'excel')
    assert.match(html, /^<div class="tD fluid"/)
    assert.ok(html.includes(`--f1:${PALETTE.excel[0]}`) && html.includes(`--f4:${PALETTE.excel.at(-1)}`))
    assert.match(html, /assets\/fluid\/excel\/(fold|ribbon|sphere|bubbles)\.webp/)
    assert.ok(!html.includes('assets/glass/'))
  })

  it('keeps the first 80 cards drawable in the v2 skin with the glass objects', () => {
    const w = loadKit('?skin=v2')
    assert.equal(w.SKIN, 'v2')
    w.scene('excel/sample', () => '')
    const html = w.renderScene('excel/sample', 'excel')
    assert.match(html, /^<div class="tD"/)
    assert.match(html, /assets\/glass\/excel\/(blob|torus|orb|pebble|capsule)\.webp/)
    assert.ok(!html.includes('assets/fluid/'))
    // 장면이 직접 놓은 유리 오브젝트도 스킨을 따른다.
    w.scene('excel/placed', (K) => K.glass('orb', { right: 4, y: 3, w: 8 }), { deco: false })
    assert.ok(w.renderScene('excel/placed', 'excel').includes('src="assets/glass/excel/orb.webp"'))
    const fluid = loadKit()
    fluid.scene('excel/placed', (K) => K.glass('orb', { right: 4, y: 3, w: 8 }), { deco: false })
    assert.ok(fluid.renderScene('excel/placed', 'excel').includes('src="assets/fluid/excel/sphere.webp"'))
  })

  it('maps the glass shapes of existing scenes to the closest fluid form and keeps their variant', () => {
    const fluid = loadKit()
    const v2 = loadKit('?skin=v2')
    for (const w of [fluid, v2]) w.scene('word/sample', () => '', { deco: { big: 'torus', small: 'orb', v: 2 } })
    const html = fluid.renderScene('word/sample', 'word')
    assert.ok(html.includes('assets/fluid/word/fold.webp') && html.includes('assets/fluid/word/sphere.webp'))
    assert.match(html, /data-v="2"/)
    // 같은 장면은 스킨과 상관없이 같은 변형(글로우 방향)을 쓴다.
    fluid.scene('teams/any', () => '')
    v2.scene('teams/any', () => '')
    assert.equal(/data-v="(\d)"/.exec(fluid.renderScene('teams/any', 'teams'))[1], /data-v="(\d)"/.exec(v2.renderScene('teams/any', 'teams'))[1])
    assert.equal(fluid.renderScene('teams/any', 'teams').includes('deco"></div>'), false)
    fluid.scene('teams/none', () => '', { deco: false })
    assert.ok(fluid.renderScene('teams/none', 'teams').includes('<div class="deco"></div>'))
  })

  it('draws the app tile, pedestal and floating pieces with k- classes that scene CSS cannot collide with', () => {
    const w = loadKit()
    w.scene('forms/sample', (K) => K.tile({ x: 2, y: 3, s: 11, plinth: true }) + K.tile({ app: 'teams' }) + K.float({ right: 6, y: 6, icon: 'sparkle' }) + K.float({ text: '3/5', square: true, far: true }) + K.float({ app: true }))
    const html = w.renderScene('forms/sample', 'forms')
    assert.ok(html.includes('class="k-tilebox') && html.includes('class="k-tile"') && html.includes('class="k-plinth"'))
    assert.ok(html.includes(`src="${w.CAT.forms.icon}"`) && html.includes(`src="${w.CAT.teams.icon}"`))
    assert.ok(html.includes('--s:11cqw') && html.includes('left:2cqw'))
    assert.match(html, /class="k-float\s+[^"]*"[^>]*><i class="ico/)
    assert.match(html, /class="k-float k-float--sq far[^"]*"[^>]*><b>3\/5<\/b>/)
    assert.ok(!/class="(tile|float|plinth)[ "]/.test(html), 'kit classes must keep the k- prefix')
  })

  it('marks scenes loaded from scenes/auto so only AI scenes get the stricter v3 audit', () => {
    const w = loadKit()
    w.scene('teams/by-hand', () => '')
    w.AUTO_SCENES = true
    w.scene('teams/by-ai', () => '')
    w.AUTO_SCENES = false
    assert.equal(w.SCENES['teams/by-hand'].auto, false)
    assert.equal(w.SCENES['teams/by-ai'].auto, true)
  })

  it('serves palette.json to the page as the script kit.js reads', async () => {
    const server = await startServer()
    try {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/assets/fluid/palette.js`)
      assert.equal(res.status, 200)
      assert.match(res.headers.get('content-type'), /javascript/)
      const window = {}
      vm.runInNewContext(await res.text(), { window })
      assert.deepEqual(JSON.parse(JSON.stringify(window.FLUID_PALETTE)), PALETTE)
    } finally {
      server.close()
    }
  })
})
