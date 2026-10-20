import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as admin from '../src/utils/postImages.js'
import * as web from '../../Elevate.Web/src/utils/postImages.js'
import { getPublicThumbImageProps } from '../src/utils/publicThumbs.js'
import { getPostThumbImageProps, listPostThumbKeys } from '../../Elevate.Web/src/utils/postThumbs.js'

const docsList = readFileSync(new URL('../../Elevate.Web/src/components/elevate-docs/DocsList.jsx', import.meta.url), 'utf8')

const BLOB = 'https://stelvdevimiruajbu5bya.blob.core.windows.net/images/thumbnails/post'
const signed = (name) => ({ url: `${BLOB}/${name}`, signedUrl: `${BLOB}/${name}?sv=2024&sig=abc` })

const THUMBNAILS = [
  ['auto thumbnail with three variants', {
    ...signed('orig.jpg'), width: 640, height: 360,
    variants: {
      thumb: { ...signed('thumb.webp'), width: 480, height: 270 },
      card: { ...signed('card.webp'), width: 960, height: 540 },
      hero: { ...signed('hero.webp'), width: 1440, height: 810 },
    },
  }],
  ['only variants wider than the card limit', { ...signed('orig.jpg'), variants: { hero: { ...signed('hero.webp'), width: 1440, height: 810 } } }],
  ['variants without widths', { ...signed('orig.jpg'), width: 640, height: 360, variants: { card: signed('card.webp') } }],
  ['blob original without variants', signed('orig.jpg')],
  ['external original without variants', { url: 'https://example.com/a.png', width: 1200, height: 630 }],
  ['plain URL string', 'https://example.com/a.png'],
  ['empty string', ''],
  ['missing thumbnail', null],
]

describe('post card images mirror the public blog (Elevate.Web)', () => {
  it('uses the same <img sizes> as the public card grid', () => {
    const match = /const CARD_IMAGE_SIZES = '([^']+)'/.exec(docsList)
    expect(match).not.toBeNull()
    expect(admin.CARD_IMAGE_SIZES).toBe(match[1])
    expect(admin.POST_CARD_IMAGE_SIZES).toBe(web.POST_CARD_IMAGE_SIZES)
    expect(admin.POST_CARD_MAX_VARIANT_WIDTH).toBe(web.POST_CARD_MAX_VARIANT_WIDTH)
  })

  it('builds the same static card image as the public site for every post thumb', () => {
    const keys = listPostThumbKeys()
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      const [app, slug] = key.split('/')
      expect(getPublicThumbImageProps(app, slug, admin.CARD_IMAGE_SIZES), key)
        .toEqual(getPostThumbImageProps(app, slug, admin.CARD_IMAGE_SIZES))
    }
    expect(getPublicThumbImageProps('azure', 'no-such-post', admin.CARD_IMAGE_SIZES)).toBeNull()
  })

  it.each(THUMBNAILS)('builds the same DB thumbnail image as the public site: %s', (_, thumbnail) => {
    const options = { sizes: admin.CARD_IMAGE_SIZES }
    expect(admin.getThumbnailImageProps(thumbnail, options)).toEqual(web.getThumbnailImageProps(thumbnail, options))
    expect(admin.getThumbnailImageProps(thumbnail)).toEqual(web.getThumbnailImageProps(thumbnail))
  })

  it('shows signed card variants up to 960px, never the hero size', () => {
    const [, thumbnail] = THUMBNAILS[0]
    const props = admin.getThumbnailImageProps(thumbnail, { sizes: admin.CARD_IMAGE_SIZES })
    expect(props.src).toBe(thumbnail.variants.card.signedUrl)
    expect(props.srcSet).toBe(`${thumbnail.variants.thumb.signedUrl} 480w, ${thumbnail.variants.card.signedUrl} 960w`)
  })

  it('loads images with the same priority rules as the public site', () => {
    for (const priority of [true, false, undefined]) {
      expect(admin.getImageLoadingProps(priority)).toEqual(web.getImageLoadingProps(priority))
    }
  })
})
