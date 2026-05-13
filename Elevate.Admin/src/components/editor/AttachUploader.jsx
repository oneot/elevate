import { useRef, useState } from 'react'
import { requestAttachUploadSas, registerFile } from '../../services/assetsApi.js'
import { uploadBlobWithSas } from '../../utils/imageUpload.js'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * 브라우저가 MIME 타입을 올바르게 감지하지 못하는 Office 포맷을 위한
 * 확장자 → MIME 타입 명시 맵핑. file.type 이 비어 있거나 잘못된 경우의 폴백으로 사용한다.
 */
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

/** 첨부파일 최대 크기: 50MB */
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
      // 1단계: 서버에서 Azure Blob SAS URL을 발급받는다.
      const sas = await requestAttachUploadSas(
        { fileName: file.name, contentType, sizeBytes: file.size },
        { msalInstance }
      )

      // 2단계: SAS URL을 사용해 Azure Blob Storage에 직접 업로드한다.
      await uploadBlobWithSas(sas.uploadUrl, file, contentType)

      // 3단계: 업로드 완료된 Blob 정보를 서버에 등록해 자산 레코드를 생성한다.
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
    } catch {
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
