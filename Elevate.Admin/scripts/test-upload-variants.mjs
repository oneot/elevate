import assert from 'node:assert/strict'

import {
  assertCompleteThumbnailVariants,
  canCreateThumbnailVariants,
} from '../src/utils/thumbnailVariants.js'
import { thumbnailVariantSpecs } from '../src/utils/imageUpload.js'

const complete = Object.fromEntries(
  thumbnailVariantSpecs.map((spec) => [spec.key, { url: `https://example.com/${spec.key}.webp` }])
)

assert.equal(assertCompleteThumbnailVariants(complete), complete)
assert.throws(
  () => assertCompleteThumbnailVariants({ [thumbnailVariantSpecs[0].key]: complete[thumbnailVariantSpecs[0].key] }),
  /Missing thumbnail variants:/
)

globalThis.createImageBitmap = () => {}
globalThis.document = { createElement: () => ({}) }

assert.equal(canCreateThumbnailVariants({ type: 'image/jpeg', name: 'photo.jpg' }), true)
assert.equal(canCreateThumbnailVariants({ type: 'image/gif', name: 'animation.gif' }), false)
assert.equal(canCreateThumbnailVariants({ type: 'image/heic', name: 'photo.heic' }), false)
assert.equal(canCreateThumbnailVariants({ type: 'image/jpeg', name: 'photo.jpg' }), true)
