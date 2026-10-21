import { strict as assert } from 'node:assert'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { ROOT } from '../lib/posts.mjs'

const PACKAGE = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

describe('npm test', () => {
  // 경로 없는 node --test는 Node 기본 규칙으로 test-*.js, *-test.js, *_test.js, *.test.js, test.js도 테스트로 실행한다.
  // 글 slug가 그런 이름이면 장면(scenes/auto/<앱>/<slug>.js)이 실행돼 Repository checks가 실패하고 자동 병합이 막혔다(PR #314).
  it('runs only test/ even when a post slug makes its scene look like a test file', () => {
    const root = mkdtempSync(join(tmpdir(), 'npm-test-'))
    try {
      writeFileSync(join(root, 'package.json'), JSON.stringify({ type: PACKAGE.type, scripts: { test: PACKAGE.scripts.test } }))
      mkdirSync(join(root, 'test'))
      writeFileSync(join(root, 'test/probe.test.mjs'), "import { writeFileSync } from 'node:fs'\nimport { it } from 'node:test'\nit('runs', () => writeFileSync('probe-ran', ''))\n")
      // 장면은 render.html의 전역 scene()을 부르므로 Node에서 실행되면 ReferenceError로 실패한다.
      for (const slug of ['test-hihi', 'hihi-test', 'hihi_test', 'hihi.test', 'test']) {
        const file = join(root, 'scenes/auto/copilot-studio', `${slug}.js`)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, `(() => {\n  scene('copilot-studio/${slug}', (K) => K.win({}));\n})();\n`)
      }
      const env = { ...process.env, PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ''}` }
      // 바깥 node --test가 넘기는 NODE_TEST_CONTEXT가 남아 있으면 안쪽 node --test는 파일을 실행하지 않는다.
      delete env.NODE_TEST_CONTEXT
      const run = spawnSync(PACKAGE.scripts.test, { cwd: root, shell: true, encoding: 'utf8', env })
      assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`)
      assert.ok(existsSync(join(root, 'probe-ran')), `test/ was not run:\n${run.stdout}\n${run.stderr}`)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
