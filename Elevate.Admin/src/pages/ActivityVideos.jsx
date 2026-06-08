import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Edit, PlayCircle } from 'lucide-react'
import { Card, StatusPill } from '../components/ui/index.js'
import { isApiConfigured } from '../lib/apiClient.js'
import { listActivityVideos } from '../services/activityVideosApi.js'
import { useAuth } from '../hooks/useAuth.js'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'published', label: '게시됨' },
  { value: 'archived', label: '보관됨' },
]

function ActivityVideoCard({ video, index }) {
  const [ref, isVisible] = useScrollAnimation(0.1)
  const colorScheme =
    video.status === 'published' ? 'green' :
    video.status === 'archived' ? 'slate' : 'blue'

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 0.05}s` }}
    >
      <Link to={`/activity-videos/${video.id}`}>
        <Card colorScheme={colorScheme} className="h-full">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-md bg-neutral-100 aspect-video">
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                alt={video.title || '활동 영상 썸네일'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 hover:text-ms-blue transition-colors">
                  {video.title}
                </h3>
                <StatusPill status={video.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-600">
                <div>
                  <span className="block text-xs font-semibold uppercase text-neutral-400">Category</span>
                  {video.category || '-'}
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-neutral-400">Year</span>
                  {video.year || '-'}
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-neutral-400">Channel</span>
                  {video.channel || '-'}
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase text-neutral-400">Sort</span>
                  {video.sortOrder ?? 0}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-neutral-100">
                <Edit className="w-4 h-4 text-ms-blue" />
                <span className="text-sm font-semibold text-ms-blue">편집하기</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

function ActivityVideos() {
  const { msalInstance } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isApiConfigured) return
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listActivityVideos({
          msalInstance,
          status: statusFilter,
        })
        if (isMounted) setVideos(Array.isArray(data?.items) ? data.items : [])
      } catch {
        if (isMounted) setError('활동 영상을 불러오지 못했습니다.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [msalInstance, statusFilter])

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gradient">활동 영상</h2>
          <p className="text-sm text-neutral-500 mt-1">Microsoft Elevate 활동 영상을 관리합니다.</p>
        </div>
        <button
          onClick={() => navigate('/activity-videos/new')}
          className="rounded-md bg-ms-blue px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#005a9e] shadow-elevation-2 hover:shadow-elevation-4"
        >
          새 활동 영상
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-neutral-800">상태</span>
        {statusOptions.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
              statusFilter === option.value
                ? 'border-ms-blue bg-ms-blue text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-black/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="clean-card p-6 space-y-5 border-l-4 border-neutral-200">
                <div className="aspect-video bg-neutral-200 rounded-md" />
                <div className="h-6 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-full" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card colorScheme="slate" className="text-center py-12">
          <div className="space-y-2">
            <PlayCircle className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="text-lg font-semibold text-neutral-900">등록된 활동 영상이 없습니다.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => <ActivityVideoCard key={video.id} video={video} index={index} />)}
        </div>
      )}
    </div>
  )
}

export default ActivityVideos
