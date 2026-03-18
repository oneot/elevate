import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import HtmlEditor from '../components/HtmlEditor.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import {
  createPost,
  getPost,
  registerAsset,
  requestUploadSas,
  updatePost,
} from '../lib/postsApi.js'
import { slugify } from '../lib/formatters.js'
import { useAuth } from '../hooks/useAuth.js'

const emptyPost = {
  title: '',
  slug: '',
  status: 'draft',
  category: '',
  tags: [],
  excerpt: '',
  thumbnailUrl: '',
  htmlBody: '',
}

const mockPosts = {
  'mock-1': {
    title: 'Azure 기반 블로그 아키텍처',
    slug: 'azure-architecture-handoff',
    status: 'draft',
    category: 'Architecture',
    tags: ['Azure', 'CosmosDB'],
    excerpt: '서버리스 기반 운영 아키텍처 요약',
    thumbnailUrl: '',
    htmlBody: '<h2>서버리스 기반 운영 아키텍처</h2><p>요약 콘텐츠입니다.</p>',
  },
  'mock-2': {
    title: 'Copilot Studio 연계 방향',
    slug: 'copilot-studio-knowledge',
    status: 'published',
    category: 'Copilot',
    tags: ['Copilot', 'AI Search'],
    excerpt: '지식 소스 연계를 위한 방향 정리',
    thumbnailUrl: '',
    htmlBody: '<h2>Copilot Studio 연계</h2><p>연계 방향 초안입니다.</p>',
  },
  'mock-3': {
    title: 'Admin 운영 가이드 초안',
    slug: 'admin-operations-guide',
    status: 'archived',
    category: 'Operations',
    tags: ['Admin', 'Guide'],
    excerpt: '운영자가 확인해야 할 항목 정리',
    thumbnailUrl: '',
    htmlBody: '<h2>운영 가이드</h2><p>운영 체크리스트입니다.</p>',
  },
}

function PostEditor() {
  const { msalInstance } = useAuth()
  const { postId } = useParams()
  const isNew = !postId
  const navigate = useNavigate()
  const [post, setPost] = useState(emptyPost)
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isApiConfigured) {
      if (!isNew) {
        const data = mockPosts[postId]
        if (data) {
          setPost({ ...emptyPost, ...data })
          setTagsInput((data.tags || []).join(', '))
        }
      }
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

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 없어 로컬 상태로만 저장됩니다.')
      return
    }

    const payload = {
      ...post,
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

  const uploadThumbnail = async (selectedFile) => {
    if (!selectedFile) return;

    if (!isApiConfigured) {
      const previewUrl = URL.createObjectURL(selectedFile)
      setPost((prev) => ({ ...prev, thumbnailUrl: previewUrl }))
      setMessage('API 없이 썸네일 미리보기 이미지를 적용했습니다.')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
      const sas = await requestUploadSas({
        fileName: selectedFile.name,
        contentType: selectedFile.type,
      }, { msalInstance })

      await fetch(sas.uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      })

      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType: selectedFile.type,
        sizeBytes: selectedFile.size,
        fileName: selectedFile.name,
      }, { msalInstance })

      setPost((prev) => ({
        ...prev,
        thumbnailUrl: asset?.url || asset?.cdnUrl || asset?.blobUrl || sas.blobUrl,
      }))
      setMessage('썸네일 이미지가 업로드되었습니다.')
    } catch (err) {
      setError(err.message || '썸네일 이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const uploadHtmlImage = async (selectedFile) => {
    if (!isApiConfigured) {
      return URL.createObjectURL(selectedFile)
    }

    const sas = await requestUploadSas({
      fileName: selectedFile.name,
      contentType: selectedFile.type,
    }, { msalInstance })

    await fetch(sas.uploadUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': selectedFile.type,
      },
      body: selectedFile,
    })

    const asset = await registerAsset({
      postId: postId || null,
      blobUrl: sas.blobUrl,
      contentType: selectedFile.type,
      sizeBytes: selectedFile.size,
      fileName: selectedFile.name,
    }, { msalInstance })

    return asset?.url || asset?.cdnUrl || asset?.blobUrl || sas.blobUrl
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
          <Button variant="secondary" onClick={() => navigate('/posts')}>
            목록으로
          </Button>
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
              <input
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
                value={post.category}
                onChange={handleChange('category')}
                placeholder="예: Architecture"
              />
            </FormField>
            <FormField label="태그" hint="쉼표로 구분합니다.">
              <input
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="Azure, CosmosDB"
              />
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
              {uploading && <p className="text-xs text-ms-blue mt-1">썸네일 업로드 중...</p>}
            </FormField>
          </Card>

        </aside>
      </div>
    </div>
  )
}

export default PostEditor
