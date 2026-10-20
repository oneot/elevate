import { existsSync, readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const root = new URL('../', import.meta.url)
const html = readFileSync(new URL('index.html', root), 'utf8')

function pngSize(path) {
  const png = readFileSync(new URL(path, root))
  return [png.readUInt32BE(16), png.readUInt32BE(20)]
}

it('names the browser tab after the admin site', () => {
  expect(html).toMatch(/<title>Admin \| Microsoft Elevate<\/title>/)
})

it('links browser icons that ship with the build (public/)', () => {
  const hrefs = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)].map(([, href]) => href)
  expect(hrefs).toEqual(['/favicon.ico', '/favicon-192.png', '/apple-touch-icon.png'])
  for (const href of hrefs) expect(existsSync(new URL(`public${href}`, root)), href).toBe(true)
})

it('packs 16, 32 and 48 px frames into favicon.ico and sizes the PNG icons as declared', () => {
  const ico = readFileSync(new URL('public/favicon.ico', root))
  expect(ico.readUInt16LE(2)).toBe(1)
  const frames = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => ico[6 + index * 16] || 256)
  expect(frames.sort((a, b) => a - b)).toEqual([16, 32, 48])
  expect(pngSize('public/favicon-192.png')).toEqual([192, 192])
  expect(pngSize('public/apple-touch-icon.png')).toEqual([180, 180])
})
