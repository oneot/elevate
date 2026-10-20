import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { ConfirmModal, FormField, Notice } from '../components/ui/index.js'
import { HtmlEditor, PostMetaSidebar } from '../components/editor/index.js'
import AppHero from '../components/apps/AppHero.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import { createPost, deletePost, getPost, updatePost } from '../services/postsApi.js'
import { linkDraftFilesToPost } from '../services/assetsApi.js'
import { formatDate } from '../utils/formatters.js'
import { getPublicThumbImage } from '../utils/publicThumbs.js'
import { withDisplayText } from '../utils/postText.js'
import {
  ALL_APPS_KEY,
  BASE_CATEGORIES,
  applyAppTag,
  getApiCategory,
  getDisplayCategory,
  isAppKey,
} from '../constants/apps.js'
import { getAppMeta } from '../constants/appMeta.js'
import { ARCHIVED, PUBLISHED, getStatusLabel, isPublished } from '../constants/status.js'
import { useAuth } from '../hooks/useAuth.js'
import { usePostUpload } from '../hooks/usePostUpload.js'
import { useAdminPosts } from '../hooks/adminPosts.js'
import { useDbarSlot, usePageApp } from '../hooks/shell.js'

/**
 * 신규 게시글 초기 상태. 새 글은 보관 상태로 시작한다.
 * slug·tags·series는 화면에서 고치지 않는다 (slug는 서버가 만들고, 기존 값은 그대로 유지된다).
 */
const emptyPost = {
  title: '',
  status: ARCHIVED,
  category: '',
  tags: [],
  slug: '',
  series: '',
  excerpt: '',
  htmlBody: '',
  thumbnail: null,
  thumbnailUrl: '',
}

const ATTACHMENT_LINK_WARNING = '첨부파일 연결에 실패했습니다. 저장된 게시글에서 다시 확인해 주세요.'

/** 새 글 주소의 앱 (?app=, 이전 주소 호환용 ?category=). */
function getInitialApp(searchParams) {
  const app = searchParams.get('app') || searchParams.get('category')
  return isAppKey(app) ? app : ''
}

/** 글자·이미지·영상 중 하나라도 있으면 본문이 있는 것으로 본다. */
function hasBodyContent(html) {
  const value = String(html || '')
  if (/<(img|iframe|video)\b/i.test(value)) return true
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim().length > 0
}

function withNotes(base, notes) {
  return [base, ...notes].filter(Boolean).join(' ')
}

