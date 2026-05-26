# Attachment Delete Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게시글 편집 시 기존 첨부파일 목록을 서버에서 불러오고, 각 파일에 삭제(확인 인라인 UI) 기능을 제공한다.

**Architecture:** 서버에 `GET /api/admin/files?postId=...` 엔드포인트를 추가하고, 클라이언트 API에 `getFiles`/`deleteFile` 함수를 추가한다. `AttachUploader.jsx`는 마운트 시 기존 파일 목록을 로드하고, 각 행에 삭제 버튼과 인라인 확인 UI를 제공한다.

**Tech Stack:** Node.js (Azure Functions v4), Cosmos DB, React 18, Tailwind CSS

---

## File Map

| 역할 | 파일 | 변경 |
|------|------|------|
| Server controller | `Elevate.Server/src/controllers/adminController.js` | `getFiles` 핸들러 추가 |
| Server function route | `Elevate.Server/src/functions/adminGetFiles.js` | **신규 생성** |
| Server function registry | `Elevate.Server/src/functions/index.js` | `adminGetFiles` 등록 |
| Client API | `Elevate.Admin/src/services/assetsApi.js` | `getFiles`, `deleteFile` 추가 |
| UI component | `Elevate.Admin/src/components/editor/AttachUploader.jsx` | 목록 조회 + 삭제 UI |

---

### Task 1: Server — `getFiles` controller handler 추가

**Files:**
- Modify: `Elevate.Server/src/controllers/adminController.js` (파일 끝, `exports.getAnalyticsSummary` 바로 앞)

- [ ] **Step 1: `adminController.js`에 `getFiles` 핸들러 추가**

`exports.deleteFile` 블록(line ~806) 바로 다음, `exports.getAnalyticsSummary` 바로 앞에 아래 코드를 삽입한다:

```js
exports.getFiles = async (req, res) => {
  const correlationId = req.correlationId;
  const postId = req.query?.postId;

  if (!postId) {
    return sendError(res, 400, 'BadRequest', 'postId query parameter is required', correlationId);
  }

  try {
    const container = getAssetsContainer();
    const querySpec = {
      query: 'SELECT c.id, c.fileName, c.blobUrl FROM c WHERE c.postId = @postId AND c.documentType = "attach"',
      parameters: [{ name: '@postId', value: postId }]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    return res.json(resources);
  } catch (error) {
    console.error('[getFiles] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
```

- [ ] **Step 2: 문법 오류 없는지 확인**

```bash
cd Elevate.Server && node -e "require('./src/controllers/adminController')" && echo "OK"
```

Expected: `OK` (에러 없음)

- [ ] **Step 3: 커밋**

