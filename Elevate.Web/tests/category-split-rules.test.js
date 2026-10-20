import { describe, expect, it } from 'vitest';
import { getDisplayCategory } from '../src/constants/categories';

// 2026-10-20 공개 API(/api/public/posts?category=…&limit=100)에서 받은 게시 글 전체의
// slug·series·tags와, GitHub/Azure 태그 규칙을 추가하기 전 규칙으로 계산한 화면 카테고리.
// [서버 category, slug, series, tags, 화면 카테고리]
const PUBLISHED_SPLIT_SOURCE_POSTS = [
  ['m365', 'forms-share', 'Forms 입문 가이드', ['m365', 'productivity', 'cloud', 'forms'], 'forms'],
  ['m365', 'forms-quiz', 'Forms 입문 가이드', ['m365', 'productivity', 'cloud', 'forms'], 'forms'],
  ['m365', 'forms-question', 'Forms 입문 가이드', ['m365', 'productivity', 'cloud', 'forms'], 'forms'],
  ['m365', 'forms-option', 'Forms 입문 가이드', ['m365', 'productivity', 'cloud', 'forms'], 'forms'],
  ['m365', 'forms-inschool', 'Forms 입문 가이드', ['m365', 'productivity', 'cloud', 'forms'], 'forms'],
  ['m365', 'powershell', 'M365 Tips 톺아보기', ['m365', 'powershell'], 'm365'],
  ['m365', 'newversionoffice-download', 'M365 Tips 톺아보기', ['m365', 'productivity'], 'm365'],
  ['m365', 'wordonline5', 'Word Online 입문 가이드', ['word', 'm365'], 'word'],
  ['m365', 'wordonline4', 'Word Online 입문 가이드', ['word', 'm365'], 'word'],
  ['m365', 'wordonline3', 'Word Online 입문 가이드', ['word', 'm365'], 'word'],
  ['m365', 'wordonline2', 'Word Online 입문 가이드', ['word', 'm365'], 'word'],
  ['m365', 'wordonline1', 'Word Online 입문 가이드', ['word', 'm365'], 'word'],
  ['m365', 'pptonline6', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'pptonline5', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'pptonline4', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'pptonline3', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'pptonline2', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'pptonline1', 'PowerPoint Online 입문 가이드', ['powerpoint', 'm365'], 'powerpoint'],
  ['m365', 'powerpoint-tutorial', 'PowerPoint Online 입문 가이드', ['m365', 'productivity', 'office', 'powerpoint'], 'powerpoint'],
  ['m365', 'signup', 'M365 Tips 톺아보기', ['m365', 'account', 'education', 'tutorial'], 'm365'],
  ['m365', 'onedrive-tutorial', 'Onedrive 입문 가이드', ['m365', 'productivity', 'cloud', 'onedrive'], 'onedrive'],
  ['m365', 'onedrive-mobile', 'Onedrive 입문 가이드', ['m365', 'productivity', 'cloud', 'onedrive'], 'onedrive'],
  ['copilot-studio', 'copilotstudio', '입문 가이드', [], 'copilot-studio'],
  ['copilot-studio', 'github-pages', '입문 가이드', [], 'github'],
  ['copilot-studio', 'secret-key-azure-function-github-pages', '입문 가이드', [], 'azure'],
  ['copilot-studio', 'agent-to-website', '입문 가이드', ['CopilotStudio', 'GitHub', 'GitHub Pages'], 'github'],
  ['copilot-studio', 'copilot-studio-multi-agent', '입문 가이드', ['CopilotStudio', 'Agent'], 'copilot-studio'],
  ['copilot-studio', 'github-copilot', null, [], 'github'],
  ['copilot-studio', 'copilot-studio-multi-model-ai-agent-github-pages', '입문 가이드', [], 'github'],
  ['copilot-studio', 'new-copilot-studio-api', '입문 가이드', ['Copilot Studio'], 'copilot-studio'],
  ['copilot-studio', 'post', '입문 가이드', [], 'copilot-studio'],
  ['copilot-studio', 'ai-agent', null, ['Copilot Studio'], 'copilot-studio'],
  ['copilot-studio', 'copilot-studio-workshop-chemicalfactory', null, ['Agent'], 'copilot-studio'],
];

function countBy(values) {
  return values.reduce((counts, value) => ({ ...counts, [value]: (counts[value] || 0) + 1 }), {});
}

describe('category split rules', () => {
  it.each(PUBLISHED_SPLIT_SOURCE_POSTS)(
    'keeps the published %s post %s in the same screen category',
    (category, slug, series, tags, expected) => {
      expect(getDisplayCategory({ category, slug, series, tags })).toBe(expected);
    },
  );

  it('keeps the published category counts that the blog shows today', () => {
    const counts = countBy(PUBLISHED_SPLIT_SOURCE_POSTS.map(([category, slug, series, tags]) => (
      getDisplayCategory({ category, slug, series, tags })
    )));
    expect(counts).toEqual({
      m365: 3, word: 5, powerpoint: 7, forms: 5, onedrive: 2,
      'copilot-studio': 6, github: 4, azure: 1,
    });
  });

  it.each([
    [['github'], 'github'],
    [['GitHub', 'Actions'], 'github'],
    [['azure'], 'azure'],
    [['Azure Functions', 'AZURE'], 'azure'],
    [['Copilot Studio'], 'copilot-studio'],
    [[], 'copilot-studio'],
  ])('places a new Copilot Studio post tagged %j under %s', (tags, expected) => {
    expect(getDisplayCategory({ category: 'copilot-studio', slug: 'new-admin-post', series: null, tags })).toBe(expected);
  });

  it('applies slug, then series, then tag', () => {
    expect(getDisplayCategory({ category: 'copilot-studio', slug: 'github-pages', tags: ['azure'] })).toBe('github');
    expect(getDisplayCategory({ category: 'm365', slug: 'new', series: 'Forms 입문 가이드', tags: ['word'] })).toBe('forms');
    expect(getDisplayCategory({ category: 'm365', slug: 'new', series: 'M365 Tips 톺아보기', tags: ['Word'] })).toBe('word');
  });

  it('does not move posts of other server categories by app tags', () => {
    expect(getDisplayCategory({ category: 'teams', slug: 'teams-post', tags: ['github', 'word'] })).toBe('teams');
  });
});
