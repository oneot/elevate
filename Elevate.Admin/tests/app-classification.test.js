import { describe, expect, it } from 'vitest'
import * as admin from '../src/constants/apps.js'
import * as web from '../../Elevate.Web/src/constants/categories.js'

const RULE_SLUGS = web.CATEGORY_SPLIT_RULES.flatMap((rule) => rule.slugs || [])
const RULE_SERIES = web.CATEGORY_SPLIT_RULES.map((rule) => rule.series).filter(Boolean)
const RULE_TAGS = web.CATEGORY_SPLIT_RULES.map((rule) => rule.tag).filter(Boolean)

function samplePosts() {
  const categories = [...web.BASE_CATEGORIES, 'event', 'update']
  const slugs = [...RULE_SLUGS, 'brand-new-post']
  const series = [...RULE_SERIES, 'M365 Tips 톺아보기', '입문 가이드', null]
  const tagSets = [
    [],
    ['Copilot Studio'],
    ...RULE_TAGS.map((tag) => [tag]),
    ...RULE_TAGS.map((tag) => [tag.toUpperCase(), 'guide']),
    ['forms', 'word'],
    ['azure', 'github'],
  ]
  return categories.flatMap((category) => slugs.flatMap((slug) => series.flatMap((name) => (
    tagSets.map((tags) => ({ category, slug, series: name, tags }))
  ))))
}

describe('admin app model mirrors the public site (Elevate.Web/src/constants/categories.js)', () => {
  it('uses the same split rules, base categories, app order and labels', () => {
    expect(admin.CATEGORY_SPLIT_RULES).toEqual(web.CATEGORY_SPLIT_RULES)
    expect(admin.BASE_CATEGORIES).toEqual(web.BASE_CATEGORIES)
    expect(admin.APP_KEYS).toEqual(web.POST_LIST_CATEGORIES.filter((key) => key !== 'all'))
    admin.APP_KEYS.forEach((app) => {
      expect(admin.APP_LABELS[app]).toBe(web.CATEGORY_DISPLAY_NAMES[app])
      expect(admin.getApiCategory(app)).toBe(web.getApiCategory(app))
    })
  })

  it('classifies every slug, series and tag combination exactly like the public site', () => {
    const posts = samplePosts()
    expect(posts.length).toBeGreaterThan(1000)
    posts.forEach((post) => {
      expect(admin.getDisplayCategory(post), JSON.stringify(post)).toBe(web.getDisplayCategory(post))
    })
  })

  it.each(admin.APP_KEYS)('places a new %s post under the same app on the public site', (app) => {
    const created = {
      category: admin.getApiCategory(app),
      slug: 'brand-new-post',
      series: null,
      tags: admin.applyAppTag(['guide'], app),
    }
    expect(admin.BASE_CATEGORIES).toContain(created.category)
    expect(web.getDisplayCategory(created)).toBe(app)
    expect(admin.getDisplayCategory(created)).toBe(app)
  })
})

describe('app helpers', () => {
  it('maps apps to the stored server category and app tag', () => {
    expect(admin.getApiCategory('word')).toBe('m365')
    expect(admin.getApiCategory('github')).toBe('copilot-studio')
    expect(admin.getApiCategory('teams')).toBe('teams')
    expect(admin.getAppTag('onedrive')).toBe('onedrive')
    expect(admin.getAppTag('azure')).toBe('azure')
    expect(admin.getAppTag('m365')).toBeNull()
    expect(admin.getAppTag('copilot')).toBeNull()
  })

  it('swaps only app tags when the app of a new post changes', () => {
    expect(admin.applyAppTag([], 'word')).toEqual(['word'])
    expect(admin.applyAppTag(['word', 'guide'], 'powerpoint')).toEqual(['powerpoint', 'guide'])
    expect(admin.applyAppTag(['Word', 'guide', 'GitHub'], 'teams')).toEqual(['guide'])
    expect(admin.applyAppTag(['m365', 'productivity'], 'forms')).toEqual(['forms', 'm365', 'productivity'])
  })

  it('accepts only the 13 public apps as app keys', () => {
    expect(admin.APP_KEYS).toHaveLength(13)
    expect(admin.isAppKey('github')).toBe(true)
    expect(admin.isAppKey('all')).toBe(false)
    ;['event', 'update', 'mee', 'agenthon', 'program-news', 'activity'].forEach((removed) => {
      expect(admin.isAppKey(removed)).toBe(false)
    })
  })
})
