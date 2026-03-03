import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Calendar, Folder } from 'lucide-react'
import Card from '../components/Card.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { isApiConfigured } from '../lib/apiClient.js'
import { listPosts } from '../lib/postsApi.js'
import { formatDate } from '../lib/formatters.js'
import { useScrollAnimation } from '../hooks/useScrollAnimation.js'

const mockPosts = [
  {
    id: 'mock-1',
    title: 'Azure 기반 블로그 아키텍처',
    slug: 'azure-architecture-handoff',
    status: 'draft',
    category: 'Architecture',
    updatedAt: '2026-02-27T01:05:00Z',
  },
  {
    id: 'mock-2',
    title: 'Copilot Studio 연계 방향',
    slug: 'copilot-studio-knowledge',
    status: 'published',
    category: 'Copilot',
    updatedAt: '2026-02-25T08:20:00Z',
  },
  {
    id: 'mock-3',
    title: 'Admin 운영 가이드 초안',
    slug: 'admin-operations-guide',
    status: 'archived',
    category: 'Operations',
    updatedAt: '2026-02-20T12:00:00Z',
  },
]

// 카드 컴포넌트
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
            {/* 헤더: 제목과 상태 */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 hover:text-ms-blue transition-colors">
                {post.title}
              </h3>
              <StatusPill status={post.status} />
            </div>

            {/* Slug */}
            <p className="text-sm text-neutral-500 font-mono">
              {post.slug}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-xs text-neutral-600">
              {post.category && (
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>{post.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.updatedAt)}</span>
              </div>
            </div>

            {/* 액션 버튼 */}
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

function PostsList() {
  const [posts, setPosts] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isApiConfigured) {
      setPosts(mockPosts)
      return
    }

    let isMounted = true

    const loadPosts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listPosts()
        if (isMounted) {
          setPosts(Array.isArray(data) ? data : data.items || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || '목록을 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredPosts = useMemo(() => {
    if (statusFilter === 'all') return posts
    return posts.filter((post) => post.status === statusFilter)
  }, [posts, statusFilter])

  return (
    <div className="space-y-10 animate-fadeIn">
      {!isApiConfigured ? (
        <div className="rounded-lg border border-amber-200/50 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-sm text-amber-700">
          API가 아직 연결되지 않아 목업 데이터를 표시합니다.
        </div>
      ) : null}
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Posts</h2>
          <p className="text-sm text-neutral-500 mt-1">전체 포스트와 상태를 관리합니다.</p>
        </div>
        <Link
          to="/posts/new"
          className="rounded-md bg-ms-blue px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#005a9e] shadow-elevation-2 hover:shadow-elevation-4"
        >
          새 포스트
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-neutral-800">상태 필터</label>
        <select
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">전체</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <span className="text-sm text-neutral-500">
          {filteredPosts.length}개의 포스트
        </span>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="clean-card p-6 space-y-6 border-l-4 border-neutral-200">
                <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-100 rounded w-full"></div>
                <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card colorScheme="slate" className="text-center py-12">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-neutral-900">표시할 포스트가 없습니다.</p>
            <p className="text-sm text-neutral-500">새 포스트를 작성해보세요.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PostsList
