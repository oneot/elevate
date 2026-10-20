import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminPostsContext } from '../../hooks/adminPosts.js'
import { useAuth } from '../../hooks/useAuth.js'
import { isApiConfigured } from '../../lib/apiClient.js'
import { listAllPosts } from '../../services/postsApi.js'
import { BASE_CATEGORIES, getDisplayCategory } from '../../constants/apps.js'

function updatedTime(post) {
  const time = Date.parse(post?.updatedAt || '')
  return Number.isFinite(time) ? time : 0
}

/**
 * 서버 category 7개의 게시글 요약을 모두 불러와 공개 사이트와 같은 앱으로 분류한다.
 * 사이드바 개수, 앱별 목록, 전체 게시글이 같은 데이터를 쓴다. 한 category가 실패해도
 * 나머지는 표시하고, 실패한 category는 errors로 알린다.
 */
export default function AdminPostsProvider({ children }) {
  const { msalInstance } = useAuth()
  const [state, setState] = useState({ byCategory: {}, errors: {}, initialized: !isApiConfigured, loading: isApiConfigured })
  const [version, setVersion] = useState(0)
  const loadingRef = useRef(false)
  const loadedAtRef = useRef(0)

  useEffect(() => {
    if (!isApiConfigured) return undefined
    const controller = new AbortController()
    loadingRef.current = true

    Promise.allSettled(BASE_CATEGORIES.map((category) => (
      listAllPosts({ msalInstance, category, signal: controller.signal })
    ))).then((results) => {
      if (controller.signal.aborted) return
      const byCategory = {}
      const errors = {}
      results.forEach((result, index) => {
        const category = BASE_CATEGORIES[index]
        if (result.status === 'fulfilled') {
          byCategory[category] = result.value
        } else {
          console.error(`[AdminPostsProvider] ${category} 게시글 조회 실패`, result.reason)
          errors[category] = result.reason?.message || '게시글을 불러오지 못했습니다.'
        }
      })
      loadingRef.current = false
      loadedAtRef.current = Date.now()
      // 실패한 category는 직전에 받은 목록을 유지하고 오류만 함께 알린다.
      setState((prev) => {
        const kept = Object.fromEntries(
          Object.keys(errors)
            .filter((key) => prev.byCategory[key])
            .map((key) => [key, prev.byCategory[key]]),
        )
        return { byCategory: { ...kept, ...byCategory }, errors, initialized: true, loading: false }
      })
    })

    return () => {
      controller.abort()
      loadingRef.current = false
    }
  }, [msalInstance, version])

  const refresh = useCallback(({ ifOlderThan } = {}) => {
    if (!isApiConfigured || loadingRef.current) return
    if (ifOlderThan && loadedAtRef.current && Date.now() - loadedAtRef.current < ifOlderThan) return
    loadingRef.current = true
    setState((prev) => ({ ...prev, loading: true }))
    setVersion((value) => value + 1)
  }, [])

  const posts = useMemo(() => (
    Object.values(state.byCategory)
      .flat()
      .map((post) => ({ ...post, app: getDisplayCategory(post) }))
      .sort((a, b) => updatedTime(b) - updatedTime(a))
  ), [state.byCategory])

  const value = useMemo(() => ({ ...state, posts, refresh }), [state, posts, refresh])

  return <AdminPostsContext.Provider value={value}>{children}</AdminPostsContext.Provider>
}
