/**
 * PostMetaSidebar
 *
 * PostEditor 오른쪽 패널: 게시 설정(앱·상태), 분류(태그·시리즈), 미디어(YouTube·썸네일), 첨부파일.
 *
 * Props:
 *  - post                        {object}   현재 게시글 상태
 *  - tagsInput                   {string}
 *  - youtubeInput                {string}
 *  - youtubeError                {string}
 *  - isUploading                 {boolean}
 *  - isNew                       {boolean}
 *  - selectedApp                 {string}   새 글에서 고른 앱 ('' = 미선택)
 *  - displayApp                  {string}   공개 사이트에 표시될 앱 (slug → 시리즈 → 태그로 계산)
 *  - onAppChange                 {function} 새 글의 앱 변경 핸들러
 *  - onChange                    {function}
 *  - seriesOptions               {string[]}
 *  - isCreatingNewSeries         {boolean}
 *  - newSeriesName               {string}
 *  - onSeriesSelectChange        {function}
 *  - onStartNewSeries            {function}
 *  - onCancelNewSeries           {function}
 *  - onNewSeriesNameChange       {function}
 *  - onSeriesOrderChange         {function}
 *  - onTagsChange                {function}
 *  - onYoutubeChange             {function}
 *  - onThumbnailUpload           {function}
 *  - onAttachmentUploadingChange {function}
 *  - postId                      {string|undefined}
 *  - draftSessionId              {string|undefined}
 */

import { useId } from 'react'
import { FormField } from '../ui/index.js'
import AttachUploader from './AttachUploader.jsx'
import { APP_KEYS, APP_LABELS, getAppTag, isAppKey } from '../../constants/apps.js'
import { getAppMeta } from '../../constants/appMeta.js'
import { STATUS_LABELS, STATUS_VALUES } from '../../constants/status.js'

function AppField({ id, isNew, selectedApp, displayApp, onAppChange }) {
  if (isNew) {
    return (
      <FormField
        label="앱"
        htmlFor={id}
        hint="공개 사이트에서 이 글이 표시될 앱입니다. 저장한 뒤에는 바꿀 수 없습니다."
      >
        <select id={id} className="ea-select" value={selectedApp} onChange={onAppChange}>
          <option value="" disabled>앱 선택</option>
          {APP_KEYS.map((app) => (
            <option key={app} value={app}>{APP_LABELS[app]}</option>
          ))}
        </select>
      </FormField>
    )
  }

  const meta = isAppKey(displayApp) ? getAppMeta(displayApp) : null
  return (
    <FormField label="앱" hint="공개 사이트 표시 앱은 slug → 시리즈 → 태그 순서로 정해집니다.">
      <span className="ea-appchip">
        {meta?.icon && <img src={meta.icon} alt="" width="20" height="20" />}
        {meta ? meta.name : displayApp || '-'}
      </span>
    </FormField>
  )
}

