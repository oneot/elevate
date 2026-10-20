import { describe, expect, it } from 'vitest'
import { withDisplayText } from '../src/utils/postText.js'
import { POST_TEXT_OVERRIDES } from '../../Elevate.Web/src/constants/postText.js'
import { toDisplayPost } from '../../Elevate.Web/src/constants/categories.js'

describe('admin titles and excerpts mirror the public site (Elevate.Web/src/constants/postText.js)', () => {
  it('shows every tidied public title and excerpt and keeps the stored text for search', () => {
    expect(POST_TEXT_OVERRIDES.length).toBeGreaterThan(0)
    for (const { title, excerpt } of POST_TEXT_OVERRIDES) {
      const stored = { id: title[0], category: 'teams', slug: 'post', tags: [], title: title[0], excerpt: excerpt[0] }
      const shown = withDisplayText(stored)
      const publicPost = toDisplayPost(stored)
      expect(shown.title, title[0]).toBe(publicPost.title)
      expect(shown.excerpt, title[0]).toBe(publicPost.excerpt)
      expect(shown.title).toBe(title[1])
      expect(shown.excerpt).toBe(excerpt[1])
      expect(shown.serverTitle).toBe(title[0])
      expect(shown.serverExcerpt).toBe(excerpt[0])
    }
  })

  it('shows the stored text once it was edited in the admin, like the public site', () => {
    const [{ title, excerpt }] = POST_TEXT_OVERRIDES
    const saved = { id: 'saved', title: title[1], excerpt: excerpt[1] }
    expect(withDisplayText(saved)).toBe(saved)
    const edited = { id: 'edited', title: '새로 고친 제목', excerpt: excerpt[0] }
    expect(withDisplayText(edited)).toEqual({ ...edited, excerpt: excerpt[1], serverTitle: '새로 고친 제목', serverExcerpt: excerpt[0] })
    expect(withDisplayText(null)).toBeNull()
  })
})
