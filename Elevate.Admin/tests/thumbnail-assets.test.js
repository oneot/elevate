import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { APP_KEYS } from '../src/constants/apps.js'
import { APP_PILL_ICONS, ICON_PATHS } from '../src/utils/thumbnailIcons.js'
import { countPublicThumbs, getPublicThumbImage } from '../src/utils/publicThumbs.js'
import { listPostThumbKeys } from '../../Elevate.Web/src/utils/postThumbs.js'

const glassDir = fileURLToPath(new URL('../src/assets/glass/', import.meta.url))

it('ships a glass object set and a pill icon for every app the auto thumbnail can draw', () => {
  for (const app of APP_KEYS) {
    expect(ICON_PATHS[APP_PILL_ICONS[app]], app).toBeTruthy()
    for (const shape of ['blob', 'torus', 'orb', 'pebble', 'capsule']) {
      expect(existsSync(`${glassDir}${app}/${shape}.webp`), `${app}/${shape}`).toBe(true)
    }
  }
})

it('finds every public-site card image the way Elevate.Web does', () => {
  const keys = listPostThumbKeys()
  expect(keys.length).toBeGreaterThan(0)
  expect(countPublicThumbs()).toBe(keys.length)
  for (const key of keys) {
    const [app, slug] = key.split('/')
    const image = getPublicThumbImage(app, slug)
    expect(image?.src, key).toMatch(new RegExp(`${slug}-960\\.webp`))
    expect(image.srcSet, key).toMatch(new RegExp(`${slug}-480\\.webp 480w`))
  }
  expect(getPublicThumbImage('word', 'no-such-post')).toBeNull()
  expect(getPublicThumbImage('', 'github-pages')).toBeNull()
})