function createDraftSessionId() {
  if (globalThis.crypto?.randomUUID) {
    return `draft-${globalThis.crypto.randomUUID()}`
  }

  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return `draft-${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

function getDraftSessionId(storageKey) {
  try {
    const existing = sessionStorage.getItem(storageKey)
    if (existing) return existing
    const next = createDraftSessionId()
    sessionStorage.setItem(storageKey, next)
    return next
  } catch {
    return createDraftSessionId()
  }
}

function PostEditor() {
  const { msalInstance } = useAuth()
  const { refresh: refreshPosts } = useAdminPosts()
  const dbarSlot = useDbarSlot()
  const fieldId = useId()
  const { postId } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = !postId
  const storageKey = isNew ? 'post-draft-new' : `post-draft-${postId}`
  const draftAttachmentStorageKey = `${storageKey}:attachments`
  const [draftSessionId, setDraftSessionId] = useState(() => (
    isNew ? getDraftSessionId(draftAttachmentStorageKey) : ''
  ))
  const navigate = useNavigate()
  const location = useLocation()
  const flashMessage = location.state?.message
  const pendingDraftSessionId = location.state?.draftAttachmentLink?.draftSessionId || ''
  const pendingDraftAttachmentStorageKey = location.state?.draftAttachmentLink?.draftAttachmentStorageKey || ''
  const flashRetryKeyRef = useRef('')
  const [selectedApp, setSelectedApp] = useState(() => (isNew ? getInitialApp(searchParams) : ''))
  const [post, setPost] = useState(() => {
    const app = isNew ? getInitialApp(searchParams) : ''
    return { ...emptyPost, category: app ? getApiCategory(app) : '' }
  })
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [persistedStatus, setPersistedStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { uploading: isUploading, uploadHtmlImage } = usePostUpload({ msalInstance, postId })

  useEffect(() => {
    setDraftSessionId(isNew ? getDraftSessionId(draftAttachmentStorageKey) : '')
  }, [draftAttachmentStorageKey, isNew])

  useEffect(() => {
    if (!flashMessage && !pendingDraftSessionId) return

    let cancelled = false
    const retryKey = pendingDraftSessionId && postId
      ? `${postId}:${pendingDraftSessionId}`
      : ''

    if (retryKey && flashRetryKeyRef.current === retryKey) return
    if (retryKey) flashRetryKeyRef.current = retryKey

    const clearNavigationState = () => {
      navigate(location.pathname, { replace: true, state: null })
    }

    const applyFlashState = async () => {
      if (flashMessage) setMessage(flashMessage)

      if (!pendingDraftSessionId || !postId) {
        clearNavigationState()
        return
      }

      try {
        setDraftSessionId(pendingDraftSessionId)
        await linkDraftFilesToPost({ draftSessionId: pendingDraftSessionId, postId }, { msalInstance })
        try {
          if (pendingDraftAttachmentStorageKey) sessionStorage.removeItem(pendingDraftAttachmentStorageKey)
        } catch { /* storage blocked — non-fatal */ }
        if (!cancelled) {
          setDraftSessionId('')
          const baseMessage = (flashMessage || '저장되었습니다.')
            .replace(ATTACHMENT_LINK_WARNING, '')
            .replace(/\s+/g, ' ')
            .trim()
          setMessage(`${baseMessage || '저장되었습니다.'} 첨부파일 연결을 다시 완료했습니다.`)
          clearNavigationState()
        }
      } catch (retryError) {
        console.error('[PostEditor] draft attachment retry failed', retryError)
        if (!cancelled) {
          setError('첨부파일 연결 재시도에 실패했습니다. 잠시 후 저장된 게시글을 다시 열어 확인해 주세요.')
        }
      }
    }

    applyFlashState()
    return () => {
      cancelled = true
    }
  }, [
    flashMessage,
    location.pathname,
    msalInstance,
    navigate,
    pendingDraftAttachmentStorageKey,
    pendingDraftSessionId,
    postId,
  ])

  useEffect(() => {
    if (!isApiConfigured) {
      setLoading(false)
      return
    }

    if (isNew) return

    let isMounted = true

    const loadPost = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await getPost(postId, { msalInstance })
        if (isMounted) {
          // 제목·요약은 공개 사이트에 보이는 문구로 채운다. 저장하면 이 문구가 서버에 저장된다.
          setPost({ ...emptyPost, ...withDisplayText(data) })
          setPersistedStatus(data.status || '')
        }
      } catch (err) {
        // 불러오지 못한 글을 빈 양식으로 보여 주면 저장 시 기존 내용을 덮어쓸 수 있으므로 양식을 열지 않는다.
        if (isMounted) {
          setLoadError(err.message || '게시글을 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPost()

    return () => {
      isMounted = false
    }
  }, [postId, isNew, msalInstance, loadAttempt])

  const handleChange = (field) => (event) => {
    setPost((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // 제목은 한 줄 값이므로 줄바꿈은 공백으로 바꾼다.
  const handleTitleChange = (event) => {
    const title = event.target.value.replace(/\r?\n/g, ' ')
    setPost((prev) => ({ ...prev, title }))
  }

  const preventLineBreak = (event) => {
    if (event.key === 'Enter') event.preventDefault()
  }

  // 새 글의 앱을 바꾸면 서버 category를 맞춘다. 앱 태그는 저장할 때 붙인다 (예: Word → m365 + word 태그).
  const handleAppChange = (event) => {
    const app = event.target.value
    if (!isAppKey(app)) return
    setSelectedApp(app)
    setPost((prev) => ({ ...prev, category: getApiCategory(app) }))
  }

  // '보관'은 공개하지 않는 상태다. 기존 임시저장(draft) 글은 다시 보관으로 돌려도 draft를 유지한다.
  const handleStatusChange = (event) => {
    const hiddenStatus = persistedStatus && !isPublished(persistedStatus) ? persistedStatus : ARCHIVED
    const status = event.target.value === PUBLISHED ? PUBLISHED : hiddenStatus
    setPost((prev) => ({ ...prev, status }))
  }

  // 공개 사이트에서 이 글이 표시될 앱. 기존 글은 저장된 slug·시리즈·태그로 정해지며 편집으로 바뀌지 않는다.
  const displayApp = isNew
    ? selectedApp
    : (post.category ? getDisplayCategory({ category: post.category, slug: post.slug, series: post.series, tags: post.tags }) : '')
  const pageApp = isAppKey(displayApp) ? displayApp : ''
  const isUnmanagedPost = !isNew && !loading && !loadError && Boolean(post.category) && !BASE_CATEGORIES.includes(post.category)
  usePageApp(pageApp || null)

  // 공개 카드와 같은 순서: 공개 사이트가 미리 만든 썸네일 → 저장된 썸네일.
  const publicThumb = isNew ? null : getPublicThumbImage(pageApp, post.slug)
  const previewImage = publicThumb || (post.thumbnailUrl ? { src: post.thumbnailUrl, srcSet: '' } : null)

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 없어 로컬 상태로만 저장됩니다.')
      return
    }

    const title = post.title.trim()
    if (!post.category) {
      setError('앱을 선택해주세요.')
      return
    }

    if (!title) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!hasBodyContent(post.htmlBody)) {
      setError('본문을 입력해주세요.')
      return
    }

    if (isUploading) {
      setError('이미지 업로드가 완료된 뒤 저장해주세요.')
      return
    }

    if (isAttachmentUploading) {
      setError('첨부파일 업로드가 완료된 뒤 저장해주세요.')
      return
    }

    setSaving(true)
    const notes = []

    try {
      if (isNew) {
        const created = await createPost({
          title,
          category: post.category,
          excerpt: post.excerpt,
          htmlBody: post.htmlBody,
          status: post.status,
          tags: applyAppTag([], selectedApp),
        }, { msalInstance })
        const newId = created?.id || created?.postId
        let draftAttachmentLinkState = null
        if (newId && draftSessionId) {
          try {
            await linkDraftFilesToPost({ draftSessionId, postId: newId }, { msalInstance })
            try { sessionStorage.removeItem(draftAttachmentStorageKey) } catch { /* storage blocked — non-fatal */ }
          } catch (linkError) {
            console.error('[PostEditor] draft attachment link failed', linkError)
            notes.push(ATTACHMENT_LINK_WARNING)
            draftAttachmentLinkState = {
              draftSessionId,
              draftAttachmentStorageKey,
            }
          }
        }
        const successMessage = withNotes('저장되었습니다.', notes)
        refreshPosts()
        if (newId) {
          try { localStorage.removeItem(storageKey) } catch { /* storage blocked — non-fatal */ }
          navigate(`/posts/${newId}`, {
            state: {
              message: successMessage,
              ...(draftAttachmentLinkState ? { draftAttachmentLink: draftAttachmentLinkState } : {}),
            },
          })
        } else {
          setMessage(successMessage)
        }
      } else {
        const updated = await updatePost(postId, {
          title,
          excerpt: post.excerpt,
          htmlBody: post.htmlBody,
          status: post.status,
        }, { msalInstance })
        try { localStorage.removeItem(storageKey) } catch { /* storage blocked — non-fatal */ }
        // 저장 중에 고친 입력은 덮어쓰지 않고, 서버가 정한 시각·상태·썸네일만 반영한다.
        setPost((prev) => ({
          ...prev,
          title: prev.title === post.title ? title : prev.title,
          updatedAt: updated?.updatedAt ?? prev.updatedAt,
          publishedAt: updated?.publishedAt ?? null,
          ...(updated?.thumbnail ? { thumbnail: updated.thumbnail, thumbnailUrl: updated.thumbnailUrl } : {}),
        }))
        setPersistedStatus(updated?.status || post.status)
        setMessage(withNotes('업데이트되었습니다.', notes))
        refreshPosts()
      }
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    // API 미구성 환경에서는 삭제 요청 자체를 차단한다.
    if (!isApiConfigured) {
      setError('API가 연결되어 있지 않아 삭제할 수 없습니다.')
      setShowDeleteModal(false)
      return
    }
    setDeleting(true)
    setError('')
    try {
      await deletePost(postId, { msalInstance })
      refreshPosts()
      navigate(`/apps/${pageApp || ALL_APPS_KEY}`)
    } catch (err) {
      setError(err.message || '삭제에 실패했습니다.')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  const listPath = `/apps/${pageApp || ALL_APPS_KEY}`
  const backLink = (
    <Link to={listPath} className="ea-btn ea-btn--ghost ea-btn--sm" aria-label="목록으로">
      <ArrowLeft size={16} aria-hidden="true" />
      <span className="max-sm:hidden">목록으로</span>
    </Link>
  )

  if (loading || loadError || isUnmanagedPost) {
    let state
    if (loading) {
      state = (
        <div className="ea-empty" role="status">
          <span className="ea-spinner" aria-hidden="true" />
          <span>게시글을 불러오는 중...</span>
        </div>
      )
    } else if (loadError) {
      state = (
        <div className="ea-empty" role="alert">
          <strong>게시글을 불러오지 못했습니다.</strong>
          <span>{loadError}</span>
          <div className="ea-empty__actions">
            <button type="button" className="ea-btn ea-btn--primary ea-btn--sm" onClick={() => setLoadAttempt((value) => value + 1)}>
              다시 시도
            </button>
          </div>
        </div>
      )
    } else {
      state = (
        <div className="ea-empty" role="status">
          <span className="ea-drop" aria-hidden="true" />
          <strong>관리자에서 다루지 않는 게시글입니다.</strong>
          <span>‘{post.category}’ 카테고리 게시글은 앱 게시글 관리에서 제외되었습니다. 공개 사이트와 서버 데이터는 그대로 유지됩니다.</span>
          <div className="ea-empty__actions">
            <Link to={`/apps/${ALL_APPS_KEY}`} className="ea-btn ea-btn--primary ea-btn--sm">전체 게시글로 이동</Link>
          </div>
        </div>
      )
    }
    return (
      <>
        {dbarSlot && createPortal(<div className="ea-dbar__actions flex items-center gap-2">{backLink}</div>, dbarSlot)}
        <div className="ea-container ea-section">{state}</div>
      </>
    )
  }

  const saveDisabled = saving || isUploading || isAttachmentUploading
  const saveLabel = saving ? '저장 중...' : isUploading ? '이미지 업로드 중...' : isAttachmentUploading ? '첨부 업로드 중...' : '저장'
  const appMeta = pageApp ? getAppMeta(pageApp) : null

  return (
    <>
      {dbarSlot && createPortal(
        <div className="ea-dbar__actions flex items-center gap-2">
          {backLink}
          {!isNew && isApiConfigured && (
            <button
              type="button"
              className="ea-btn ea-btn--danger ea-btn--sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              aria-label="삭제"
            >
              <Trash2 size={15} aria-hidden="true" />
              <span className="max-sm:hidden">삭제</span>
            </button>
          )}
          <button type="button" className="ea-btn ea-btn--primary ea-btn--sm" onClick={handleSave} disabled={saveDisabled}>
            <Save size={15} aria-hidden="true" />
            {saveLabel}
          </button>
        </div>,
        dbarSlot,
      )}

      <AppHero
        compact
        wide
        app={pageApp || ALL_APPS_KEY}
        crumbs={[
          { label: '전체 게시글', to: `/apps/${ALL_APPS_KEY}` },
          ...(appMeta ? [{ label: appMeta.name, to: `/apps/${pageApp}` }] : []),
          { label: isNew ? '새 글' : '편집' },
        ]}
        eyebrow={appMeta ? appMeta.name : '앱을 선택하세요'}
        eyebrowIcon={appMeta?.icon || undefined}
        title={post.title.trim() || (isNew ? '새 게시글' : '(제목 없음)')}
        meta={[
          getStatusLabel(post.status),
          !isNew && post.updatedAt ? `마지막 수정 ${formatDate(post.updatedAt)}` : null,
          !isNew && post.publishedAt ? `게시 ${formatDate(post.publishedAt)}` : null,
        ]}
      />

      <div className="ea-container ea-container--wide">
        <div className="ea-editor__notices">
          {!isApiConfigured && <Notice tone="warning">API가 아직 연결되지 않아 목업 모드로 동작합니다.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          {message && <Notice tone="success">{message}</Notice>}
        </div>

        <div className="ea-editor">
          <section className="ea-panel ea-editor__info" aria-label="제목과 요약">
            <div className="ea-fields">
              <FormField label="제목" htmlFor={`${fieldId}-title`}>
                <textarea
                  id={`${fieldId}-title`}
                  className="ea-textarea ea-textarea--title"
                  rows={2}
                  value={post.title}
                  onChange={handleTitleChange}
                  onKeyDown={preventLineBreak}
                  placeholder="게시글 제목"
                />
              </FormField>

              <FormField label="요약" htmlFor={`${fieldId}-excerpt`} hint="목록 카드에 표시됩니다. 첫 구절이 짧으면 썸네일 문구로도 쓰입니다.">
                <textarea
                  id={`${fieldId}-excerpt`}
                  className="ea-textarea"
                  rows={3}
                  value={post.excerpt}
                  onChange={handleChange('excerpt')}
                  placeholder="목록 카드에 표시되는 한 줄 요약"
                />
              </FormField>
            </div>
          </section>

          <section className="ea-panel ea-editor__body" aria-label="본문">
            <h2 className="ea-panel__title">본문</h2>
            <HtmlEditor
              value={post.htmlBody}
              onChange={(value) =>
                setPost((prev) => ({
                  ...prev,
                  htmlBody: value,
                }))
              }
              onUploadImage={uploadHtmlImage}
              storageKey={storageKey}
            />
          </section>

          <div className="ea-editor__settings">
            <PostMetaSidebar
              isNew={isNew}
              selectedApp={selectedApp}
              displayApp={displayApp}
              onAppChange={handleAppChange}
              statusValue={isPublished(post.status) ? PUBLISHED : ARCHIVED}
              onStatusChange={handleStatusChange}
              thumbnail={previewImage}
              onAttachmentUploadingChange={setIsAttachmentUploading}
              postId={postId}
              draftSessionId={draftSessionId}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="게시글을 삭제하시겠습니까?"
        description={`"${post.title || '(제목 없음)'}" 게시글이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </>
  )
}

export default PostEditor
