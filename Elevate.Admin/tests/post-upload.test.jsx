// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePostUpload } from '../src/hooks/usePostUpload.js'
import { requestUploadSas, registerAsset } from '../src/services/assetsApi.js'
import { uploadBlobWithSas } from '../src/utils/imageUpload.js'

vi.mock('../src/services/assetsApi.js', () => ({ requestUploadSas: vi.fn(), registerAsset: vi.fn() }))
vi.mock('../src/utils/imageUpload.js', async (importOriginal) => ({
  ...await importOriginal(), uploadBlobWithSas: vi.fn(),
}))

let root
let host
let upload
const setPost = vi.fn()
const setError = vi.fn()
const setMessage = vi.fn()
const msalInstance = {}
const image = new File(['image-fixture'], 'image.gif', { type: 'image/gif' })

function Probe() {
  const result = usePostUpload({ msalInstance, postId: 'post-1', setPost, setError, setMessage })
  useLayoutEffect(() => { upload = result })
  return <output>{String(result.uploading)}</output>
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  requestUploadSas.mockResolvedValue({ uploadUrl: 'https://upload.example.test/file', blobUrl: 'https://image.example.test/file' })
  registerAsset.mockResolvedValue({ url: 'https://image.example.test/file' })
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(() => root.render(<Probe />))
})

afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

it('keeps saving blocked until both thumbnail and inline image uploads complete', async () => {
  const complete = []
  uploadBlobWithSas.mockImplementation(() => new Promise((resolve) => complete.push(resolve)))
  let thumbnail
  let inline
  await act(async () => { thumbnail = upload.uploadThumbnail(image) })
  await act(async () => { inline = upload.uploadHtmlImage(image) })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[0](); await thumbnail })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[1](); await inline })
  expect(upload.uploading).toBe(false)
  expect(registerAsset).toHaveBeenCalledTimes(2)
})

it('releases inline-upload state and preserves its error for the editor', async () => {
  const failure = new Error('Upload failed')
  let rejectUpload
  uploadBlobWithSas.mockImplementation(() => new Promise((_, reject) => { rejectUpload = reject }))
  let pending
  await act(async () => { pending = upload.uploadHtmlImage(image) })
  expect(upload.uploading).toBe(true)
  await act(async () => {
    const assertion = expect(pending).rejects.toBe(failure)
    rejectUpload(failure)
    await assertion
  })
  expect(upload.uploading).toBe(false)
  expect(registerAsset).not.toHaveBeenCalled()
})
