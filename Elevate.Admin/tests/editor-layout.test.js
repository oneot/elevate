import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { expect, it } from 'vitest'

const css = postcss.parse(readFileSync(fileURLToPath(new URL('../src/index.css', import.meta.url)), 'utf8'))

/** `ea-main (min-width: 600px)` → 600. 최상위 규칙은 0, 다른 at-rule 안의 규칙은 null. */
function minWidthOf(rule) {
  const parent = rule.parent
  if (parent.type === 'root') return 0
  if (parent.type !== 'atrule' || parent.name !== 'container') return null
  const match = /^ea-main \(min-width: (\d+)px\)$/.exec(parent.params.replace(/\s+/g, ' ').trim())
  return match ? Number(match[1]) : null
}

/** selector 규칙의 선언 중 prop 값을 { minWidth: [values] }로 모은다. */
function valuesByWidth(selector, prop) {
  const out = {}
  css.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return
    const minWidth = minWidthOf(rule)
    if (minWidth === null) return
    for (const node of rule.nodes) {
      if (node.type === 'decl' && node.prop === prop) (out[minWidth] ||= []).push(node.value)
    }
  })
  return out
}

/** "'info  meta' 'files meta'" → [['info', 'meta'], ['files', 'meta']] */
const parseAreas = (value) => [...value.matchAll(/'([^']*)'/g)].map(([, row]) => row.trim().split(/\s+/))

const WIDE = 1024
const areas = Object.fromEntries(
  Object.entries(valuesByWidth('.ea-editor', 'grid-template-areas')).map(([width, [value]]) => [width, parseAreas(value)]),
)

it('puts the title, publish settings and attachments above a full-width body below the wide layout', () => {
  const narrower = Object.keys(areas).map(Number).filter((width) => width < WIDE)
  expect(narrower).toEqual([0, 600])

  for (const width of narrower) {
    const rows = areas[width]
    const last = rows.at(-1)
    expect(last.every((name) => name === 'body'), `${width}px: body is the last row`).toBe(true)
    expect(rows.slice(0, -1).flat(), `${width}px: panels above the body`).not.toContain('body')
    expect(new Set(rows.slice(0, -1).flat()), `${width}px: every panel is placed`).toEqual(new Set(['info', 'meta', 'files']))
  }
})

it('uses two columns above the body: title and attachments on the left, publish settings on the right', () => {
  expect(areas[600]).toEqual([
    ['info', 'meta'],
    ['files', 'meta'],
    ['body', 'body'],
  ])
})

it('keeps the body on the left with the panels in a right column on wide screens', () => {
  expect(areas[WIDE]).toEqual([
    ['body', 'info'],
    ['body', 'meta'],
    ['body', 'files'],
  ])
})

it('sizes the editor body box to the viewport whenever the editor is at least 600px wide', () => {
  expect(valuesByWidth('.ea-editor__body', 'height')).toEqual({
    600: [
      'max(480px, calc(100vh - var(--ea-dbar-h) - 48px))',
      'max(480px, calc(100dvh - var(--ea-dbar-h) - 48px))',
    ],
  })
  expect(valuesByWidth('.ea-editor__body', 'contain')).toEqual({ 600: ['size'] })
  expect(valuesByWidth('.ea-editor__body', 'min-height')).toEqual({})
})

it('reserves exactly the editor top and bottom padding around the body box', () => {
  const [height] = valuesByWidth('.ea-editor__body', 'height')[600]
  const reserved = Number(/var\(--ea-dbar-h\) - (\d+)px/.exec(height)[1])
  const [top] = valuesByWidth('.ea-editor', 'padding-top')[0]
  const [bottom] = valuesByWidth('.ea-editor', 'padding-bottom')[600]

  expect(parseFloat(top) + parseFloat(bottom)).toBe(reserved)
})
