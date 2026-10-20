import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const initial = new Set()

function visit(key) {
  if (initial.has(key)) return
  const chunk = manifest[key]
  assert.ok(chunk, `빌드 manifest에 ${key} 청크가 없습니다.`)
  initial.add(key)
  for (const dependency of chunk.imports || []) visit(dependency)
}

visit('index.html')
visit('src/pages/AppPosts.jsx')
const files = [...initial].map((key) => manifest[key].file).filter((file) => file.endsWith('.js'))
assert.ok(!files.some((file) => file.includes('vendor-tiptap-')), '초기 화면이 Tiptap 편집기를 즉시 로드합니다.')

let bytes = 0
let compressedBytes = 0
for (const file of files) {
  const content = readFileSync(join('dist', file))
  bytes += content.length
  compressedBytes += gzipSync(content).length
}

const budget = 600 * 1024
console.log(`초기 목록 JavaScript: ${bytes} bytes, gzip ${compressedBytes} bytes (예산 ${budget} bytes)`)
assert.ok(bytes <= budget, '관리자 초기 JavaScript가 600 KiB 예산을 초과했습니다.')
