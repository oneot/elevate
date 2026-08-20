import assert from 'node:assert/strict'
import { File } from 'node:buffer'

import {
  getClipboardImageFiles,
  shouldUploadClipboardImages,
} from '../src/components/editor/clipboardImages.js'

const png = new File(['image'], 'pasted.png', { type: 'image/png' })
const html = new File(['<p>x</p>'], 'snippet.html', { type: 'text/html' })

assert.deepEqual(getClipboardImageFiles({ files: [png, html] }), [png])
assert.deepEqual(getClipboardImageFiles({ files: [html] }), [])
assert.deepEqual(getClipboardImageFiles(null), [])

assert.equal(shouldUploadClipboardImages({ files: [png] }, async () => 'url'), true)
assert.equal(shouldUploadClipboardImages({ files: [png] }, null), false)
assert.equal(shouldUploadClipboardImages({ files: [html] }, async () => 'url'), false)
