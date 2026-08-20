import assert from 'node:assert/strict'

import { stripThumbnailSignedUrls } from '../src/utils/thumbnailPayload.js'

const thumbnail = stripThumbnailSignedUrls({
    url: 'https://account.blob.core.windows.net/images/original.jpg',
    signedUrl: 'https://signed.example.com/original.jpg?sig=secret',
    width: 1600,
    height: 900,
    variants: {
      thumb: {
        url: 'https://account.blob.core.windows.net/images/thumb.webp',
        signedUrl: 'https://signed.example.com/thumb.webp?sig=secret',
        width: 480,
        height: 270,
      },
    },
})

assert.deepEqual(thumbnail, {
  url: 'https://account.blob.core.windows.net/images/original.jpg',
  width: 1600,
  height: 900,
  variants: {
    thumb: {
      url: 'https://account.blob.core.windows.net/images/thumb.webp',
      width: 480,
      height: 270,
    },
  },
})
