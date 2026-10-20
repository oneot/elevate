import { useEffect, useState } from 'react'
import { useAuth } from './useAuth.js'
import { isApiConfigured } from '../lib/apiClient.js'
import { getPost } from '../services/postsApi.js'
import { CARD_IMAGE_SIZES, getThumbnailImageProps } from '../utils/postImages.js'
import { getPublicThumbImageProps } from '../utils/publicThumbs.js'

// 서버가 주는 읽기 SAS는 1시간 유효하다 (Elevate.Server storageClient getRollingReadSasWindow).
const THUMBNAIL_TTL_MS = 30 * 60 * 1000
const MAX_CONCURRENT_LOADS = 3

/** post.id → { version, promise, thumbnail?, loadedAt? } */
const cache = new Map()
const waiting = []
let running = 0

function schedule(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      running += 1
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          running -= 1
          waiting.shift()?.()
        })
    }
    if (running < MAX_CONCURRENT_LOADS) run()
    else waiting.push(run)
  })
}

function isFresh(entry, version) {
  return entry?.version === version
    && (entry.loadedAt === undefined || Date.now() - entry.loadedAt <= THUMBNAIL_TTL_MS)
}

function readLoaded(id, version) {
  const entry = cache.get(id)
  return isFresh(entry, version) && entry.loadedAt !== undefined ? entry.thumbnail : undefined
}

function loadThumbnail(id, version, msalInstance) {
  const entry = cache.get(id)
  if (isFresh(entry, version)) return entry.promise

  const next = { version }
  next.promise = schedule(() => getPost(id, { msalInstance })).then(
    (detail) => {
      next.thumbnail = detail?.thumbnail || null
      next.loadedAt = Date.now()
      return next.thumbnail
    },
    (error) => {
      if (cache.get(id) === next) cache.delete(id)
      throw error
    },
  )
  cache.set(id, next)
  return next.promise
}

/**
 * 목록 카드 이미지. 공개 사이트 카드(Elevate.Web DocsPostCard)와 같은 순서로 고른다:
 * 공개 사이트 정적 썸네일 → DB 썸네일 variants → 없음(호출부가 앱 유리 타일을 그린다).
 * 관리자 목록 요약에는 썸네일이 없으므로, 정적 썸네일이 없는 글만 상세 조회로 DB 썸네일을 받아
 * 같은 세션 동안 재사용한다. 서명 URL이 만료돼 이미지가 실패하면 한 번 새로 받는다.
 * @returns {{ imageProps: object | null, pending: boolean, onError: () => void }}
 */
export function useCardImage(post) {
  const { msalInstance } = useAuth()
  const staticProps = getPublicThumbImageProps(post.app, post.slug, CARD_IMAGE_SIZES)
  const hasSummaryThumbnail = post.thumbnail !== undefined
  const canLoad = !staticProps && !hasSummaryThumbnail && isApiConfigured && Boolean(post.id)
  const version = post.updatedAt || ''
  const key = `${post.id}:${version}`

  const [attempt, setAttempt] = useState({ key, count: 0, failed: false })
  const current = attempt.key === key ? attempt : { key, count: 0, failed: false }
  const [loaded, setLoaded] = useState(null)

  const fromState = loaded?.key === key && loaded.count === current.count ? loaded.thumbnail : undefined
  const thumbnail = hasSummaryThumbnail
    ? post.thumbnail
    : fromState !== undefined ? fromState : canLoad ? readLoaded(post.id, version) : null

  useEffect(() => {
    if (!canLoad || thumbnail !== undefined) return undefined
    let cancelled = false
    const count = current.count
    loadThumbnail(post.id, version, msalInstance)
      .then((value) => {
        if (!cancelled) setLoaded({ key, count, thumbnail: value })
      })
      .catch((error) => {
        console.warn(`[useCardImage] ${post.id} 썸네일 조회 실패`, error)
        if (!cancelled) setLoaded({ key, count, thumbnail: null })
      })
    return () => {
      cancelled = true
    }
  }, [canLoad, thumbnail, post.id, version, key, current.count, msalInstance])

  const dbProps = !staticProps && !current.failed && thumbnail
    ? getThumbnailImageProps(thumbnail, { sizes: CARD_IMAGE_SIZES })
    : null

  const onError = () => {
    if (!dbProps) return
    if (current.count === 0 && canLoad) {
      cache.delete(post.id)
      setAttempt({ key, count: 1, failed: false })
    } else {
      setAttempt({ key, count: current.count, failed: true })
    }
  }

  return {
    imageProps: staticProps || dbProps,
    pending: canLoad && thumbnail === undefined && !current.failed,
    onError,
  }
}

export const _test = {
  reset() {
    cache.clear()
    waiting.length = 0
    running = 0
  },
}
