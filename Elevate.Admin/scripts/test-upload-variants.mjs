import assert from 'node:assert/strict'

import { assertCompleteThumbnailVariants } from '../src/utils/thumbnailVariants.js'
import { thumbnailVariantSpecs } from '../src/utils/imageUpload.js'

const complete = Object.fromEntries(
  thumbnailVariantSpecs.map((spec) => [spec.key, { url: `https://example.com/${spec.key}.webp` }])
)

assert.equal(assertCompleteThumbnailVariants(complete), complete)
assert.throws(
  () => assertCompleteThumbnailVariants({ [thumbnailVariantSpecs[0].key]: complete[thumbnailVariantSpecs[0].key] }),
  /Missing thumbnail variants:/
)
