#!/usr/bin/env node
/**
 * 'UI 미니어처' 썸네일 렌더러 (이전 render.py의 Node 판).
 *
 *   node render.mjs review <앱…|all>          → review/<앱>.png        실제 카드 크기(≈342px) 2배로 앱 전체
 *   node render.mjs zoom <앱>/<slug> …        → review/zoom_<앱>__<slug>.png  960px 확대본
 *   node render.mjs export [<앱>/<slug> …] [--cat a,b] [--out DIR]
 *                                            → DIR/<앱>/<slug>-960.webp, -480.webp (기본 DIR: Elevate.Web/src/assets/post-thumbs)
 *   node render.mjs excerpt <앱>/<slug> …     → work/<id>/excerpt.txt(AI 요약 한 줄)가 규칙에 맞는지 검사 (브라우저 없음)
 *
 * 글 목록은 data/posts.json을 쓴다 (없으면 공개 API에서 만든다. 새로 받으려면 `node data.mjs`).
 * 장면은 scenes/<앱>.js와 AI가 만든 scenes/auto/<앱>/<slug>.js를 모두 불러온다.
 * 브라우저 콘솔 오류나 audit 경고(잘린 글자, 무대 밖 pill, 없는 아이콘·장면)가 있으면 출력하고 종료 코드 1로 끝난다.
 * 로컬에서 Playwright Chromium 대신 설치된 Edge를 쓰려면 THUMB_BROWSER_CHANNEL=msedge.
 */
import http from 'node:http'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { chromium } from 'playwright'
import { APPS, ROOT, THUMBS_DIR, fetchPublishedPosts, parseKey, writePostsData } from './lib/posts.mjs'
import { checkExcerpt } from './lib/pipeline.mjs'

const ICONS = join(ROOT, 'node_modules/@fluentui/svg-icons/icons')
const REVIEW = join(ROOT, 'review')
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** scenes/auto 아래 장면 파일 목록 (render.html이 scenes/auto/index.json으로 받아 불러온다). */
export function listAutoScenes(root = ROOT) {
  const dir = join(root, 'scenes/auto')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((cat) => readdirSync(join(dir, cat)).filter((file) => file.endsWith('.js')).sort().map((file) => `scenes/auto/${cat}/${file}`))
}

function resolveFile(pathname) {
  const [base, rel] = pathname.startsWith('/icons/') ? [ICONS, pathname.slice('/icons/'.length)] : [ROOT, pathname.slice(1)]
  const file = resolve(base, rel)
  if (!file.startsWith(base + sep)) return null
  return existsSync(file) && statSync(file).isFile() ? file : null
}

export function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname === '/scenes/auto/index.json') {
      res.writeHead(200, { 'content-type': TYPES['.json'], 'cache-control': 'no-store' })
      res.end(JSON.stringify(listAutoScenes()))
      return
    }
    const file = resolveFile(pathname)
    if (!file) {
      res.writeHead(404)
      res.end()
      return
    }
    const body = readFileSync(file)
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'content-length': body.length })
    res.end(body)
  })
  return new Promise((ready) => server.listen(0, '127.0.0.1', () => ready(server)))
}

async function openPage(browser, url, width, scale) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale })
  const errors = []
  // 없는 아이콘·파일은 audit의 'missing icon/file'로 따로 알린다.
  page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('404')) errors.push(msg.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector("body[data-ready='1']", { timeout: 60000 })
  await page.waitForTimeout(150)
  return { page, errors }
}

async function report(page, errors, { ignore = () => false } = {}) {
  const audits = (await page.evaluate(() => window.AUDIT || [])).filter((line) => !ignore(line))
  for (const line of errors) console.log(`  ! console: ${line}`)
  for (const line of audits) console.log(`  ! audit: ${line}`)
  return errors.length + audits.length
}

async function ensurePostsData() {
  if (existsSync(join(ROOT, 'data/posts.json'))) return
  console.log('data/posts.json이 없어 공개 API에서 글 목록을 받습니다.')
  writePostsData(await fetchPublishedPosts())
}

/** 960×540 캡처를 공개 카드용 WebP 두 장(960, 480)으로 저장한다 (이전 Pillow 설정: LANCZOS, quality 82, method 6). */
export async function writeWebps(png, outDir, category, slug) {
  const base = sharp(png).removeAlpha()
  const meta = await sharp(png).metadata()
  const large = meta.width === 960 && meta.height === 540 ? base : base.resize(960, 540, { fit: 'fill', kernel: 'lanczos3' })
  const large960 = await large.png().toBuffer()
  const dir = join(outDir, category)
  mkdirSync(dir, { recursive: true })
  const files = []
  for (const [width, height] of [[960, 540], [480, 270]]) {
    const image = width === 960 ? sharp(large960) : sharp(large960).resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
    const file = join(dir, `${slug}-${width}.webp`)
    writeFileSync(file, await image.webp({ quality: 82, effort: 6 }).toBuffer())
    files.push(file)
  }
  return files
}

