# 첨부파일 삭제 기능 설계

**날짜**: 2026-05-26  
**대상 브랜치**: `YoonKeumJae/editor-enhancements`  
**범위**: 게시글 에디터의 일반 첨부파일(docx/xlsx/pptx/pdf/csv/zip 등) 삭제 기능

---

## 목표

- 게시글 편집 시 이미 등록된 첨부파일을 목록에 표시한다.
- 목록의 각 파일에 삭제 버튼을 추가해 서버 DB와 Blob에서 삭제할 수 있게 한다.
- 삭제 전 인라인 확인 UI를 표시해 실수 삭제를 방지한다.

---

## 아키텍처

### 변경 범위

| 레이어 | 파일 | 변경 종류 |
|--------|------|-----------|
| Server | `adminController.js` | `getFiles` 핸들러 추가 |
| Server | `adminGetFiles.js` | 신규 라우터 파일 생성 |
| Client API | `assetsApi.js` | `getFiles`, `deleteFile` 함수 추가 |
| UI | `AttachUploader.jsx` | 목록 조회 + 삭제 UI |

**기존 서버 삭제 엔드포인트** `DELETE /api/admin/files/{fileId}` (adminDeleteFile.js) — 변경 없음.

---

## 섹션 1: 서버 — `getFiles` 엔드포인트

### `adminGetFiles.js` (신규)

```
GET /api/admin/files?postId={postId}
Auth: requireAdminAuth
```

- `postId` 쿼리 파라미터 필수. 없으면 400 반환.
- Cosmos DB `files` 컨테이너에서 `postId` 기준 필터 쿼리.
- 응답 (200):
  ```json
  [
    { "id": "<fileId>", "fileName": "report.pdf", "blobUrl": "https://..." }
  ]
  ```
- 결과가 없으면 빈 배열 `[]` 반환.

### `adminController.js` — `getFiles` 핸들러

- Cosmos DB `files` 컨테이너를 `WHERE c.postId = @postId`로 쿼리.
- 결과를 `{ id, fileName, blobUrl }` 배열로 매핑해 반환.

---

## 섹션 2: 클라이언트 API — `assetsApi.js`

```js
// 게시글의 첨부파일 목록 조회
export async function getFiles(postId, { msalInstance } = {}) { ... }

// 첨부파일 삭제
export async function deleteFile(fileId, { msalInstance } = {}) { ... }
```

- `getFiles`: `GET /api/admin/files?postId={postId}` — 배열 반환
- `deleteFile`: `DELETE /api/admin/files/{fileId}` — 성공 시 void (204 응답)

---

## 섹션 3: UI — `AttachUploader.jsx`

### State 변경

기존:
```js
const [uploadedFiles, setUploadedFiles] = useState([])
// [{ fileName, blobUrl }]
```

변경 후:
```js
const [files, setFiles] = useState([])
// [{ id, fileName, blobUrl, isDeleting }]
const [loadingFiles, setLoadingFiles] = useState(false)
const [confirmDeleteId, setConfirmDeleteId] = useState(null)
```

### 마운트 시 기존 파일 로드

```js
useEffect(() => {
  if (!postId) return
  setLoadingFiles(true)
  getFiles(postId, { msalInstance })
    .then(data => setFiles(data.map(f => ({ ...f, isDeleting: false }))))
    .catch(() => {/* 에러 무시 — 목록 없어도 업로드는 가능 */})
    .finally(() => setLoadingFiles(false))
}, [postId])
```

### 업로드 완료 시

```js
setFiles(prev => [...prev, { id: result.fileId, fileName: file.name, blobUrl, isDeleting: false }])
```

(`result.fileId`는 `createFileMetadata` 응답에 이미 포함됨)

### 삭제 플로우

1. 🗑️ 버튼 클릭 → `setConfirmDeleteId(file.id)` → 해당 행에 인라인 확인 UI 표시
2. **취소** 클릭 → `setConfirmDeleteId(null)`
3. **확인** 클릭 → `setFiles`에서 해당 항목 `isDeleting: true` 설정 → `deleteFile(id)` 호출 → 성공 시 목록에서 제거, 실패 시 `isDeleting: false` 복원 + 에러 메시지

### 인라인 확인 UI

파일 행 예시 (confirmDeleteId === file.id일 때):
```
[ 📄 report.pdf ]  [ 삭제할까요? ]  [취소]  [확인]
```

`isDeleting: true`인 파일 행: opacity 낮춤(disabled), "삭제 중..." 텍스트 표시.

### 에러 처리

- 파일 목록 로드 실패: 무시 (업로드는 가능)
- 삭제 실패: 에러 메시지 표시, 행 복원

---

## 범위 외

- 이미지(asset) 삭제: 본문 에디터 내 이미지는 이번 범위에 포함하지 않는다.
- 파일 순서 변경, 파일 다운로드: 이번 범위에 포함하지 않는다.
- 신규 게시글(`postId = null`)에서는 마운트 시 목록 조회를 수행하지 않는다.
