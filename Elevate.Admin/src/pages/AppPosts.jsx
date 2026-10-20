import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import AppHero from '../components/apps/AppHero.jsx'
import { PostCard, PostGridSkeleton } from '../components/apps/PostCard.jsx'
import SearchBox from '../components/layout/SearchBox.jsx'
import { Notice, Pagination } from '../components/ui/index.js'
import NotFound from './NotFound.jsx'
import { useAdminPosts } from '../hooks/adminPosts.js'
import { useDbarSlot, usePageApp } from '../hooks/shell.js'
import { isApiConfigured } from '../lib/apiClient.js'
import { ALL_APPS_KEY, APP_KEYS, APP_LABELS, getApiCategory, isAppKey } from '../constants/apps.js'
import { getAppMeta } from '../constants/appMeta.js'
import { ARCHIVED, PUBLISHED, getStatusLabel, toStatusKey } from '../constants/status.js'

const PAGE_SIZE = 12
const REFRESH_AFTER_MS = 30_000
const STATUS_FILTERS = ['all', PUBLISHED, ARCHIVED]

function matchesQuery(post, query) {
  if (!query) return true
  const needle = query.toLowerCase()
  return [post.title, post.excerpt, post.slug, ...(post.tags || [])]
    .some((value) => String(value || '').toLowerCase().includes(needle))
}

