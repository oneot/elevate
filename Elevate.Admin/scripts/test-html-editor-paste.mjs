import assert from 'node:assert/strict'

import { getClipboardImageFiles } from '../src/components/editor/clipboardImages.js'

const png = new File(['image'], 'pasted.png', { type: 'image/png' })
const html = new File(['<p>x</p>'], 'snippet.html', { type: 'text/html' })

assert.deepEqual(getClipboardImageFiles({ files: [png, html] }), [png])
assert.deepEqual(getClipboardImageFiles({ files: [html] }), [])
assert.deepEqual(getClipboardImageFiles(null), [])

