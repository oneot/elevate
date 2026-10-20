import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { expect, it } from 'vitest'

const source = (relative) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')
const adminCss = source('../src/styles/post-content.css')
const admin = postcss.parse(adminCss)
const webIndex = postcss.parse(source('../../Elevate.Web/src/index.css'))
const webDocs = postcss.parse(source('../../Elevate.Web/src/styles/elevate-docs.css'))

/** 선택자가 test를 만족하는 규칙을 소스 순서대로: { media, selector, decls } */
function rules(ast, test) {
  const out = []
  const add = (rule, media) => {
    if (!rule.selectors.some(test)) return
    out.push({
      media,
      selector: rule.selectors.join(', '),
      decls: rule.nodes.filter((node) => node.type === 'decl').map((decl) => `${decl.prop}: ${decl.value}${decl.important ? ' !important' : ''}`),
    })
  }
  ast.each((node) => {
    if (node.type === 'rule') add(node, '')
    if (node.type === 'atrule' && node.name === 'media') node.each((child) => { if (child.type === 'rule') add(child, node.params) })
  })
  return out
}

it('copies the public post body rules from Elevate.Web unchanged and in the same order', () => {
  const fromWeb = [
    ...rules(webIndex, (selector) => selector.startsWith('.prose') || selector.startsWith('.collapsible-code-')),
    ...rules(webDocs, (selector) => selector.startsWith('.edoc-article .prose') || selector.startsWith('.edoc-article .collapsible-code-')),
  ]
  const copied = rules(admin, (selector) => selector !== '.edoc-article' && !selector.includes('.ProseMirror'))
  expect(fromWeb.length).toBeGreaterThan(40)
  expect(copied).toEqual(fromWeb)
})

it('uses the public site colours and fonts for every variable the body rules need', () => {
  const webVars = {}
  webDocs.walkRules('.edoc', (rule) => rule.walkDecls(/^--edoc-/, (decl) => { webVars[decl.prop] = decl.value }))
  const adminVars = {}
  admin.walkRules('.edoc-article', (rule) => rule.walkDecls(/^--edoc-/, (decl) => { adminVars[decl.prop] = decl.value }))
  for (const [prop, value] of Object.entries(adminVars)) expect(value, prop).toBe(webVars[prop])
  for (const used of new Set(adminCss.match(/var\(--edoc-[\w-]+/g).map((match) => match.slice(4)))) {
    expect(adminVars, used).toHaveProperty(used)
  }
})

it('gives the editor the same body classes as the public post page', () => {
  const postDetail = source('../../Elevate.Web/src/pages/PostDetail.jsx')
  const editor = source('../src/components/editor/HtmlEditor.jsx')
  const publicBody = /<div[^>]*className="(prose [^"]+)"/.exec(postDetail)?.[1]
  expect(publicBody).toBe('prose prose-slate max-w-none post-content')
  expect(postDetail).toContain('<article className="edoc-article">')
  expect(editor).toContain(`class: '${publicBody} focus:outline-none'`)
  expect(editor).toMatch(/className=\{`ea-rte__content edoc-article /)
})