function countByStatus(posts) {
  return posts.reduce((counts, post) => {
    const key = toStatusKey(post.status)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

/** 모바일 전용 앱 전환기 (데스크톱에서는 왼쪽 내비게이터가 대신한다). */
function AppSwitcher({ activeKey }) {
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const active = track?.querySelector('[aria-current="page"]')
    if (!track || !active || track.scrollWidth <= track.clientWidth) return
    track.scrollLeft = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2
  }, [activeKey])

  return (
    <nav ref={trackRef} className="ea-seg ea-seg--apps" aria-label="앱 선택">
      {[ALL_APPS_KEY, ...APP_KEYS].map((key) => {
        const meta = getAppMeta(key)
        return (
          <Link
            key={key}
            to={`/apps/${key}`}
            className="ea-seg__item"
            aria-current={key === activeKey ? 'page' : undefined}
          >
            {meta.icon && <img src={meta.icon} alt="" width="16" height="16" />}
            {key === ALL_APPS_KEY ? '전체' : meta.name}
          </Link>
        )
      })}
    </nav>
  )
}

function EmptyState({ title, hint, children }) {
  return (
    <div className="ea-empty" role="status">
      <span className="ea-drop" aria-hidden="true" />
      <strong>{title}</strong>
      {hint && <span>{hint}</span>}
      {children && <div className="ea-empty__actions">{children}</div>}
    </div>
  )
}

/**
 * 앱별(또는 전체) 게시글 목록. 공개 사이트 블로그 목록처럼 히어로와 카드 그리드로 보여 주고,
 * 게시 상태 필터·검색·페이지 이동은 주소(?status, ?q, ?page)에 남겨 새로고침해도 유지한다.
 */
export default function AppPosts() {
  const { appKey = ALL_APPS_KEY } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { posts, byCategory, errors, initialized, loading, refresh } = useAdminPosts()
  const dbarSlot = useDbarSlot()
  const isAll = appKey === ALL_APPS_KEY
  const isValid = isAll || isAppKey(appKey)
  usePageApp(isValid ? appKey : null)

  // 다른 화면에서 돌아오면 오래된 목록만 다시 불러온다 (저장·삭제 직후에는 편집 화면이 새로 고친다).
  useEffect(() => {
    refresh({ ifOlderThan: REFRESH_AFTER_MS })
  }, [refresh])

  const rawStatus = searchParams.get('status')
  const status = STATUS_FILTERS.includes(rawStatus) ? rawStatus : 'all'
  const query = (searchParams.get('q') || '').trim()
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const appPosts = useMemo(
    () => (isAll ? posts : posts.filter((post) => post.app === appKey)),
    [posts, isAll, appKey],
  )
  const appCounts = useMemo(() => countByStatus(appPosts), [appPosts])
  const searched = useMemo(() => appPosts.filter((post) => matchesQuery(post, query)), [appPosts, query])
  const searchedCounts = useMemo(() => countByStatus(searched), [searched])
  const filtered = useMemo(
    () => (status === 'all' ? searched : searched.filter((post) => toStatusKey(post.status) === status)),
    [searched, status],
  )

  if (!isValid) return <NotFound />

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const apiCategory = isAll ? null : getApiCategory(appKey)
  const failedCategories = isAll ? Object.keys(errors) : (errors[apiCategory] ? [apiCategory] : [])
  const hasData = isAll ? Object.keys(byCategory).length > 0 : Boolean(byCategory[apiCategory])

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    setSearchParams(params)
  }

  const meta = getAppMeta(appKey)
  const label = isAll ? '전체 게시글' : meta.name
  const newPostTo = isAll ? '/posts/new' : `/posts/new?app=${appKey}`
  const heroMeta = [
    initialized ? `게시글 ${appPosts.length}개` : '불러오는 중',
    initialized && appPosts.length > 0
      ? `게시 ${appCounts[PUBLISHED] || 0} · 보관 ${appCounts[ARCHIVED] || 0}`
      : null,
    '최근 수정순',
  ]

  const retry = () => refresh()
  const failedNames = failedCategories.map((category) => APP_LABELS[category] || category).join(', ')

  let body
  if (!isApiConfigured) {
    body = (
      <EmptyState title="API가 연결되지 않았습니다." hint="VITE_API_BASE_URL을 설정하면 게시글 목록을 불러옵니다." />
    )
  } else if (!initialized || (loading && !hasData)) {
    body = <PostGridSkeleton count={6} />
  } else if (!hasData && failedCategories.length > 0) {
    body = (
      <div className="ea-empty" role="alert">
        <strong>게시글을 불러오지 못했습니다.</strong>
        <span>{errors[failedCategories[0]]}</span>
        <button type="button" className="ea-textlink" onClick={retry}>다시 시도</button>
      </div>
    )
  } else if (filtered.length === 0) {
    if (query) {
      body = (
        <EmptyState title={`‘${query}’에 대한 검색 결과가 없습니다.`} hint="다른 검색어로 다시 찾아보세요.">
          <button type="button" className="ea-btn ea-btn--secondary ea-btn--sm" onClick={() => updateParams({ q: '', page: '' })}>
            검색 지우기
          </button>
        </EmptyState>
      )
    } else if (status !== 'all') {
      body = <EmptyState title={`${getStatusLabel(status)} 상태인 게시글이 없습니다.`} />
    } else {
      body = (
        <EmptyState title={`${label} 게시글이 없습니다.`} hint="첫 게시글을 작성해 보세요.">
          <Link to={newPostTo} className="ea-btn ea-btn--primary ea-btn--sm">
            <Plus size={16} aria-hidden="true" />
            새 글 작성
          </Link>
        </EmptyState>
      )
    }
  } else {
    body = (
      <div className="ea-grid">
        {visible.map((post, index) => <PostCard key={post.id} post={post} priority={index < 3} showApp={isAll} />)}
      </div>
    )
  }

  return (
    <>
      {dbarSlot && createPortal(
        <SearchBox
          key={`${appKey}:${query}`}
          placeholder={isAll ? '전체 게시글 검색' : `${label}에서 검색`}
          value={query}
          onSubmit={(next) => updateParams({ q: next, page: '' })}
        />,
        dbarSlot,
      )}

      <AppHero
        app={appKey}
        title={label}
        abstract={meta.description}
        meta={heroMeta}
        actions={(
          <Link to={newPostTo} className="ea-btn ea-btn--primary">
            <Plus size={17} aria-hidden="true" />
            새 글 작성
          </Link>
        )}
      />

      <section className="ea-container ea-section" aria-label={`${label} 목록`} aria-busy={loading || undefined}>
        <AppSwitcher activeKey={appKey} />

        <div className="ea-toolbar">
          <div className="ea-seg" role="group" aria-label="게시 상태">
            {STATUS_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className="ea-seg__item"
                aria-pressed={status === key}
                onClick={() => updateParams({ status: key === 'all' ? '' : key, page: '' })}
              >
                {key === 'all' ? '전체' : getStatusLabel(key)}
                {initialized && (
                  <span className="ea-seg__num">{key === 'all' ? searched.length : searchedCounts[key] || 0}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {query && (
              <>
                <span className="ea-count">‘{query}’ 검색 결과 {filtered.length}개</span>
                <button type="button" className="ea-textlink" onClick={() => updateParams({ q: '', page: '' })}>
                  검색 지우기
                </button>
              </>
            )}
            {isApiConfigured && (
              <button type="button" className="ea-btn ea-btn--ghost ea-btn--sm" onClick={retry} disabled={loading}>
                <RefreshCw size={15} aria-hidden="true" className={loading ? 'animate-spin' : undefined} />
                새로고침
              </button>
            )}
          </div>
        </div>

        {hasData && failedCategories.length > 0 && (
          <div className="mb-6">
            <Notice
              tone="error"
              action={<button type="button" className="ea-textlink" onClick={retry}>다시 시도</button>}
            >
              {failedNames} 게시글을 불러오지 못했습니다. 표시된 목록에 일부 글이 빠져 있을 수 있습니다.
            </Notice>
          </div>
        )}

        {body}

        {visible.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(next) => {
              updateParams({ page: next > 1 ? String(next) : '' })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </section>
    </>
  )
}
