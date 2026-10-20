/**
 * 공개 사이트 글 본문 CSS를 관리자 편집기용 src/styles/post-content.css로 옮긴다.
 * Elevate.Web의 본문 규칙(src/index.css의 .prose, src/styles/elevate-docs.css의 .edoc-article)을 바꾼 뒤
 * `npm run sync:post-content`로 다시 만든다. tests/post-content-style.test.js가 두 쪽이 같은지 검사한다.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

const repoFile = (relative) => fileURLToPath(new URL(`../../${relative}`, import.meta.url))
const parse = (relative) => postcss.parse(readFileSync(repoFile(relative), 'utf8'))

/** 선택자가 test를 만족하는 규칙만 소스 순서대로 복사한다 (@media 안의 규칙은 같은 @media로 감싼다). */
function pick(ast, test) {
  const out = []
  ast.each((node) => {
    if (node.type === 'rule' && node.selectors.some(test)) out.push(node.clone())
    if (node.type === 'atrule' && node.name === 'media') {
      const inner = []
      node.each((child) => {
        if (child.type === 'rule' && child.selectors.some(test)) inner.push(child.clone())
      })
      if (inner.length) {
        inner[0].raws.before = inner[0].raws.before.replace(/^\n+/, '\n')
        const media = node.clone({ nodes: [] })
        inner.forEach((rule) => media.append(rule))
        out.push(media)
      }
    }
  })
  return out
}

function format(nodes) {
  const sheet = postcss.root()
  nodes.forEach((node) => {
    node.raws.before = '\n\n'
    sheet.append(node)
  })
  return sheet.toString().trim()
}

const webIndex = parse('Elevate.Web/src/index.css')
const webDocs = parse('Elevate.Web/src/styles/elevate-docs.css')
const fromIndex = pick(webIndex, (selector) => selector.startsWith('.prose') || selector.startsWith('.collapsible-code-'))
const fromDocs = pick(webDocs, (selector) => selector.startsWith('.edoc-article .prose') || selector.startsWith('.edoc-article .collapsible-code-'))

// 공개 사이트 .edoc의 변수 중 본문 규칙이 쓰는 것
const VARIABLES = ['ink', 'ink-2', 'ink-3', 'ink-4', 'line', 'line-soft', 'fill', 'fill-2', 'accent', 'accent-strong', 'accent-rgb', 'dbar-h', 'font', 'mono']
const edocValues = {}
webDocs.walkRules('.edoc', (rule) => rule.walkDecls(/^--edoc-/, (decl) => { edocValues[decl.prop] = decl.value }))
const variables = VARIABLES.map((name) => {
  const value = edocValues[`--edoc-${name}`]
  if (!value) throw new Error(`Elevate.Web .edoc에 --edoc-${name}가 없습니다.`)
  return `  --edoc-${name}: ${value};`
}).join('\n')

const css = `/* =========================================================================
   게시글 본문 — 공개 사이트 글 상세와 같은 모양 (편집 화면의 본문 편집기에 쓴다)
   공개 사이트는 본문을 <article class="edoc-article"><div class="prose prose-slate max-w-none post-content">로 그린다.
   편집기도 같은 클래스를 쓰고(HtmlEditor.jsx), 아래 규칙을 같은 순서로 둔다.
     1. 공개 사이트 .edoc 의 색·글꼴 변수 중 본문 규칙이 쓰는 것
     2. Elevate.Web/src/index.css 의 .prose · .collapsible-code-* 규칙 (그대로 복사)
     3. Elevate.Web/src/styles/elevate-docs.css 의 .edoc-article 본문 규칙 (그대로 복사)
     4. 편집기 전용 보정 (.ProseMirror)
   이 파일은 scripts/sync-post-content-css.mjs가 만든다. 직접 고치지 말고 Web 원본을 고친 뒤
   npm run sync:post-content 를 실행한다. 1~3은 tests/post-content-style.test.js가 Web 원본과 같은지 검사한다.
   ========================================================================= */

/* ---------- 1. 공개 사이트 변수 (.edoc) ---------- */

.edoc-article {
${variables}

  font-family: var(--edoc-font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---------- 2. Elevate.Web/src/index.css ---------- */

${format(fromIndex)}

/* ---------- 3. Elevate.Web/src/styles/elevate-docs.css ---------- */

${format(fromDocs)}

/* ---------- 4. 편집기 전용 보정 ---------- */

/* 크기 조절 이미지: 공개 사이트 img의 위아래 여백을 바깥 틀에 주고, 안쪽 이미지는 조절 핸들 위치가 맞게 여백 없이 둔다. */
.edoc-article .ProseMirror .resizable-image-node {
  margin: 1.5em 0;
}

.edoc-article .ProseMirror .resizable-image-node img {
  margin: 0;
}

/* 편집기는 코드 블록을 div.react-renderer로 한 번 더 감싼다.
   공개 사이트에서 글·인용 카드의 첫·마지막 요소 바깥 여백을 지우는 규칙이 코드 블록에도 닿게 한다. */
.edoc-article .ProseMirror > .react-renderer:first-child > .collapsible-code-block,
.edoc-article .ProseMirror blockquote > .react-renderer:first-child > .collapsible-code-block {
  margin-top: 0;
}

.edoc-article .ProseMirror blockquote > .react-renderer:last-child > .collapsible-code-block {
  margin-bottom: 0;
}
`

writeFileSync(fileURLToPath(new URL('../src/styles/post-content.css', import.meta.url)), css)
console.log(`src/styles/post-content.css: index.css ${fromIndex.length}개, elevate-docs.css ${fromDocs.length}개 규칙`)
