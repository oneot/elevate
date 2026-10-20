// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePostUpload } from '../src/hooks/usePostUpload.js'
import { requestUploadSas, registerAsset } from '../src/services/assetsApi.js'
import { uploadBlobWithSas } from '../src/utils/imageUpload.js'

vi.mock('../src/services/assetsApi.js', () => ({ requestUploadSas: vi.fn(), registerAsset: vi.fn() }))
vi.mock('../src/utils/imageUpload.js', async (importOriginal) => ({
  ...await importOriginal(),
  uploadBlobWithSas: vi.fn(),
}))

let root
let host
let upload
const msalInstance = {}
const image = new File(['image-fixture'], 'image.gif', { type: 'image/gif' })
const photo = new File(['photo-fixture'], 'photo.jpg', { type: 'image/jpeg' })

function Probe() {
  const result = usePostUpload({ msalInstance, postId: 'post-1' })
  useLayoutEffect(() => { upload = result })
  return <output>{String(result.uploading)}</output>
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('createImageBitmap', vi.fn())
  uploadBlobWithSas.mockReset()
  uploadBlobWithSas.mockResolvedValue(undefined)
  registerAsset.mockReset()
  requestUploadSas.mockImplementation(async ({ fileName }) => ({
    uploadUrl: `https://upload.example.test/${fileName}`,
    blobUrl: `https://image.example.test/${fileName}`,
  }))
  registerAsset.mockImplementation(async ({ blobUrl }) => ({ blobUrl, signedUrl: `${blobUrl}?sig=1` }))
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

it('keeps saving blocked until every inline image upload completes', async () => {
  const complete = []
  const deferred = () => new Promise((resolve) => complete.push(resolve))
  uploadBlobWithSas.mockImplementationOnce(deferred).mockImplementationOnce(deferred)
  let first
  let second
  await act(async () => { first = upload.uploadHtmlImage(image) })
  await act(async () => { second = upload.uploadHtmlImage(photo) })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[1](); await second })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[0](); await first })
  expect(upload.uploading).toBe(false)
  await expect(first).resolves.toBe('https://image.example.test/image.gif?sig=1')
  expect(registerAsset).toHaveBeenCalledTimes(2)
  expect(registerAsset).toHaveBeenCalledWith(expect.objectContaining({ postId: 'post-1', contentType: 'image/gif' }), { msalInstance })
})

it('rejects files that are not images and never uploads a thumbnail from the admin', async () => {
  const text = new File(['notes'], 'notes.txt', { type: 'text/plain' })
  await act(async () => {
    await expect(upload.uploadHtmlImage(text)).rejects.toThrow('지원하지 않는 이미지 형식입니다')
  })
  expect(upload.uploading).toBe(false)
  expect(requestUploadSas).not.toHaveBeenCalled()
  // 게시된 글의 썸네일은 GitHub Actions 'Post thumbnails'가 만든다.
  expect(upload.uploadThumbnailFile).toBeUndefined()
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
