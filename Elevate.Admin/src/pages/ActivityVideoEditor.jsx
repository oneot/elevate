import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, ConfirmModal, FormField } from '../components/ui/index.js'
import { isApiConfigured } from '../lib/apiClient.js'
import {
  createActivityVideo,
  deleteActivityVideo,
  getActivityVideo,
  updateActivityVideo,
} from '../services/activityVideosApi.js'
import { useAuth } from '../hooks/useAuth.js'
import { extractYoutubeId } from '../utils/formatters.js'

const emptyVideo = {
  youtubeInput: '',
  title: '',
  description: '',
  category: '',
  year: String(new Date().getFullYear()),
  channel: 'Microsoft Korea',
  sortOrder: 0,
  status: 'draft',
}

function ActivityVideoEditor() {
  const { msalInstance } = useAuth()
  const { activityVideoId } = useParams()
  const isNew = !activityVideoId
  const navigate = useNavigate()

  const [video, setVideo] = useState(emptyVideo)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isApiConfigured || isNew) return
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getActivityVideo(activityVideoId, { msalInstance })
        if (isMounted) {
          setVideo({
            youtubeInput: data.videoId || '',
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            year: data.year || '',
            channel: data.channel || 'Microsoft Korea',
            sortOrder: data.sortOrder ?? 0,
            status: data.status || 'draft',
          })
        }
      } catch (err) {
        if (isMounted) setError(err.message || '활동 영상을 불러오지 못했습니다.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [activityVideoId, isNew, msalInstance])

  const handleChange = (field) => (e) => setVideo(prev => ({ ...prev, [field]: e.target.value }))

  const getVideoId = () => {
    const trimmed = video.youtubeInput.trim()
    return extractYoutubeId(video.youtubeInput) || (
      /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : null
    )
  }

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 연결되어 있지 않습니다.')
      return
    }

    const videoId = getVideoId()
    if (!videoId) {
      setError('유효한 YouTube URL 또는 11자리 영상 ID를 입력해주세요.')
      return
    }

    if (!video.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!video.category.trim()) {
      setError('카테고리를 입력해주세요.')
      return
    }

    if (!video.year.trim()) {
      setError('연도를 입력해주세요.')
      return
    }

    const payload = {
      videoId,
      title: video.title.trim(),
      description: video.description || null,
      category: video.category.trim(),
      year: video.year.trim(),
      channel: video.channel || 'Microsoft Korea',
      sortOrder: Number(video.sortOrder) || 0,
      status: video.status,
    }

    setSaving(true)
    try {
      if (isNew) {
        const created = await createActivityVideo(payload, { msalInstance })
        setMessage('저장되었습니다.')
        if (created?.id) navigate(`/activity-videos/${created.id}`)
      } else {
        await updateActivityVideo(activityVideoId, payload, { msalInstance })
        setMessage('업데이트되었습니다.')
      }
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isApiConfigured) {
      setError('API가 연결되어 있지 않습니다.')
      setShowDeleteModal(false)
      return
    }
    setDeleting(true)
    setError('')
    try {
      await deleteActivityVideo(activityVideoId, { msalInstance })
      navigate('/activity-videos')
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
          <div className="inline-block w-8 h-8 border-4 border-neutral-200 border-t-ms-blue rounded-full animate-spin" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gradient">
            {isNew ? '새 활동 영상' : '활동 영상 편집'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">활동 영상 메타데이터와 게시 상태를 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/activity-videos')}>목록으로</Button>
          {!isNew && isApiConfigured && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>삭제</Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-ms-green/20 bg-ms-green/10 backdrop-blur-sm px-4 py-3 text-sm text-ms-green">
          {message}
        </div>
      )}

      <Card colorScheme="blue" className="space-y-6">
        <FormField label="YouTube URL 또는 ID">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={video.youtubeInput}
            onChange={handleChange('youtubeInput')}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </FormField>

        <FormField label="제목">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={video.title}
            onChange={handleChange('title')}
            placeholder="활동 영상 제목"
          />
        </FormField>

        <FormField label="설명">
          <textarea
            className="min-h-32 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={video.description}
            onChange={handleChange('description')}
            placeholder="영상 설명"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="카테고리">
            <input
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={video.category}
              onChange={handleChange('category')}
              placeholder="예: 워크숍"
            />
          </FormField>

          <FormField label="연도">
            <input
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={video.year}
              onChange={handleChange('year')}
              placeholder="2026"
            />
          </FormField>

          <FormField label="채널">
            <input
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={video.channel}
              onChange={handleChange('channel')}
              placeholder="Microsoft Korea"
            />
          </FormField>

          <FormField label="정렬 순서">
            <input
              type="number"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
              value={video.sortOrder}
              onChange={handleChange('sortOrder')}
            />
          </FormField>
        </div>

        <FormField label="상태">
          <select
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={video.status}
            onChange={handleChange('status')}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </FormField>
      </Card>

      <ConfirmModal
        open={showDeleteModal}
        title="활동 영상을 삭제하시겠습니까?"
        description={`"${video.title || '(제목 없음)'}" 활동 영상이 영구적으로 삭제됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </div>
  )
}

export default ActivityVideoEditor
