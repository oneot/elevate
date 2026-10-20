import { describe, expect, it } from 'vitest'
import { _test } from '../src/services/postsApi.js'

describe('posts API payloads', () => {
  it('never sends a summary, so the one the AI wrote into the post stays', () => {
    const editorPost = { title: '공동 작업 가이드', category: 'm365', excerpt: '화면에 남아 있던 요약', htmlBody: '<p>본문</p>', status: 'published', tags: ['word'] }

    expect(_test.toCreatePayload(editorPost)).toEqual({
      title: '공동 작업 가이드', category: 'm365', contentMarkdown: '<p>본문</p>', tags: ['word'], status: 'published',
    })
    expect(_test.toUpdatePayload(editorPost)).toEqual({
      title: '공동 작업 가이드', contentMarkdown: '<p>본문</p>', status: 'published',
    })
  })
})