function PostMetaSidebar({
  post,
  tagsInput,
  youtubeInput,
  youtubeError,
  isUploading,
  isNew,
  selectedApp = '',
  displayApp = '',
  onAppChange,
  onChange,
  seriesOptions = [],
  isCreatingNewSeries = false,
  newSeriesName = '',
  onSeriesSelectChange,
  onStartNewSeries,
  onCancelNewSeries,
  onNewSeriesNameChange,
  onSeriesOrderChange,
  onTagsChange,
  onYoutubeChange,
  onThumbnailUpload,
  onAttachmentUploadingChange,
  postId,
  draftSessionId,
}) {
  const id = useId()
  const appTag = getAppTag(isNew ? selectedApp : displayApp)

  return (
    <>
      <section className="ea-panel">
        <h2 className="ea-panel__title">게시 설정</h2>
        <div className="ea-fields">
          <AppField
            id={`${id}-app`}
            isNew={isNew}
            selectedApp={selectedApp}
            displayApp={displayApp}
            onAppChange={onAppChange}
          />
          <FormField label="상태" htmlFor={`${id}-status`} hint="게시됨으로 저장하면 공개 사이트에 표시됩니다.">
            <select id={`${id}-status`} className="ea-select" value={post.status} onChange={onChange('status')}>
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      <section className="ea-panel">
        <h2 className="ea-panel__title">분류</h2>
        <div className="ea-fields">
          <FormField
            label="태그"
            htmlFor={`${id}-tags`}
            hint={appTag
              ? `쉼표로 구분합니다. ‘${appTag}’ 태그는 공개 사이트의 앱 분류에 쓰이므로 지우지 마세요.`
              : '쉼표로 구분합니다.'}
          >
            <input
              id={`${id}-tags`}
              className="ea-input"
              value={tagsInput}
              onChange={(event) => onTagsChange(event.target.value)}
              placeholder="Azure, CosmosDB"
            />
          </FormField>

          <FormField label="시리즈" htmlFor={`${id}-series`} hint="같은 시리즈명을 가진 게시글끼리 우측 시리즈 내비게이션으로 묶입니다.">
            {!isCreatingNewSeries ? (
              <div className="flex items-center gap-2">
                <select
                  id={`${id}-series`}
                  className="ea-select"
                  value={post.series || ''}
                  onChange={onSeriesSelectChange}
                >
                  <option value="">시리즈 선택 안함</option>
                  {seriesOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button type="button" onClick={onStartNewSeries} className="ea-btn ea-btn--secondary ea-btn--sm shrink-0">
                  새 시리즈
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  id={`${id}-series`}
                  className="ea-input"
                  value={newSeriesName}
                  onChange={onNewSeriesNameChange}
                  placeholder="새 시리즈 이름 입력"
                />
                <button type="button" onClick={onCancelNewSeries} className="ea-btn ea-btn--ghost ea-btn--sm">
                  기존 시리즈 선택
                </button>
              </div>
            )}
          </FormField>

          <FormField label="시리즈 순서" htmlFor={`${id}-series-order`} hint="시리즈를 입력한 경우에만 사용합니다. 1 이상의 숫자만 허용됩니다.">
            <input
              id={`${id}-series-order`}
              type="number"
              min="1"
              step="1"
              className="ea-input"
              value={post.seriesOrder ?? ''}
              onChange={onSeriesOrderChange}
              placeholder="1"
              disabled={!post.series?.trim()}
            />
          </FormField>
        </div>
      </section>

      <section className="ea-panel">
        <h2 className="ea-panel__title">미디어</h2>
        <div className="ea-fields">
          <FormField label="YouTube" htmlFor={`${id}-youtube`} error={youtubeError}>
            <input
              id={`${id}-youtube`}
              className="ea-input"
              value={youtubeInput}
              onChange={onYoutubeChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {post.youtube && !youtubeError && (
              <p className="text-xs text-[#86868b]">ID: {post.youtube}</p>
            )}
          </FormField>

          <FormField label="썸네일" htmlFor={`${id}-thumbnail`}>
            {post.thumbnailUrl && (
              <div className="ea-thumb-preview">
                <img src={post.thumbnailUrl} alt="썸네일 미리보기" />
              </div>
            )}
            <input
              id={`${id}-thumbnail`}
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const fileObj = event.target.files?.[0]
                if (!fileObj) return
                try {
                  await onThumbnailUpload(fileObj)
                } catch {
                  // 업로드 실패 시 파일 선택을 초기화해 재시도할 수 있도록 한다.
                  event.target.value = ''
                }
              }}
              className="ea-file"
            />
            {isUploading && <p className="text-xs text-ms-blue">썸네일 업로드 중...</p>}
          </FormField>
        </div>
      </section>

      <section className="ea-panel">
        <h2 className="ea-panel__title">첨부파일</h2>
        <p className="ea-panel__desc">업로드 후 URL 복사 버튼으로 본문에 붙여넣을 수 있습니다.</p>
        <AttachUploader
          postId={postId}
          draftSessionId={draftSessionId}
          onUploadingChange={onAttachmentUploadingChange}
        />
      </section>
    </>
  )
}

export default PostMetaSidebar
