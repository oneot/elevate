import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { expect, it } from 'vitest'

const css = postcss.parse(readFileSync(fileURLToPath(new URL('../src/index.css', import.meta.url)), 'utf8'))
const WIDE = 'ea-main (min-width: 900px)'

/** selector 규칙의 선언. wide면 넓은 편집 화면 container query 안, 아니면 최상위 규칙만 본다. */
function decls(selector, { wide = false } = {}) {
  const out = []
  css.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return
    const parent = rule.parent
    const inWide = parent.type === 'atrule' && parent.name === 'container' && parent.params.replace(/\s+/g, ' ') === WIDE
    if (wide ? inWide : parent.type === 'root') {
      out.push(...rule.nodes.filter((node) => node.type === 'decl'))
    }
  })
  return out
}

const value = (list, prop) => list.filter((decl) => decl.prop === prop).map((decl) => decl.value)

it('sizes the wide editor body box to the viewport instead of the settings column', () => {
  const body = decls('.ea-editor__body', { wide: true })

  expect(value(body, 'height')).toEqual([
    'max(480px, calc(100vh - var(--ea-dbar-h) - 48px))',
    'max(480px, calc(100dvh - var(--ea-dbar-h) - 48px))',
  ])
  expect(value(body, 'contain')).toEqual(['size'])
  expect(value(body, 'align-self')).toEqual([])
  expect(value(body, 'min-height')).toEqual([])
})

it('reserves exactly the editor top and bottom padding around the body box', () => {
  const [height] = value(decls('.ea-editor__body', { wide: true }), 'height')
  const reserved = Number(/var\(--ea-dbar-h\) - (\d+)px/.exec(height)[1])
  const [top] = value(decls('.ea-editor'), 'padding-top')
  const [bottom] = value(decls('.ea-editor', { wide: true }), 'padding-bottom')

  expect(parseFloat(top) + parseFloat(bottom)).toBe(reserved)
})
