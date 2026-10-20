/**
 * PostMetaSidebar
 *
 * PostEditor 오른쪽 열의 게시 설정(앱·상태·썸네일)과 첨부파일 패널.
 * 제목·요약은 PostEditor가 같은 열 위쪽에 따로 그린다.
 *
 * Props:
 *  - isNew                       {boolean}
 *  - selectedApp                 {string}   새 글에서 고른 앱 ('' = 미선택)
 *  - displayApp                  {string}   공개 사이트에 표시될 앱 (기존 글은 slug → 시리즈 → 태그로 계산)
 *  - onAppChange                 {function} 새 글의 앱 변경 핸들러
 *  - statusValue                 {'published'|'archived'}
 *  - onStatusChange              {function}
 *  - thumbnail                   {{ src: string, srcSet?: string } | null}  공개 카드에 표시되는 썸네일 (없으면 null)
 *  - onAttachmentUploadingChange {function}
 *  - postId                      {string|undefined}
 *  - draftSessionId              {string|undefined}
 */

import { useId, useState } from 'react'
import { FormField } from '../ui/index.js'
import AttachUploader from './AttachUploader.jsx'
import { APP_KEYS, APP_LABELS, isAppKey } from '../../constants/apps.js'
import { getAppMeta } from '../../constants/appMeta.js'
import { STATUS_OPTIONS } from '../../constants/status.js'

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
    <div className="flex flex-col gap-1.5">
      <p className="text-[13.5px] font-semibold text-[#424245]">앱</p>
      <span className="ea-appchip">
        {meta?.icon && <img src={meta.icon} alt="" width="20" height="20" />}
        {meta ? meta.name : displayApp || '-'}
      </span>
    </div>
  )
}

/**
 * 읽기 전용 썸네일 미리보기. 썸네일이 아직 없으면(새 글 등) 칸을 보여 주지 않는다.
 * 이미지를 불러오지 못하면 깨진 이미지 대신 안내를 보여 준다.
 */
function ThumbnailPreview({ thumbnail }) {
  const [failedSrc, setFailedSrc] = useState('')
  const src = thumbnail?.src || ''
  if (!src) return null
  const failed = failedSrc === src

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13.5px] font-semibold text-[#424245]">썸네일</p>
      <div className="ea-thumb-preview">
        {failed ? (
          <span className="ea-thumb-preview__empty">미리보기를 불러오지 못했습니다.</span>
        ) : (
          <img
            src={src}
            srcSet={thumbnail.srcSet || undefined}
            sizes={thumbnail.srcSet ? '360px' : undefined}
            alt="썸네일 미리보기"
            onError={() => setFailedSrc(src)}
          />
        )}
      </div>
      <p className="text-[12.5px] leading-relaxed text-[#86868b]">
        공개 사이트 카드에 표시되는 썸네일입니다. 글을 수정해도 바뀌지 않습니다.
      </p>
    </div>
  )
}

function PostMetaSidebar({
  isNew,
  selectedApp = '',
  displayApp = '',
  onAppChange,
  statusValue,
  onStatusChange,
  thumbnail = null,
  onAttachmentUploadingChange,
  postId,
  draftSessionId,
}) {
  const id = useId()

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
          <FormField label="상태" htmlFor={`${id}-status`} hint="게시로 저장하면 공개 사이트에 표시되고, 보관은 공개하지 않습니다.">
            <select id={`${id}-status`} className="ea-select" value={statusValue} onChange={onStatusChange}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
          <ThumbnailPreview thumbnail={thumbnail} />
        </div>
      </section>

      <section className="ea-panel">
        <h2 className="ea-panel__title">첨부파일</h2>
        <p className="ea-panel__desc">링크를 복사해 본문에 붙여 넣으면 파일 이름으로 표시됩니다.</p>
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
