import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminPostsContext } from '../../hooks/adminPosts.js'
import { useAuth } from '../../hooks/useAuth.js'
import { isApiConfigured } from '../../lib/apiClient.js'
import { listAllPosts } from '../../services/postsApi.js'
import { getPublishedSeriesOrder } from '../../services/publicSeriesApi.js'
import { BASE_CATEGORIES, getDisplayCategory } from '../../constants/apps.js'
import { sortByPublishedDesc } from '../../utils/postOrder.js'

// 공개 API가 늦어도 목록은 이 시간 뒤에 보여 준다 (같은 게시일 안의 순서만 서버 제목 순으로 바뀐다).
const SERIES_ORDER_TIMEOUT_MS = 4000

// 화면용 제목·요약표(약 26 KB)는 초기 JavaScript에 넣지 않고 목록을 불러올 때 함께 받는다.
let postTextModule = null
function loadDisplayText() {
  postTextModule ||= import('../../utils/postText.js').catch((error) => {
    postTextModule = null
    throw error
  })
  return postTextModule.then((module) => module.withDisplayText)
}

function settleWithin(promise, ms) {
  let timer
  const timeout = new Promise((resolve) => { timer = setTimeout(resolve, ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/**
 * 서버 category 7개의 게시글 요약을 모두 불러와 공개 사이트와 같은 앱으로 분류한다.
 * 제목·요약은 공개 사이트가 보여 주는 문구로 바꾸고(utils/postText.js), 공개 블로그와 같은 순서로 정렬한다
 * (게시일 최신순, 같은 게시일은 공개 API의 시리즈 순서).
 * 사이드바 개수, 앱별 목록, 전체 게시글이 같은 데이터를 쓴다. 한 category가 실패해도
 * 나머지는 표시하고, 실패한 category는 errors로 알린다.
 */
export default function AdminPostsProvider({ children }) {
  const { msalInstance } = useAuth()
  const [state, setState] = useState({
    byCategory: {},
    errors: {},
    seriesOrder: null,
    displayText: null,
    initialized: !isApiConfigured,
    loading: isApiConfigured,
  })
  const [version, setVersion] = useState(0)
  // 첫 화면의 목록 페이지 effect가 이 provider의 effect보다 먼저 실행돼도 첫 조회를 한 번만 하도록 처음부터 조회 중으로 둔다.
  const loadingRef = useRef(isApiConfigured)
  const loadedAtRef = useRef(0)

  useEffect(() => {
    if (!isApiConfigured) return undefined
    const controller = new AbortController()
    loadingRef.current = true

    const seriesOrder = settleWithin(getPublishedSeriesOrder({ signal: controller.signal }), SERIES_ORDER_TIMEOUT_MS)
      .catch((error) => {
        if (!controller.signal.aborted) console.warn('[AdminPostsProvider] 공개 사이트 시리즈 순서 조회 실패', error)
      })
    const displayText = loadDisplayText().catch((error) => {
      console.error('[AdminPostsProvider] 공개 사이트 제목·요약 문구를 불러오지 못했습니다', error)
    })

    Promise.all([
      Promise.allSettled(BASE_CATEGORIES.map((category) => (
        listAllPosts({ msalInstance, category, signal: controller.signal })
      ))),
      seriesOrder,
      displayText,
    ]).then(([results, nextSeriesOrder, nextDisplayText]) => {
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
        return {
          byCategory: { ...kept, ...byCategory },
          errors,
          seriesOrder: nextSeriesOrder || prev.seriesOrder,
          displayText: nextDisplayText || prev.displayText,
          initialized: true,
          loading: false,
        }
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

  const { byCategory, errors, seriesOrder, displayText, initialized, loading } = state
  const posts = useMemo(() => {
    const toDisplay = displayText || ((post) => post)
    return sortByPublishedDesc(Object.values(byCategory).flat().map((post) => ({
      ...toDisplay(post),
      app: getDisplayCategory(post),
      seriesOrder: seriesOrder?.get(post.id) ?? post.seriesOrder ?? null,
    })))
  }, [byCategory, seriesOrder, displayText])

  const value = useMemo(
    () => ({ byCategory, errors, initialized, loading, posts, refresh }),
    [byCategory, errors, initialized, loading, posts, refresh],
  )

  return <AdminPostsContext.Provider value={value}>{children}</AdminPostsContext.Provider>
}
