import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card, Button, ConfirmModal, FormField } from '../components/ui/index.js'
import { HtmlEditor, AttachUploader } from '../components/editor/index.js'
import { isApiConfigured } from '../lib/apiClient.js'
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from '../services/postsApi.js'
import { slugify, extractYoutubeId } from '../utils/formatters.js'
import { CATEGORIES } from '../constants/categories.js'
import { useAuth } from '../hooks/useAuth.js'
import { usePostUpload } from '../hooks/usePostUpload.js'

/** 신규 게시글 작성 시 초기 상태 기본값. */
const emptyPost = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  tags: [],
  excerpt: '',
  thumbnailUrl: '',
  htmlBody: '',
  youtube: '',
}

function PostEditor() {
  const { msalInstance } = useAuth()
  const { postId } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = !postId
  const navigate = useNavigate()
  const [post, setPost] = useState(() => ({
    ...emptyPost,
    category: isNew ? (searchParams.get('category') || '') : '',
  }))
  const [tagsInput, setTagsInput] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [youtubeError, setYoutubeError] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
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
    if (!isApiConfigured) {
      setLoading(false)
      return
    }

    if (isNew) return

    let isMounted = true

    const loadPost = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getPost(postId, { msalInstance })
        if (isMounted) {
          setPost({ ...emptyPost, ...data })
          setTagsInput((data.tags || []).join(', '))
          setYoutubeInput(data.youtube || '')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || '포스트를 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPost()

    return () => {
      isMounted = false
    }
  }, [postId, isNew, msalInstance])


  const handleChange = (field) => (event) => {
    setPost((prev) => ({ ...prev, [field]: event.target.value }))
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

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 없어 로컬 상태로만 저장됩니다.')
      return
    }

    if (!post.category) {
      setError('카테고리를 선택해주세요.')
      return
    }

    const payload = {
      ...post,
      // slug 가 비어 있으면 제목에서 자동 생성한다. 서버도 생성할 수 있지만
      // 클라이언트에서 미리 생성하면 저장 후 즉시 URL을 알 수 있다.
      slug: post.slug || slugify(post.title),
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    setSaving(true)
    try {
      if (isNew) {
        const created = await createPost(payload, { msalInstance })
        const newId = created?.id || created?.postId
        setMessage('저장되었습니다.')
        if (newId) {
          navigate(`/posts/${newId}`)
        }
      } else {
        await updatePost(postId, payload, { msalInstance })
        setMessage('업데이트되었습니다.')
      }
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await deletePost(postId, { msalInstance })
      navigate(post.category ? `/category/${post.category}` : '/')
    } catch (err) {
      setError(err.message || '삭제에 실패했습니다.')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <Card className="py-12 text-center">
          <div className="space-y-2">
            <div className="inline-block w-8 h-8 border-4 border-neutral-200 border-t-ms-blue rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-500 mt-2">불러오는 중...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {!isApiConfigured ? (
        <div className="rounded-lg border border-amber-200/50 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-sm text-amber-700">
          API가 아직 연결되지 않아 목업 모드로 동작합니다.
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gradient">
            {isNew ? '새 포스트 작성' : '포스트 편집'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            HTML 본문과 메타데이터를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(post.category ? `/category/${post.category}` : '/')}>
            목록으로
          </Button>
          {!isNew && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
              삭제
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700 animate-slideUp">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg border border-ms-green/20 bg-ms-green/10 backdrop-blur-sm px-4 py-3 text-sm text-ms-green animate-slideUp">
          {message}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card colorScheme="blue" className="space-y-8">
          <FormField label="제목">
            <input
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={post.title}
              onChange={handleChange('title')}
              placeholder="포스트 제목"
            />
          </FormField>

          <FormField label="Slug" hint="비워두면 제목에서 자동 생성됩니다.">
            <input
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-mono transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={post.slug}
              onChange={handleChange('slug')}
              placeholder="my-post-slug"
            />
          </FormField>

          <FormField label="요약">
            <textarea
              className="min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue resize-none"
              value={post.excerpt}
              onChange={handleChange('excerpt')}
              placeholder="한 줄 요약"
            />
          </FormField>

          <FormField label="HTML 본문">
            <HtmlEditor
              value={post.htmlBody}
              onChange={(value) =>
                setPost((prev) => ({
                  ...prev,
                  htmlBody: value,
                }))
              }
              onUploadImage={uploadHtmlImage}
            />
          </FormField>
        </Card>

        <aside className="space-y-8">
          <Card colorScheme="slate" className="space-y-6">
            <h3 className="text-sm font-semibold text-neutral-800">메타데이터</h3>
            <FormField label="상태">
              <select
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
                value={post.status}
                onChange={handleChange('status')}
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
                onChange={handleChange('category')}
                disabled={!isNew}
              >
                {/* 신규 게시글에서만 카테고리를 선택할 수 있다. 기존 게시글은 카테고리 변경이 불가하다. */}
                {isNew && (
                  <option value="" disabled>카테고리 선택</option>
                )}
                {CATEGORIES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="태그" hint="쉼표로 구분합니다.">
              <input
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="Azure, CosmosDB"
              />
            </FormField>
            <FormField label="YouTube">
              <input
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
                value={youtubeInput}
                onChange={handleYoutubeChange}
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
                    const fileObj = event.target.files?.[0];
                    if (fileObj) {
                      await uploadThumbnail(fileObj);
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
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="게시글을 삭제하시겠습니까?"
        description={`"${post.title || '(제목 없음'}" 게시글이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </div>
  )
}

export default PostEditor
