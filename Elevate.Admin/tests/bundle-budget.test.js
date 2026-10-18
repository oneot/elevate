import { execFile } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { afterEach, beforeEach, expect, it } from 'vitest'

const exec = promisify(execFile)
const script = fileURLToPath(new URL('../scripts/check-bundle.mjs', import.meta.url))
let workdir
let manifest

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), 'elevate-bundle-'))
  mkdirSync(join(workdir, 'dist/.vite'), { recursive: true })
  manifest = {
    'index.html': { file: 'main.js', imports: ['_react'], dynamicImports: ['_editor'] },
    'src/pages/CategoryPosts.jsx': { file: 'category.js', imports: ['_react'] },
    _react: { file: 'react.js' },
    _editor: { file: 'vendor-tiptap-test.js' },
  }
  writeFileSync(join(workdir, 'dist/main.js'), 'a')
  writeFileSync(join(workdir, 'dist/category.js'), 'bb')
  writeFileSync(join(workdir, 'dist/react.js'), 'ccc')
  writeFileSync(join(workdir, 'dist/vendor-tiptap-test.js'), 'x'.repeat(700 * 1024))
})

afterEach(() => rmSync(workdir, { recursive: true, force: true }))

function check() {
  writeFileSync(join(workdir, 'dist/.vite/manifest.json'), JSON.stringify(manifest))
  return exec(process.execPath, [script], { cwd: workdir, timeout: 5000 })
}

it('counts the default list and shared imports once, excluding unopened editor chunks', async () => {
  const { stdout } = await check()
  expect(stdout).toContain('6 bytes')
})

it('rejects a transitive static import of the editor even if the entry itself is small', async () => {
  manifest._react.imports = ['_editor']
  await expect(check()).rejects.toMatchObject({ code: 1 })
})

it('accepts exactly the 600 KiB initial-list budget', async () => {
  writeFileSync(join(workdir, 'dist/main.js'), 'x'.repeat(600 * 1024 - 5))
  const { stdout } = await check()
  expect(stdout).toContain('614400 bytes')
})

it('rejects one byte above the 600 KiB initial-list budget', async () => {
  writeFileSync(join(workdir, 'dist/main.js'), 'x'.repeat(600 * 1024 - 4))
  await expect(check()).rejects.toMatchObject({ code: 1 })
})
