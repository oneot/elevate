/**
 * 첨부파일을 본문에 넣는 링크.
 * 본문에는 파일 이름이 글자로 보이게 하고, 주소는 서명(SAS) 없는 Blob URL을 쓴다.
 * (서버는 저장할 때 본문의 Blob URL에서 서명을 떼고, 공개 사이트에서 읽을 때 다운로드 파일 이름과 함께 다시 서명한다.)
 */

/** 첨부파일 이름. macOS에서 올린 한글 이름(자모가 분리된 NFD)을 NFC로 합친다. */
export function displayFileName(name) {
  return String(name || '').normalize('NFC').trim()
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * @param {{ fileName?: string, blobUrl?: string, signedUrl?: string }} file
 * @returns {{ href: string, label: string, html: string }}
 */
export function buildAttachmentLink(file) {
  const href = file?.blobUrl || file?.signedUrl || ''
  const label = displayFileName(file?.fileName) || href
  return { href, label, html: `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>` }
}

/** 클릭 이벤트 안에서 copy 이벤트로 HTML·텍스트를 함께 넣는다 (비동기 Clipboard API를 못 쓸 때). */
function copyWithCopyEvent(html, text) {
  let copied = false
  const onCopy = (event) => {
    event.clipboardData.setData('text/html', html)
    event.clipboardData.setData('text/plain', text)
    event.preventDefault()
    copied = true
  }
  document.addEventListener('copy', onCopy)
  try {
    document.execCommand('copy')
  } finally {
    document.removeEventListener('copy', onCopy)
  }
  return copied
}

/**
 * 첨부 링크를 클립보드에 복사한다. 본문 편집기에 붙여 넣으면 파일 이름으로 된 링크가 들어가고,
 * 일반 입력란에 붙여 넣으면 URL이 들어간다.
 * @param {{ fileName?: string, blobUrl?: string, signedUrl?: string }} file
 */
export async function copyAttachmentLink(file) {
  const { href, html } = buildAttachmentLink(file)
  if (!href) throw new Error('ATTACHMENT_URL_MISSING')
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([href], { type: 'text/plain' }),
      })])
      return
    } catch {
      // 권한·브라우저 제한이면 아래 copy 이벤트 방식으로 다시 시도한다.
    }
  }
  if (!copyWithCopyEvent(html, href)) throw new Error('CLIPBOARD_UNAVAILABLE')
}
