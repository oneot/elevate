import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react'
import { ConfirmModal, FormField, Notice } from '../components/ui/index.js'
import { HtmlEditor, PostMetaSidebar } from '../components/editor/index.js'
import AppHero from '../components/apps/AppHero.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import {
  createPost,
  deletePost,
  getPost,
  listSeriesByCategory,
  updatePost,
} from '../services/postsApi.js'
import { linkDraftFilesToPost } from '../services/assetsApi.js'
import { slugify, extractYoutubeId, formatDate } from '../utils/formatters.js'
import {
  ALL_APPS_KEY,
  APP_LABELS,
  BASE_CATEGORIES,
  applyAppTag,
  getApiCategory,
  getDisplayCategory,
  isAppKey,
} from '../constants/apps.js'
import { getAppMeta } from '../constants/appMeta.js'
import { STATUS_LABELS } from '../constants/status.js'
import { PUBLIC_SITE_URL } from '../constants/site.js'
import { useAuth } from '../hooks/useAuth.js'
import { usePostUpload } from '../hooks/usePostUpload.js'
import { useAdminPosts } from '../hooks/adminPosts.js'
import { useDbarSlot, usePageApp } from '../hooks/shell.js'

/** 신규 게시글 작성 시 초기 상태 기본값. */
const emptyPost = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  tags: [],
  excerpt: '',
  series: '',
  seriesOrder: null,
  thumbnailUrl: '',
  htmlBody: '',
  youtube: '',
}

const ATTACHMENT_LINK_WARNING = '첨부파일 연결에 실패했습니다. 저장된 게시글에서 다시 확인해 주세요.'

function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

