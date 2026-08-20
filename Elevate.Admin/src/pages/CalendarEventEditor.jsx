import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, ConfirmModal, FormField } from '../components/ui/index.js'
import EventDatesEditor from '../components/editor/EventDatesEditor.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
  updateCalendarEvent,
} from '../services/calendarEventsApi.js'
import { listPosts } from '../services/postsApi.js'
import { useAuth } from '../hooks/useAuth.js'

const emptyEvent = {
  title: '',
  eventDates: null,
  eventLocation: '',
  eventTarget: '',
  linkedPostId: '',
}

function CalendarEventEditor() {
  const { msalInstance } = useAuth()
  const { eventId } = useParams()
  const isNew = !eventId
  const navigate = useNavigate()

  const [event, setEvent] = useState(emptyEvent)
  const [eventPosts, setEventPosts] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // event 카테고리 게시글 목록 로드 (linkedPostId picker용)
  useEffect(() => {
    if (!isApiConfigured) return
    let isMounted = true
    listPosts({ msalInstance, category: 'event', limit: 100 })
      .then(data => { if (isMounted) setEventPosts(Array.isArray(data?.items) ? data.items : []) })
      .catch(() => {})
    return () => { isMounted = false }
  }, [msalInstance])

  // 기존 이벤트 로드
  useEffect(() => {
    if (!isApiConfigured || isNew) return
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getCalendarEvent(eventId, { msalInstance })
        if (isMounted) {
          setEvent({
            title: data.title || '',
            eventDates: data.eventDates || null,
            eventLocation: data.eventLocation || '',
            eventTarget: data.eventTarget || '',
            linkedPostId: data.linkedPostId || '',
          })
        }
      } catch (err) {
        if (isMounted) setError(err.message || '이벤트를 불러오지 못했습니다.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [eventId, isNew, msalInstance])

  const handleChange = (field) => (e) => setEvent(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    setError('')
    setMessage('')

    if (!isApiConfigured) {
      setMessage('API가 연결되어 있지 않습니다.')
      return
    }

    if (!event.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!Array.isArray(event.eventDates) || event.eventDates.length === 0) {
      setError('행사 일정을 입력해주세요.')
      return
    }

    const payload = {
      title: event.title.trim(),
      eventDates: event.eventDates,
      eventLocation: event.eventLocation || null,
      eventTarget: event.eventTarget || null,
      linkedPostId: event.linkedPostId || null,
    }

    setSaving(true)
    try {
      if (isNew) {
        const created = await createCalendarEvent(payload, { msalInstance })
        setMessage('저장되었습니다.')
        if (created?.id) navigate(`/calendar-events/${created.id}`)
      } else {
        await updateCalendarEvent(eventId, payload, { msalInstance })
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
      await deleteCalendarEvent(eventId, { msalInstance })
      navigate('/category/event')
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
            {isNew ? '새 달력 이벤트' : '달력 이벤트 편집'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">행사 일정을 달력에 등록합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/category/event')}>목록으로</Button>
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
        <FormField label="제목">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={event.title}
            onChange={handleChange('title')}
            placeholder="이벤트 제목"
          />
        </FormField>

        <FormField label="행사 일정">
          <EventDatesEditor
            value={event.eventDates}
            onChange={(value) => setEvent(prev => ({ ...prev, eventDates: value }))}
          />
        </FormField>

        <FormField label="행사 장소">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={event.eventLocation}
            onChange={handleChange('eventLocation')}
            placeholder="예: 서울 코엑스 A홀"
          />
        </FormField>

        <FormField label="행사 대상">
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={event.eventTarget}
            onChange={handleChange('eventTarget')}
            placeholder="예: 전체, 개발자, 학생"
          />
        </FormField>

        <FormField label="연결된 게시글" hint="이 이벤트를 클릭했을 때 이동할 event 카테고리 게시글입니다.">
          <select
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
            value={event.linkedPostId}
            onChange={handleChange('linkedPostId')}
          >
            <option value="">연결 없음</option>
            {eventPosts.map(post => (
              <option key={post.id} value={post.id}>{post.title}</option>
            ))}
          </select>
        </FormField>
      </Card>

      <ConfirmModal
        open={showDeleteModal}
        title="달력 이벤트를 삭제하시겠습니까?"
        description={`"${event.title || '(제목 없음)'}" 이벤트가 영구적으로 삭제됩니다. 연결된 게시글은 삭제되지 않습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </div>
  )
}

export default CalendarEventEditor
