import { expect, it } from 'vitest'
import { countPublicThumbs, getPublicThumbImage } from '../src/utils/publicThumbs.js'
import { listPostThumbKeys } from '../../Elevate.Web/src/utils/postThumbs.js'

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