```bash
git add Elevate.Server/src/controllers/adminController.js
git commit -m "feat(server): add getFiles controller handler

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Server — `adminGetFiles.js` 라우터 생성 + `index.js` 등록

**Files:**
- Create: `Elevate.Server/src/functions/adminGetFiles.js`
- Modify: `Elevate.Server/src/functions/index.js`

- [ ] **Step 1: `adminGetFiles.js` 파일 생성**

`Elevate.Server/src/functions/adminGetFiles.js` 를 아래 내용으로 생성:

```js
const { getFiles } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminGetFilesHandler = createControllerHandler(getFiles, {
  name: 'adminGetFiles',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminGetFiles',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/files',
  handler: adminGetFilesHandler
};

module.exports = {
  functionDefinition,
  adminGetFilesHandler
};
```

- [ ] **Step 2: `index.js`에 `adminGetFiles` 등록**

`Elevate.Server/src/functions/index.js` 를 아래와 같이 수정:

`adminCreateFile` import 바로 위에 아래 줄 추가:
```js
const { functionDefinition: adminGetFiles } = require('./adminGetFiles');
```

`functionDefinitions` 배열에서 `adminIssueFileSas` 주석 아래, `adminCreateFile` 바로 위에 `adminGetFiles` 추가:
```js
  adminIssueFileSas, // literal route (api/admin/files/sas) — must be before adminCreateFile and adminGetFiles
  adminGetFiles,
  adminCreateFile,
```

최종 `functionDefinitions` 배열 전체:
```js
const functionDefinitions = [
  health,
  publicPostsList,
  publicPostDetail,
  publicSeriesByCategory,
  publicSeriesPosts,
  publicTags,
  adminPostsList,
  adminPostDetail,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminIssueAssetSas,
  adminCreateAsset,
  adminDeleteAsset,
  adminIssueFileSas, // literal route (api/admin/files/sas) — must be before adminCreateFile and adminGetFiles
  adminGetFiles,
  adminCreateFile,
  adminDeleteFile,
  adminAnalyticsSummary
];
```

- [ ] **Step 3: 문법 오류 없는지 확인**

```bash
cd Elevate.Server && node -e "require('./src/functions/index')" && echo "OK"
```

Expected: `OK`

- [ ] **Step 4: 커밋**

```bash
git add Elevate.Server/src/functions/adminGetFiles.js Elevate.Server/src/functions/index.js
git commit -m "feat(server): add GET /api/admin/files endpoint

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Client API — `getFiles`, `deleteFile` 함수 추가

**Files:**
- Modify: `Elevate.Admin/src/services/assetsApi.js`

- [ ] **Step 1: `assetsApi.js`에 두 함수 추가**

파일 끝에 아래 코드 추가:

```js
/**
 * 게시글에 등록된 첨부파일 목록을 조회한다.
 * @param {string} postId
 * @param {{ msalInstance }} options
 * @returns {Promise<Array<{ id: string, fileName: string, blobUrl: string }>>}
 */
export function getFiles(postId, options = {}) {
  return apiFetch(`/files?postId=${encodeURIComponent(postId)}`, {
    ...options,
    method: 'GET',
  })
}

/**
 * 첨부파일을 서버 DB와 Blob Storage에서 삭제한다.
 * @param {string} fileId
 * @param {{ msalInstance }} options
 * @returns {Promise<null>} 성공 시 null (204 No Content)
 */
export function deleteFile(fileId, options = {}) {
  return apiFetch(`/files/${encodeURIComponent(fileId)}`, {
    ...options,
    method: 'DELETE',
  })
}
```

- [ ] **Step 2: 커밋**

```bash
git add Elevate.Admin/src/services/assetsApi.js
git commit -m "feat(client): add getFiles and deleteFile API functions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: UI — `AttachUploader.jsx` 목록 조회 + 삭제 기능 구현

**Files:**
- Modify: `Elevate.Admin/src/components/editor/AttachUploader.jsx`

- [ ] **Step 1: `AttachUploader.jsx` 전체 교체**

파일 내용을 아래로 교체한다:

```jsx
import { useEffect, useRef, useState } from 'react'
import { requestAttachUploadSas, registerFile, getFiles, deleteFile } from '../../services/assetsApi.js'
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
  const [files, setFiles] = useState([])      // [{ id, fileName, blobUrl, isDeleting }]
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!postId) return
    setLoadingFiles(true)
    getFiles(postId, { msalInstance })
      .then(data => setFiles(data.map(f => ({ ...f, isDeleting: false }))))
      .catch(() => {})
      .finally(() => setLoadingFiles(false))
  }, [postId])

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
      setFiles(prev => [...prev, { id: result.fileId, fileName: file.name, blobUrl, isDeleting: false }])
      setStatus('done')
    } catch {
      setError('업로드에 실패했습니다.')
      setStatus('error')
    }
  }

  async function handleDelete(fileId) {
    setConfirmDeleteId(null)
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isDeleting: true } : f))
    try {
      await deleteFile(fileId, { msalInstance })
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isDeleting: false } : f))
      setError('파일 삭제에 실패했습니다.')
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

      {loadingFiles && (
        <p className="text-xs text-neutral-400">파일 목록 불러오는 중...</p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className={`flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs${f.isDeleting ? ' opacity-50' : ''}`}
            >
              <span className="flex-1 truncate font-medium text-neutral-700">{f.fileName}</span>
              {confirmDeleteId === f.id ? (
                <span className="flex items-center gap-1 shrink-0">
                  <span className="text-neutral-500">삭제할까요?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-200 transition-colors font-semibold"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="rounded px-2 py-1 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    확인
                  </button>
                </span>
              ) : f.isDeleting ? (
                <span className="shrink-0 text-xs text-neutral-400">삭제 중...</span>
              ) : (
                <span className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(f.blobUrl)}
                    className="rounded px-2 py-1 text-ms-blue hover:bg-ms-blue/10 transition-colors font-semibold"
                  >
                    URL 복사
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(f.id)}
                    className="rounded px-2 py-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="삭제"
                  >
                    🗑️
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add Elevate.Admin/src/components/editor/AttachUploader.jsx
git commit -m "feat(editor): load existing files and add delete with inline confirm

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: 빌드 검증 + 푸시

**Files:** 없음 (검증 단계)

- [ ] **Step 1: Admin 빌드 실행**

```bash
cd Elevate.Admin && npm run build
```

Expected: `✓ built in` 메시지, 에러 없음 (warnings 허용)

- [ ] **Step 2: 브랜치 푸시**

```bash
git push origin YoonKeumJae/editor-enhancements
```

Expected: `Branch 'YoonKeumJae/editor-enhancements' set up to track remote branch`