function parseArgs(argv) {
  const [mode, ...rest] = argv
  const options = { mode, targets: [], out: THUMBS_DIR, cat: null }
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--out') options.out = resolve(rest[(i += 1)])
    else if (rest[i] === '--cat') options.cat = rest[(i += 1)]
    else options.targets.push(rest[i])
  }
  if (!['review', 'zoom', 'export'].includes(mode)) {
    throw new Error('사용법: node render.mjs review <앱…|all> | zoom <앱>/<slug>… | export [<앱>/<slug>…] [--cat a,b] [--out DIR] | excerpt <앱>/<slug>…')
  }
  return options
}

/**
 * AI가 쓴 요약 한 줄(work/<id>/excerpt.txt)을 검사한다. 생성 단계의 AI는 렌더러(thumb-render)만 실행할 수 있어
 * 스스로 확인할 수 있도록 여기에 둔다. 같은 규칙으로 validate.mjs와 publish.mjs가 다시 검사한다.
 */
export function checkExcerptFiles(targets, root = ROOT) {
  if (!targets.length) throw new Error('사용법: node render.mjs excerpt <앱>/<slug>')
  let issues = 0
  for (const target of targets) {
    const { key, id } = parseKey(target)
    const file = join(root, 'work', id, 'excerpt.txt')
    if (!existsSync(file)) {
      console.log(`  ! excerpt: work/${id}/excerpt.txt가 없습니다.`)
      issues += 1
      continue
    }
    const content = join(root, 'work', id, 'content.json')
    const title = existsSync(content) ? JSON.parse(readFileSync(content, 'utf8')).title : ''
    const text = readFileSync(file, 'utf8').trim()
    const problems = checkExcerpt(text, { title })
    for (const problem of problems) console.log(`  ! excerpt: ${problem}`)
    if (problems.length) issues += problems.length
    else console.log(`${key} 요약 검사 통과 (${[...text].length}자): ${text}`)
  }
  return issues ? 1 : 0
}

export async function main(argv = process.argv.slice(2)) {
  if (argv[0] === 'excerpt') return checkExcerptFiles(argv.slice(1))
  const options = parseArgs(argv)
  await ensurePostsData()
  mkdirSync(REVIEW, { recursive: true })
  const server = await startServer()
  const base = `http://127.0.0.1:${server.address().port}/render.html`
  const channel = process.env.THUMB_BROWSER_CHANNEL
  const browser = await chromium.launch(channel ? { channel } : {})
  let issues = 0
  try {
    if (options.mode === 'review') {
      const cats = !options.targets.length || options.targets.includes('all') ? APPS : options.targets
      for (const cat of cats) {
        const { page, errors } = await openPage(browser, `${base}?mode=review&cat=${encodeURIComponent(cat)}`, 1180, 2)
        const file = join(REVIEW, `${cat}.png`)
        await page.locator('#root').screenshot({ path: file })
        console.log(file)
        issues += await report(page, errors)
        await page.close()
      }
    } else if (options.mode === 'zoom') {
      for (const target of options.targets) {
        const { key, id } = parseKey(target)
        const { page, errors } = await openPage(browser, `${base}?mode=zoom&keys=${encodeURIComponent(key)}`, 1000, 1)
        const thumb = page.locator('.thumb')
        if (!(await thumb.count())) throw new Error(`${key}: data/posts.json에 없는 글입니다 (node data.mjs로 목록을 다시 받으세요).`)
        const file = join(REVIEW, `zoom_${id}.png`)
        await thumb.first().screenshot({ path: file })
        console.log(file)
        issues += await report(page, errors)
        await page.close()
      }
    } else {
      const keys = options.targets.map((target) => parseKey(target).key)
      const query = `mode=export${options.cat ? `&cat=${encodeURIComponent(options.cat)}` : ''}${keys.length ? `&keys=${encodeURIComponent(keys.join(','))}` : ''}`
      const { page, errors } = await openPage(browser, `${base}?${query}`, 2000, 2)
      const withScene = new Set(await page.evaluate(() => Object.keys(window.SCENES || {})))
      // 전체를 내보낼 때는 아직 장면이 없는 글(새 글)을 건너뛴다. 지정한 글에 장면이 없으면 오류다.
      issues += await report(page, errors, { ignore: (line) => !keys.length && / no scene yet$/.test(line) })
      const thumbs = page.locator('.thumb[data-key]')
      const count = await thumbs.count()
      let written = 0
      let bytes = 0
      for (let i = 0; i < count; i += 1) {
        const element = thumbs.nth(i)
        const key = await element.getAttribute('data-key')
        if (!withScene.has(key)) continue
        const { category, slug } = parseKey(key)
        const files = await writeWebps(await element.screenshot(), options.out, category, slug)
        for (const file of files) bytes += statSync(file).size
        written += 1
      }
      if (keys.length && written !== keys.length) {
        console.log(`  ! export: ${keys.length}개 중 ${written}개만 내보냈습니다 (장면이나 data/posts.json 항목 확인).`)
        issues += 1
      }
      console.log(`exported ${written} thumbnails (${(bytes / 1024 / 1024).toFixed(2)} MB) to ${options.out}`)
      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  if (issues) console.log(`\n${issues}개 문제가 있습니다. 위 경고를 모두 고친 뒤 다시 실행하세요.`)
  return issues ? 1 : 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code }, (error) => {
    console.error(error.message || error)
    process.exitCode = 1
  })
}
