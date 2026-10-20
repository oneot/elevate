// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { buildAttachmentLink, copyAttachmentLink, displayFileName } from '../src/utils/attachmentLink.js'

const nfdName = '멘토링 제출 서류.docx'.normalize('NFD')
const file = {
  fileName: nfdName,
  blobUrl: 'https://store.blob.core.windows.net/attachments/attach/2026/10/abc.docx',
  signedUrl: 'https://store.blob.core.windows.net/attachments/attach/2026/10/abc.docx?sv=1&sig=secret',
}

const readBlob = (blob) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.readAsText(blob)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('shows macOS (NFD) Korean file names as composed text', () => {
  expect(nfdName).not.toBe('멘토링 제출 서류.docx')
  expect(displayFileName(nfdName)).toBe('멘토링 제출 서류.docx')
  expect(displayFileName('  report.pdf ')).toBe('report.pdf')
})

it('links the unsigned blob URL with the file name as the visible text', () => {
  expect(buildAttachmentLink(file)).toEqual({
    href: file.blobUrl,
    label: '멘토링 제출 서류.docx',
    html: `<a href="${file.blobUrl}">멘토링 제출 서류.docx</a>`,
  })
  expect(buildAttachmentLink({ fileName: '<a&b>.pdf', blobUrl: 'https://x.test/a?b=1&c="2"' }).html)
    .toBe('<a href="https://x.test/a?b=1&amp;c=&quot;2&quot;">&lt;a&amp;b&gt;.pdf</a>')
  expect(buildAttachmentLink({ fileName: '', signedUrl: 'https://x.test/f.pdf' }).label).toBe('https://x.test/f.pdf')
})

it('copies a rich link so pasting into the body shows only the file name', async () => {
  const items = []
  class FakeClipboardItem {
    constructor(data) { this.data = data }
  }
  const write = vi.fn(async (value) => { items.push(...value) })
  vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  vi.stubGlobal('navigator', { clipboard: { write } })
  await copyAttachmentLink(file)
  expect(write).toHaveBeenCalledTimes(1)
  expect(await readBlob(items[0].data['text/html'])).toBe(`<a href="${file.blobUrl}">멘토링 제출 서류.docx</a>`)
  expect(await readBlob(items[0].data['text/plain'])).toBe(file.blobUrl)
})

it('falls back to a copy event when the async clipboard is unavailable or refused', async () => {
  const setData = vi.fn()
  document.execCommand = vi.fn(() => {
    const event = new Event('copy', { cancelable: true })
    event.clipboardData = { setData }
    document.dispatchEvent(event)
    return true
  })
  vi.stubGlobal('ClipboardItem', class {})
  vi.stubGlobal('navigator', { clipboard: { write: vi.fn().mockRejectedValue(new Error('NotAllowedError')) } })
  await copyAttachmentLink(file)
  expect(setData).toHaveBeenCalledWith('text/html', `<a href="${file.blobUrl}">멘토링 제출 서류.docx</a>`)
  expect(setData).toHaveBeenCalledWith('text/plain', file.blobUrl)

  document.execCommand = vi.fn(() => false)
  await expect(copyAttachmentLink(file)).rejects.toThrow('CLIPBOARD_UNAVAILABLE')
})
