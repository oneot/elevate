/**
 * @file PostList.jsx
 * @description 카테고리별 게시글 목록 페이지 (Apple Developer Documentation 스타일 레이아웃).
 *
 * URL 파라미터(`/:category`)와 쿼리 파라미터(`?page`, `?q`)를 기반으로
 * 게시글 목록을 API에서 가져와 렌더링한다. (태그는 화면에 보여 주지 않는다.)
 *
 * - all: `listPosts`로 서버 페이지네이션 (최신 글부터). 검색할 때는 카테고리 화면처럼 글 전체를 받아
 *   브라우저에서 거른다 — 화면에 보이는 다듬은 제목·부제목으로도 찾을 수 있게 하기 위해서다.
 * - 각 카테고리(앱): 카테고리 글 전체를 한 번 받아 최신순으로 정렬하고
 *   검색·페이지네이션을 브라우저에서 처리한다. M365에서 분리한
 *   Word/PowerPoint/Forms/OneDrive와 Copilot Studio에서 분리한 GitHub/Azure도 이 경로로 처리한다.
 * - 게시글 제목과 부제목은 화면용으로 다듬은 문구(constants/postText.js)를 보여 준다.
 * 왼쪽 내비게이터: 카테고리 → 게시글(최신순) 트리 (DocsShell / DocsNavigator).
 *   홈은 상단 로고, 전체 게시글은 문서 바의 'Blog'와 상단 '블로그' 메뉴로 가므로 뒤로 가기 링크를 두지 않고,
 *   '카테고리' 제목도 화면에 보이지 않게 스크린리더용 그룹 이름으로만 남긴다.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import NotFound from './NotFound';
import DocsShell from '../components/elevate-docs/DocsShell';
import DocsHero from '../components/elevate-docs/DocsHero';
import DocsNavigator from '../components/elevate-docs/DocsNavigator';
import DocsListSection, { DocsCategorySwitcher } from '../components/elevate-docs/DocsList';
import { useCategoryPosts } from '../components/elevate-docs/docsHooks';
import { loadApiCategoryPosts, loadCategoryPosts, sortByPublishedDesc } from '../api/categoryPosts';
import { useApiResource } from '../hooks/useApiResource';
import { getDocsMeta, getTintStyle } from '../components/elevate-docs/docsMeta';
import { listPosts } from '../api/posts';
import {
  POST_LIST_CATEGORIES,
  BASE_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  toDisplayPost,
} from '../constants/categories';
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from '../constants/seo';

const VALID_CATEGORIES = POST_LIST_CATEGORIES;
const PAGE_SIZE = 12;

function categoryLabel(category) {
  return category === 'all' ? '전체' : (CATEGORY_DISPLAY_NAMES[category] || category);
}


function matchesQuery(post, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [post.title, post.serverTitle, post.excerpt, post.serverExcerpt, post.slug]
    .some((value) => String(value || '').toLowerCase().includes(needle));
}

export default function PostList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const _rawPage = parseInt(searchParams.get('page') || '1', 10);
  const pageParam = Number.isFinite(_rawPage) && _rawPage > 0 ? _rawPage : 1;
  const qParam = (searchParams.get('q') || '').trim();

  const isValidCategory = category && VALID_CATEGORIES.includes(category);
  const displayName = isValidCategory ? (CATEGORY_DISPLAY_NAMES[category] || category) : '';
  const { postsMap, errorsMap, ensure: ensurePosts } = useCategoryPosts();

  const loadPosts = useCallback(async (signal) => {
    if (category !== 'all' || qParam) {
      const candidates = category !== 'all'
        ? await loadCategoryPosts(category, { signal })
        : sortByPublishedDesc((await Promise.all(
          BASE_CATEGORIES.map((key) => loadApiCategoryPosts(key, { signal })),
        )).flat());
      const filtered = candidates.filter((post) => matchesQuery(post, qParam));
      return {
        posts: filtered.slice((pageParam - 1) * PAGE_SIZE, pageParam * PAGE_SIZE),
        totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
        totalCount: filtered.length,
      };
    }
    const data = await listPosts({
      limit: PAGE_SIZE,
      page: pageParam,
      categories: BASE_CATEGORIES,
      signal,
    });
    return { posts: data.items.map(toDisplayPost), totalPages: Math.max(1, data.totalPages), totalCount: data.totalCount };
  }, [category, pageParam, qParam]);
  const { data, loading, error, retry } = useApiResource(isValidCategory ? loadPosts : null);
  const { posts = [], totalPages = 1, totalCount = 0 } = data || {};

  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams, { replace: false });
  }, [searchParams, setSearchParams]);

  // 사이드바: 현재 카테고리의 게시글 목록, 본문을 다 불러온 뒤에는 나머지 카테고리 개수도 채운다.
  useEffect(() => {
    if (isValidCategory) ensurePosts(category);
  }, [category, isValidCategory, ensurePosts]);

  useEffect(() => {
    if (!isValidCategory || loading || error) return;
    VALID_CATEGORIES.forEach((key) => ensurePosts(key));
  }, [isValidCategory, loading, error, ensurePosts]);

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage > 1 ? String(newPage) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => updateUrlParams({ q: '', page: '' });

  const navSections = useMemo(() => [{
    id: 'categories',
    ariaLabel: '카테고리',
    nodes: VALID_CATEGORIES.map((key) => {
      const meta = getDocsMeta(key);
      const categoryPosts = postsMap[key];
      return {
        id: `cat:${key}`,
        label: key === 'all' ? '전체 게시글' : categoryLabel(key),
        to: `/${key}`,
        iconSrc: meta.icon || undefined,
        icon: meta.icon ? undefined : LayoutGrid,
        hasChildren: key !== 'all',
        badge: categoryPosts ? categoryPosts.length : undefined,
        defaultExpanded: key === category && key !== 'all',
        onExpand: () => ensurePosts(key),
        error: errorsMap[key],
        onRetry: () => ensurePosts(key),
        children: key === 'all' || !categoryPosts ? undefined : categoryPosts.map((post) => ({
          id: `post:${key}:${post.id}`,
          label: post.title,
          kind: 'toc',
          to: `/${key}/${post.slug}`,
        })),
      };
    }),
  }], [postsMap, errorsMap, category, ensurePosts]);

  const switcherItems = useMemo(() => VALID_CATEGORIES.map((key) => ({
    key,
    label: categoryLabel(key),
    to: `/${key}`,
    icon: getDocsMeta(key).icon,
  })), []);

  if (!isValidCategory) return <NotFound />;

  const meta = getDocsMeta(category);
  const ready = !loading && !error;

  const crumbs = category === 'all' ? [] : [{ label: 'Blog', to: '/all' }, { label: displayName }];

  const heroMeta = [
    ready ? (qParam ? `검색 결과 ${totalCount}개` : `게시글 ${totalCount}개`) : error ? '불러오기 실패' : '불러오는 중',
    category === 'all' ? `카테고리 ${VALID_CATEGORIES.length - 1}개` : '최신순',
  ];

  // 목록 위에는 제목·개수를 두지 않고, 검색 중일 때만 결과 제목과 '검색 지우기'를 보여 준다.
  const listHeading = qParam ? `‘${qParam}’ 검색 결과` : undefined;
  const seoTitle = `${displayName} Posts | Microsoft Elevate`;
  const seoDescription = `${displayName} 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.`;
  const canonicalPath = `/${category}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl(canonicalPath)} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl(canonicalPath)} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <DocsShell
        section="blog"
        tintStyle={getTintStyle(category)}
        search={{
          placeholder: category === 'all' ? '전체 게시글 검색' : `${displayName}에서 검색`,
          value: qParam,
          onSubmit: (q) => updateUrlParams({ q, page: '' }),
        }}
        navigator={(
          <DocsNavigator
            sections={navSections}
            activeId={`cat:${category}`}
          />
        )}
      >
        <DocsHero
          wide
          category={category}
          crumbs={crumbs}
          eyebrow={category === 'all' ? 'Blog' : '카테고리'}
          eyebrowIcon={category !== 'all' ? meta.icon : undefined}
          title={category === 'all' ? '전체 게시글' : displayName}
          abstract={meta.description}
          meta={heroMeta}
        />
        <DocsListSection
          switcher={<DocsCategorySwitcher items={switcherItems} activeKey={category} />}
          heading={listHeading}
          clearLabel="검색 지우기"
          onClear={qParam ? handleClearSearch : undefined}
          loading={loading}
          error={error?.message}
          onRetry={retry}
          posts={posts}
          skeletonCount={PAGE_SIZE}
          showCategory={category === 'all'}
          emptyTitle={qParam ? `‘${qParam}’에 대한 검색 결과가 없습니다.` : '게시글이 없습니다.'}
          emptyHint={qParam ? '다른 검색어로 다시 찾아보세요.' : undefined}
          currentPage={pageParam}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </DocsShell>
    </>
  );
}
