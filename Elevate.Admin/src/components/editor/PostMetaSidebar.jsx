/**
 * PostMetaSidebar
 *
 * PostEditor의 우측 메타데이터 패널.
 * 상태(status), slug, 카테고리, 태그, YouTube, 썸네일, 첨부파일을 관리한다.
 *
 * Props:
 *  - post           {object}   현재 게시글 상태
 *  - tagsInput      {string}   쉼표 구분 태그 문자열 (post.tags와 별도 관리)
 *  - youtubeInput   {string}   사용자가 입력한 YouTube URL (post.youtube는 ID만 저장)
 *  - youtubeError   {string}   YouTube URL 검증 오류 메시지
 *  - isUploading    {boolean}  썸네일 업로드 진행 중 여부
 *  - isNew          {boolean}  신규 게시글 여부 (카테고리 선택 가능 여부에 영향)
 *  - onChange       {function} handleChange(field)(event) — PostEditor에서 전달
 *  - onTagsChange   {function} tagsInput 변경 핸들러
 *  - onYoutubeChange{function} YouTube URL 변경 핸들러
 *  - onThumbnailUpload{function} 파일 선택 시 썸네일 업로드 핸들러 (File → void)
 *  - postId         {string|undefined} 첨부파일 업로더에 필요한 게시글 ID
 *  - categories     {Array<{value, label}>} 카테고리 목록
 */

import { Card, FormField } from '../ui/index.js'
import AttachUploader from './AttachUploader.jsx'

function PostMetaSidebar({
  post,
  tagsInput,
  youtubeInput,
  youtubeError,
  isUploading,
  isNew,
  onChange,
  onTagsChange,
  onYoutubeChange,
  onThumbnailUpload,
  postId,
  categories,
}) {
  return (
    <aside className="space-y-8">
      <Card colorScheme="slate" className="space-y-6">
        <h3 className="text-sm font-semibold text-neutral-800">메타데이터</h3>

        <FormField label="상태">
          <select
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={post.status}
            onChange={onChange('status')}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </FormField>

        <FormField label="카테고리">
          <select
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed"
            value={post.category}
            onChange={onChange('category')}
            disabled={!isNew}
          >
            {/* 신규 게시글에서만 카테고리를 선택할 수 있다. 기존 게시글은 카테고리 변경이 불가하다. */}
            {isNew && (
              <option value="" disabled>카테고리 선택</option>
            )}
            {categories.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="태그" hint="쉼표로 구분합니다.">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={tagsInput}
            onChange={(event) => onTagsChange(event.target.value)}
            placeholder="Azure, CosmosDB"
          />
        </FormField>

        <FormField label="YouTube">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={youtubeInput}
            onChange={onYoutubeChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {youtubeError && <p className="text-xs text-red-500 mt-1">{youtubeError}</p>}
          {post.youtube && !youtubeError && (
            <p className="text-xs text-neutral-400 mt-1">ID: {post.youtube}</p>
          )}
        </FormField>

        <FormField label="썸네일">
          {post.thumbnailUrl && (
            <div className="mb-2 w-full rounded-md border border-neutral-200 overflow-hidden bg-neutral-50 flex items-center justify-center">
              <img src={post.thumbnailUrl} alt="Thumbnail preview" className="max-h-40 w-auto object-contain" />
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const fileObj = event.target.files?.[0]
                if (fileObj) {
                  await onThumbnailUpload(fileObj)
                }
              }}
              className="w-full text-sm text-neutral-600 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 file:transition-colors file:cursor-pointer"
            />
          </div>
          {isUploading && <p className="text-xs text-ms-blue mt-1">썸네일 업로드 중...</p>}
        </FormField>
      </Card>

      <Card colorScheme="blue" className="space-y-4">
        <h3 className="text-base font-semibold text-neutral-700">첨부파일</h3>
        <p className="text-xs text-neutral-400">
          업로드 후 URL 복사 버튼으로 마크다운 콘텐츠에 붙여넣을 수 있습니다.
        </p>
        <AttachUploader postId={postId} />
      </Card>
    </aside>
  )
}

export default PostMetaSidebar
