import { afterEach, describe, expect, it, vi } from 'vitest'
import { getListTime, sortByPublishedDesc } from '../src/utils/postOrder.js'
import { sortByPublishedDesc as sortLikePublicBlog } from '../../Elevate.Web/src/api/categoryPosts.js'
import { getPublishedSeriesOrder, PUBLIC_API_BASE_URL } from '../src/services/publicSeriesApi.js'

function post(id, publishedAt, extra = {}) {
  return { id, title: `${id} title`, status: 'published', publishedAt, updatedAt: '2026-10-19T00:00:00Z', ...extra }
}

// 공개 블로그처럼 게시일이 같은 글이 많은 경우 (시리즈 글을 같은 날짜로 한꺼번에 올렸다).
const PUBLISHED = [
  post('word-1', '2026-03-09T00:00:00.000Z', { seriesOrder: 1 }),
  post('word-5', '2026-03-09T00:00:00.000Z', { seriesOrder: 5 }),
  post('copilot-3', '2026-03-09T00:00:00.000Z', { seriesOrder: 3 }),
  post('excel-1', '2026-02-02T00:00:00.000Z', { seriesOrder: 7, serverTitle: 'Excel 기능 1', title: '함수 익히기' }),
  post('excel-2', '2026-02-02T00:00:00.000Z', { seriesOrder: 8, serverTitle: 'Excel 기능 2', title: '차트 만들기' }),
  post('tutorial-a', '2026-02-16T00:00:00.000Z', { seriesOrder: 1, serverTitle: 'PowerPoint 시작 2' }),
  post('tutorial-b', '2026-02-16T00:00:00.000Z', { seriesOrder: 1, serverTitle: 'PowerPoint 시작 10' }),
  post('single-a', '2026-01-26T00:00:00.000Z', { title: '나 글' }),
  post('single-b', '2026-01-26T00:00:00.000Z', { title: '가 글' }),
  post('latest', '2026-10-12T04:29:02.469Z', { seriesOrder: null }),
]

const ids = (posts) => posts.map((item) => item.id)

describe('admin list order mirrors the public blog (Elevate.Web sortByPublishedDesc)', () => {
  it('orders published posts exactly like the public site, including posts published at the same time', () => {
    const expected = ids(sortLikePublicBlog(PUBLISHED))
    expect(expected[0]).toBe('latest')
    for (const input of [PUBLISHED, [...PUBLISHED].reverse(), [...PUBLISHED.slice(5), ...PUBLISHED.slice(0, 5)]]) {
      expect(ids(sortByPublishedDesc(input))).toEqual(expected)
    }
  })

  it('places posts that were never published by their last edit time', () => {
    const draft = { id: 'draft', title: '새 글', status: 'draft', publishedAt: null, updatedAt: '2026-05-01T00:00:00Z' }
    const archived = post('archived', '2026-02-20T00:00:00.000Z', { status: 'archived', updatedAt: '2026-10-20T00:00:00Z' })
    const order = ids(sortByPublishedDesc([...PUBLISHED, draft, archived]))
    expect(order.slice(0, 3)).toEqual(['latest', 'draft', 'word-5'])
    // 게시한 적이 있는 보관 글은 최근에 고쳐도 게시일 자리에 남는다.
    expect(order.indexOf('archived')).toBe(order.indexOf('tutorial-b') - 1)
    expect(getListTime(draft)).toBe(Date.parse('2026-05-01T00:00:00Z'))
    expect(getListTime({})).toBe(0)
  })
})

describe('public series order', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('reads the series order of published posts from the public API of the same Function App', async () => {
    expect(PUBLIC_API_BASE_URL).toBe('https://api.example.test/api/public')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
      items: [
        { name: 'Word Online 입문 가이드', posts: [{ id: 'word-1', seriesOrder: 1 }, { id: 'word-5', seriesOrder: 5 }] },
        { name: '순서 없음', posts: [{ id: 'loose', seriesOrder: null }, { seriesOrder: 3 }] },
      ],
    })))
    const orders = await getPublishedSeriesOrder()
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/api/public/series', { signal: undefined })
    expect([...orders]).toEqual([['word-1', 1], ['word-5', 5]])
  })

  it('fails when the public API answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ code: 'InternalServerError' }, { status: 500 })))
    await expect(getPublishedSeriesOrder()).rejects.toThrow('PUBLIC_SERIES_500')
  })
})
