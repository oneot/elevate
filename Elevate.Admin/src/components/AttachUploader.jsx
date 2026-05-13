import { useRef, useState } from 'react'
import { requestAttachUploadSas, registerFile } from '../lib/postsApi.js'
import { uploadBlobWithSas } from '../lib/imageUpload.js'
import { useAuth } from '../hooks/useAuth.js'

const ATTACH_MIME_MAP = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.zip': 'application/zip',
  '.xls': 'application/vnd.ms-excel',
  '.doc': 'application/msword',
}

const MAX_ATTACH_BYTES = 50 * 1024 * 1024

function getContentType(file) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  return ATTACH_MIME_MAP[ext] || file.type || 'application/octet-stream'
}

export default function AttachUploader({ postId }) {
  const { msalInstance } = useAuth()
  const inputRef = useRef(null)
  const [status, setStatus] = useState(null) // null | 'uploading' | 'done' | 'error'
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [error, setError] = useState(null)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!event.target) return
    event.target.value = ''
    if (!file) return

    setError(null)

    if (file.size > MAX_ATTACH_BYTES) {
      setError(`파일 크기가 50MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    const contentType = getContentType(file)
    if (!Object.values(ATTACH_MIME_MAP).includes(contentType)) {
      setError('지원하지 않는 파일 형식입니다. (.docx .xlsx .pptx .pdf .csv .zip .xls .doc)')
      return
    }

    setStatus('uploading')
    try {
      const sas = await requestAttachUploadSas(
        { fileName: file.name, contentType, sizeBytes: file.size },
        { msalInstance }
      )

      await uploadBlobWithSas(sas.uploadUrl, file, contentType)

      const result = await registerFile(
        {
          postId: postId || null,
          blobUrl: sas.blobUrl,
          fileName: file.name,
          contentType,
          sizeBytes: file.size,
        },
        { msalInstance }
      )

      const blobUrl = result?.url || sas.blobUrl
      setUploadedFiles((prev) => [...prev, { fileName: file.name, blobUrl }])
      setStatus('done')
    } catch (err) {
      console.error('[AttachUploader] upload failed', err)
      setError('업로드에 실패했습니다.')
      setStatus('error')
    }
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.xlsx,.pptx,.pdf,.csv,.zip,.xls,.doc"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'uploading'}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? '업로드 중...' : '파일 선택'}
        </button>
        <span className="text-xs text-neutral-400">
          docx · xlsx · pptx · pdf · csv · zip · xls · doc (최대 50MB)
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-600">{error}</p>
      )}

      {uploadedFiles.length > 0 && (
        <ul className="space-y-2">
          {uploadedFiles.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs"
            >
              <span className="flex-1 truncate font-medium text-neutral-700">{f.fileName}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(f.blobUrl)}
                className="shrink-0 rounded px-2 py-1 text-ms-blue hover:bg-ms-blue/10 transition-colors font-semibold"
              >
                URL 복사
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
