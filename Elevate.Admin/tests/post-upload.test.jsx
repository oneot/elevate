// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePostUpload } from '../src/hooks/usePostUpload.js'
import { requestUploadSas, registerAsset } from '../src/services/assetsApi.js'
import { createImageVariantBlob, optimizeThumbnailForUpload, uploadBlobWithSas } from '../src/utils/imageUpload.js'

vi.mock('../src/services/assetsApi.js', () => ({ requestUploadSas: vi.fn(), registerAsset: vi.fn() }))
vi.mock('../src/utils/imageUpload.js', async (importOriginal) => ({
  ...await importOriginal(),
  uploadBlobWithSas: vi.fn(),
  optimizeThumbnailForUpload: vi.fn(),
  createImageVariantBlob: vi.fn(),
}))

let root
let host
let upload
const msalInstance = {}
const image = new File(['image-fixture'], 'image.gif', { type: 'image/gif' })
const generated = new File(['png-fixture'], 'auto-thumbnail.png', { type: 'image/png' })

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
  optimizeThumbnailForUpload.mockImplementation(async (file) => file)
  createImageVariantBlob.mockImplementation(async (_file, spec) => ({
    blob: new Blob([spec.key], { type: 'image/webp' }),
    type: 'image/webp',
    width: spec.maxWidth,
    height: Math.round((spec.maxWidth * 9) / 16),
  }))
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

it('keeps saving blocked until both the generated thumbnail and inline image uploads complete', async () => {
  const complete = []
  const deferred = () => new Promise((resolve) => complete.push(resolve))
  uploadBlobWithSas.mockImplementationOnce(deferred).mockImplementationOnce(deferred)
  let thumbnail
  let inline
  await act(async () => { thumbnail = upload.uploadThumbnailFile(generated, { alt: '제목' }) })
  await act(async () => { inline = upload.uploadHtmlImage(image) })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[1](); await inline })
  expect(upload.uploading).toBe(true)
  await act(async () => { complete[0](); await thumbnail })
  expect(upload.uploading).toBe(false)
  // 원본 1 + 카드용 3 + 본문 이미지 1
  expect(registerAsset).toHaveBeenCalledTimes(5)
})

it('returns a thumbnail object with every card variant the public site needs', async () => {
  let thumbnail
  await act(async () => { thumbnail = await upload.uploadThumbnailFile(generated, { alt: '공동 작업 안내' }) })
  expect(thumbnail).toMatchObject({
    url: 'https://image.example.test/auto-thumbnail.png',
    signedUrl: 'https://image.example.test/auto-thumbnail.png?sig=1',
    alt: '공동 작업 안내',
    mimeType: 'image/png',
  })
  expect(Object.keys(thumbnail.variants)).toEqual(['thumb', 'card', 'hero'])
  expect(thumbnail.variants.hero).toMatchObject({ width: 1440, height: 810, type: 'image/webp', url: 'https://image.example.test/auto-thumbnail-hero.webp' })
  expect(registerAsset).toHaveBeenCalledWith(expect.objectContaining({ postId: 'post-1' }), { msalInstance })
})

it('fails instead of saving a thumbnail without card variants', async () => {
  createImageVariantBlob.mockRejectedValueOnce(new Error('encode failed'))
  await act(async () => {
    await expect(upload.uploadThumbnailFile(generated)).rejects.toThrow('encode failed')
  })
  expect(upload.uploading).toBe(false)
})

it('rejects a thumbnail format that cannot produce variants', async () => {
  await act(async () => {
    await expect(upload.uploadThumbnailFile(image)).rejects.toThrow('썸네일 크기별 이미지를 만들 수 없습니다')
  })
  expect(upload.uploading).toBe(false)
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