/** 새 글 주소의 앱 (?app=, 이전 주소 호환용 ?category=). */
function getInitialApp(searchParams) {
  const app = searchParams.get('app') || searchParams.get('category')
  return isAppKey(app) ? app : ''
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
  // 새 글은 고른 앱의 태그(예: Word → word)를 미리 넣어 공개 사이트의 같은 앱에 표시되게 한다.
  const [tagsInput, setTagsInput] = useState(() => (
    isNew ? applyAppTag([], getInitialApp(searchParams)).join(', ') : ''
  ))
  const [youtubeInput, setYoutubeInput] = useState('')
  const [youtubeError, setYoutubeError] = useState('')
  const [seriesOptions, setSeriesOptions] = useState([])
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false)
  const [newSeriesName, setNewSeriesName] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [persisted, setPersisted] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { uploading: isUploading, uploadThumbnail, uploadHtmlImage } = usePostUpload({
    msalInstance,
    postId,
    setPost,
    setError,
    setMessage,
  })

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
          setPost({ ...emptyPost, ...data })
          setTagsInput((data.tags || []).join(', '))
          setYoutubeInput(data.youtube || '')
          setPersisted({ status: data.status, slug: data.slug })
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

  useEffect(() => {
    if (!isApiConfigured || !post.category) {
      setSeriesOptions([])
      return
    }

    let isMounted = true

    listSeriesByCategory(post.category, { msalInstance })
      .then((data) => {
        if (!isMounted) return
        const names = Array.from(new Set(
          (data?.items || [])
            .map((item) => (typeof item?.name === 'string' ? item.name.trim() : ''))
            .filter(Boolean)
        )).sort((a, b) => a.localeCompare(b, 'ko'))
        setSeriesOptions(names)
      })
      .catch(() => {
        if (isMounted) setSeriesOptions([])
      })

    return () => {
      isMounted = false
    }
  }, [post.category, msalInstance])

  useEffect(() => {
    const currentSeries = (post.series || '').trim()
    if (!currentSeries) {
      setIsCreatingNewSeries(false)
      setNewSeriesName('')
      return
    }

    const existsInOptions = seriesOptions.includes(currentSeries)
    if (existsInOptions) {
      setIsCreatingNewSeries(false)
      setNewSeriesName('')
      return
    }

    setIsCreatingNewSeries(true)
    setNewSeriesName(currentSeries)
  }, [post.series, seriesOptions])

  const handleChange = (field) => (event) => {
    setPost((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // 새 글의 앱을 바꾸면 서버 category와 앱 태그를 함께 맞춘다 (예: Word → m365 + word 태그).
  const handleAppChange = (event) => {
    const app = event.target.value
    if (!isAppKey(app)) return
    setSelectedApp(app)
    setPost((prev) => ({ ...prev, category: getApiCategory(app) }))
    setTagsInput((prev) => applyAppTag(parseTags(prev), app).join(', '))
  }

  const handleSeriesSelectChange = (event) => {
    const value = event.target.value
    setIsCreatingNewSeries(false)
    setNewSeriesName('')
    setPost((prev) => ({
      ...prev,
      series: value,
      ...(value.trim() ? {} : { seriesOrder: null }),
    }))
  }

  const handleStartNewSeries = () => {
    setIsCreatingNewSeries(true)
    setNewSeriesName(post.series || '')
  }

  const handleCancelNewSeries = () => {
    const fallbackSeries = seriesOptions.includes(post.series || '') ? (post.series || '') : ''
    setIsCreatingNewSeries(false)
    setNewSeriesName('')
    setPost((prev) => ({
      ...prev,
      series: fallbackSeries,
      ...(fallbackSeries ? {} : { seriesOrder: null }),
    }))
  }

  const handleNewSeriesNameChange = (event) => {
    const value = event.target.value
    setNewSeriesName(value)
    setPost((prev) => ({
      ...prev,
      series: value,
      ...(value.trim() ? {} : { seriesOrder: null }),
    }))
  }

  const handleSeriesOrderChange = (event) => {
    const rawValue = event.target.value.trim()
    setPost((prev) => ({
      ...prev,
      seriesOrder: rawValue ? Number.parseInt(rawValue, 10) : null,
    }))
  }

  const handleYoutubeChange = (event) => {
    const url = event.target.value
    setYoutubeInput(url)

    if (!url) {
      setYoutubeError('')
      // YouTube URL이 지워졌을 때 자동으로 설정된 썸네일(img.youtube.com)도 함께 초기화한다.
      // 사용자가 직접 업로드한 썸네일은 유지한다.
      const wasAutoThumb = post.thumbnailUrl?.includes('img.youtube.com')
      setPost((prev) => ({
        ...prev,
        youtube: '',
        ...(wasAutoThumb ? { thumbnailUrl: '', thumbnail: null } : {}),
      }))
      return
    }

    const id = extractYoutubeId(url)
    if (!id) {
      setYoutubeError('유효하지 않은 YouTube URL입니다.')
      setPost((prev) => ({ ...prev, youtube: '' }))
      return
    }

    setYoutubeError('')
    const autoThumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    // 썸네일이 비어 있을 때만 YouTube 썸네일을 자동 설정한다.
    // 이미 썸네일이 있으면 사용자가 의도적으로 선택한 것으로 간주해 변경하지 않는다.
    setPost((prev) => ({
      ...prev,
      youtube: id,
      ...(!prev.thumbnailUrl ? {
        thumbnailUrl: autoThumbUrl,
        thumbnail: { url: autoThumbUrl, alt: '', width: 480, height: 360, mimeType: 'image/jpeg', sizeBytes: 0 },
      } : {}),
    }))
  }

  const parsedTags = useMemo(() => parseTags(tagsInput), [tagsInput])
  // 공개 사이트에서 이 글이 표시될 앱 (slug → 시리즈 → 태그, Elevate.Web과 같은 규칙).
  const displayApp = post.category
    ? getDisplayCategory({
      category: post.category,
      slug: slugify(post.slug || ''),
      series: (post.series || '').trim(),
      tags: parsedTags,
    })
    : ''
  const pageApp = isNew ? selectedApp : (isAppKey(displayApp) ? displayApp : '')
  const isUnmanagedPost = !isNew && !loading && !loadError && Boolean(post.category) && !BASE_CATEGORIES.includes(post.category)
  usePageApp(pageApp || null)

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 없어 로컬 상태로만 저장됩니다.')
      return
    }

    if (!post.category) {
      setError('앱을 선택해주세요.')
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

    // slug 입력값을 항상 정규화한다 (한글·특수문자 제거).
    // 정규화 후에도 빈 문자열이면 제목에서 생성하고,
    // 여전히 비어 있으면 서버가 자동 생성하도록 비워 둔다.
    const normalizedSlug = slugify(post.slug || '')
    const payload = {
      ...post,
      slug: normalizedSlug || slugify(post.title),
      tags: parsedTags,
    }

    setSaving(true)
    try {
      if (isNew) {
        const created = await createPost(payload, { msalInstance })
        const newId = created?.id || created?.postId
        const warnings = []
        let draftAttachmentLinkState = null
        if (newId && draftSessionId) {
          try {
            await linkDraftFilesToPost({ draftSessionId, postId: newId }, { msalInstance })
            try { sessionStorage.removeItem(draftAttachmentStorageKey) } catch { /* storage blocked — non-fatal */ }
          } catch (linkError) {
            console.error('[PostEditor] draft attachment link failed', linkError)
            warnings.push(ATTACHMENT_LINK_WARNING)
            draftAttachmentLinkState = {
              draftSessionId,
              draftAttachmentStorageKey,
            }
          }
        }
        const successMessage = warnings.length > 0
          ? `저장되었습니다. ${warnings.join(' ')}`
          : '저장되었습니다.'
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
        const updated = await updatePost(postId, payload, { msalInstance })
        try { localStorage.removeItem(storageKey) } catch { /* storage blocked — non-fatal */ }
        // 저장 중에 고친 입력은 덮어쓰지 않고, 서버가 정한 시각만 반영한다.
        setPost((prev) => ({
          ...prev,
          updatedAt: updated?.updatedAt ?? prev.updatedAt,
          publishedAt: updated?.publishedAt ?? null,
        }))
        setPersisted({ status: updated?.status || payload.status, slug: updated?.slug || payload.slug })
        setMessage('업데이트되었습니다.')
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
  const publicUrl = !isNew && persisted?.status === 'published' && persisted.slug && isAppKey(displayApp)
    ? `${PUBLIC_SITE_URL}/${displayApp}/${encodeURIComponent(persisted.slug)}`
    : ''
  const appMismatch = isNew && selectedApp && isAppKey(displayApp) && displayApp !== selectedApp

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
          STATUS_LABELS[post.status] || STATUS_LABELS.draft,
          !isNew && post.updatedAt ? `마지막 수정 ${formatDate(post.updatedAt)}` : null,
          !isNew && post.publishedAt ? `게시 ${formatDate(post.publishedAt)}` : null,
        ]}
        actions={publicUrl ? (
          <a className="ea-btn ea-btn--glass ea-btn--sm" href={publicUrl} target="_blank" rel="noopener noreferrer">
            공개 사이트에서 보기
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
      />

      <div className="ea-container">
        <div className="ea-editor__notices">
          {!isApiConfigured && <Notice tone="warning">API가 아직 연결되지 않아 목업 모드로 동작합니다.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          {message && <Notice tone="success">{message}</Notice>}
          {appMismatch && (
            <Notice tone="warning">
              선택한 앱은 {APP_LABELS[selectedApp]}이지만 시리즈 또는 태그 때문에 공개 사이트에서는 {APP_LABELS[displayApp]}에 표시됩니다.
            </Notice>
          )}
        </div>

        <div className="ea-editor">
          <div className="ea-editor__main">
            <section className="ea-panel" aria-label="기본 정보">
              <div className="ea-fields">
                <FormField label="제목" htmlFor={`${fieldId}-title`}>
                  <input
                    id={`${fieldId}-title`}
                    className="ea-input ea-input--title"
                    value={post.title}
                    onChange={handleChange('title')}
                    placeholder="게시글 제목"
                  />
                </FormField>

                <FormField label="Slug" htmlFor={`${fieldId}-slug`} hint="비워두면 제목에서 자동 생성됩니다. 공개 사이트 주소의 마지막 부분입니다.">
                  <input
                    id={`${fieldId}-slug`}
                    className="ea-input ea-input--mono"
                    value={post.slug}
                    onChange={handleChange('slug')}
                    placeholder="my-post-slug"
                  />
                  {post.slug && slugify(post.slug) !== post.slug && (
                    <p className="text-xs text-[#8a4b00]">
                      저장 시 <span className="font-mono font-semibold">{slugify(post.slug) || '(자동 생성)'}</span>으로 변환됩니다.
                    </p>
                  )}
                </FormField>

                <FormField label="요약" htmlFor={`${fieldId}-excerpt`}>
                  <textarea
                    id={`${fieldId}-excerpt`}
                    className="ea-textarea"
                    value={post.excerpt}
                    onChange={handleChange('excerpt')}
                    placeholder="목록 카드에 표시되는 한 줄 요약"
                  />
                </FormField>
              </div>
            </section>

            <section className="ea-panel" aria-label="본문">
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
          </div>

          <aside className="ea-editor__side" aria-label="게시 설정">
            <PostMetaSidebar
              post={post}
              tagsInput={tagsInput}
              youtubeInput={youtubeInput}
              youtubeError={youtubeError}
              isUploading={isUploading}
              isNew={isNew}
              selectedApp={selectedApp}
              displayApp={displayApp}
              onAppChange={handleAppChange}
              onChange={handleChange}
              seriesOptions={seriesOptions}
              isCreatingNewSeries={isCreatingNewSeries}
              newSeriesName={newSeriesName}
              onSeriesSelectChange={handleSeriesSelectChange}
              onStartNewSeries={handleStartNewSeries}
              onCancelNewSeries={handleCancelNewSeries}
              onNewSeriesNameChange={handleNewSeriesNameChange}
              onSeriesOrderChange={handleSeriesOrderChange}
              onTagsChange={setTagsInput}
              onYoutubeChange={handleYoutubeChange}
              onThumbnailUpload={uploadThumbnail}
              onAttachmentUploadingChange={setIsAttachmentUploading}
              postId={postId}
              draftSessionId={draftSessionId}
            />
          </aside>
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
