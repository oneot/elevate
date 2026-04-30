import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Edit, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../components/Card.jsx'
import StatusPill from '../components/StatusPill.jsx'
import NotFound from './NotFound.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import { listPosts } from '../lib/postsApi.js'
import { formatDate } from '../lib/formatters.js'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'
import { useAuth } from '../hooks/useAuth.js'

const PAGE_SIZE = 20

const CATEGORY_LABELS = {
  m365: 'M365',
  copilot: 'Copilot',
  teams: 'Teams',
  minecraft: 'Minecraft',
  excel: 'Excel',
  onenote: 'OneNote',
  agenthon: 'Agenthon',
  update: 'Update',
}

function AdminPagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> 이전
      </button>
      <span className="text-sm text-neutral-600 px-2">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        다음 <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function PostCard({ post, index }) {
  const [ref, isVisible] = useScrollAnimation(0.1)

  const colorScheme =
    post.status === 'published' ? 'green' :
    post.status === 'archived' ? 'slate' : 'blue'

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 0.05}s` }}
    >
      <Link to={`/posts/${post.id}`}>
        <Card colorScheme={colorScheme} className="h-full">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 hover:text-ms-blue transition-colors">
                {post.title}
              </h3>
              <StatusPill status={post.status} />
            </div>
            <p className="text-sm text-neutral-500 font-mono">{post.slug}</p>
            <div className="flex items-center gap-4 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-neutral-100">
              <Edit className="w-4 h-4 text-ms-blue" />
              <span className="text-sm font-semibold text-ms-blue">편집하기</span>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

function CategoryPosts() {
  const { categoryId } = useParams()
  const { msalInstance } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const label = CATEGORY_LABELS[categoryId]

  useEffect(() => {
    setStatusFilter('all')
    setPage(1)
  }, [categoryId])

  useEffect(() => {
    if (!isApiConfigured) return

    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listPosts({
          msalInstance,
          page,
          limit: PAGE_SIZE,
          category: categoryId,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        if (isMounted) {
          setPosts(Array.isArray(data?.items) ? data.items : [])
          setTotalPages(data?.totalPages || 1)
          setTotalCount(data?.totalCount || 0)
        }
      } catch (err) {
        if (isMounted) setError(err.message || '목록을 불러오지 못했습니다.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [msalInstance, page, statusFilter, categoryId])

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  if (!label) return <NotFound />

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gradient">{label}</h2>
          <p className="text-sm text-neutral-500 mt-1">{label} 관련 게시글을 관리합니다.</p>
        </div>
        <button
          onClick={() => navigate(`/posts/new?category=${categoryId}`)}
          className="rounded-md bg-ms-blue px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#005a9e] shadow-elevation-2 hover:shadow-elevation-4"
        >
          새 게시글
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-neutral-800">상태</label>
        <select
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>

        {!loading && totalCount > 0 && (
          <span className="text-sm text-neutral-500">
            총 {totalCount}개 · {page}/{totalPages} 페이지
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="clean-card p-6 space-y-6 border-l-4 border-neutral-200">
                <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-100 rounded w-full"></div>
                <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card colorScheme="slate" className="text-center py-12">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-neutral-900">{label} 게시글이 없습니다.</p>
            <p className="text-sm text-neutral-500">새 게시글을 작성해보세요.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default CategoryPosts
