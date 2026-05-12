import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import NotFound from './NotFound';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import { listPosts, listTags, listSeriesByCategory, listSeriesPosts } from '../api/posts';
import { POST_LIST_CATEGORIES, BASE_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '../constants/categories';

const VALID_CATEGORIES = POST_LIST_CATEGORIES;
const PAGE_SIZE = 20;

export default function PostList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = (searchParams.get('tag') || '').trim().toLowerCase();
  const seriesParam = (searchParams.get('series') || '').trim();
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);

  const isValidCategory = category && VALID_CATEGORIES.includes(category);
  const displayName = isValidCategory ? (CATEGORY_DISPLAY_NAMES[category] || category) : '';

  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams, { replace: false });
  }, [searchParams, setSearchParams]);

  // 게시글 로드: 시리즈 선택 시 시리즈 API, 아니면 페이지 API
  useEffect(() => {
    if (!isValidCategory) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (seriesParam) {
          // 시리즈 선택: 서버에서 해당 시리즈 전체 게시글 조회
          const data = await listSeriesPosts(seriesParam);
          if (!cancelled) {
            setPosts(data.items || []);
            setTotalPages(1);
            setTotalCount(data.items?.length || 0);
          }
        } else {
          const data = await listPosts({
            limit: PAGE_SIZE,
            page: pageParam,
            category: category !== 'all' ? category : undefined,
            categories: category === 'all' ? BASE_CATEGORIES : undefined,
            tag: tagParam || undefined,
          });
          if (!cancelled) {
            setPosts(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('PostList fetch error:', err.message || err);
          setPosts([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [category, tagParam, seriesParam, pageParam, isValidCategory]);

  // 태그 목록 로드
  useEffect(() => {
    if (!isValidCategory) return;
    const categoriesForTags = category === 'all' ? BASE_CATEGORIES : [category];
    listTags({ categories: categoriesForTags })
      .then((data) => setAllTags(data?.items || []))
      .catch(() => setAllTags([]));
  }, [isValidCategory, category]);

  // 카테고리별 시리즈 목록 로드
  useEffect(() => {
    if (!isValidCategory || category === 'all') {
      setSeriesOptions([]);
      return;
    }
    listSeriesByCategory(category)
      .then((data) => {
        const options = (data?.items || []).map((s) => ({
          key: s.name,
          title: s.name,
          posts: s.posts || [],
        }));
        setSeriesOptions(options);
      })
      .catch(() => setSeriesOptions([]));
  }, [category, isValidCategory]);

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage > 1 ? String(newPage) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagToggle = (tag) => {
    const normalized = tag.trim().toLowerCase();
    updateUrlParams({ tag: tagParam === normalized ? '' : normalized, page: '' });
  };

  const handleClearAllTags = () => updateUrlParams({ tag: '', page: '' });

  const handleSeriesChange = (seriesKey) => {
    updateUrlParams({ series: seriesKey || '', page: '' });
  };

  const hasSeriesSidebar = seriesOptions.length > 0;
  const selectedSeriesKey = seriesOptions.find((s) => s.key === seriesParam)?.key || '';

  if (!isValidCategory) return <NotFound />;

  const countLabel = !loading && totalCount > 0
    ? (seriesParam
        ? `${totalCount}개의 게시글`
        : `총 ${totalCount}개 · ${pageParam} / ${totalPages} 페이지`)
    : undefined;

  return (
    <PostListLayout
      title={
        <>
          <Logo isBlog={true} />
          <p className="text-slate-400">|</p>
          <h1 className="text-2xl sm:text-3xl font-bold">{displayName} Posts</h1>
        </>
      }
      searchBar={
        <SearchBar placeholder={`Search ${displayName}`} onSubmit={(q) => { updateUrlParams({ q }); }} />
      }
      navTabs={
        <ul className="flex flex-wrap gap-2">
          {VALID_CATEGORIES.map((c) => (
            <li key={c}>
              <Link
                to={`/${c}`}
                className={`inline-block px-3.5 py-2 rounded-full border text-sm sm:text-base transition-all duration-200 ${
                  c === category
                    ? 'bg-ms-blue text-white border-ms-blue shadow-[0_10px_24px_-12px_rgba(0,120,212,0.95)]'
                    : 'bg-white/85 backdrop-blur border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue'
                }`}
              >
                {CATEGORY_DISPLAY_NAMES[c]}
              </Link>
            </li>
          ))}
        </ul>
      }
      tagFilterProps={{
        allTags,
        selectedTags: tagParam ? [tagParam] : [],
        onTagToggle: handleTagToggle,
        onClearAll: handleClearAllTags,
      }}
      posts={posts}
      loading={loading}
      countLabel={countLabel}
      currentPage={seriesParam ? 1 : pageParam}
      totalPages={seriesParam ? 1 : totalPages}
      onPageChange={seriesParam ? undefined : handlePageChange}
      seriesNavigatorProps={hasSeriesSidebar ? {
        seriesOptions,
        selectedSeries: selectedSeriesKey,
        onSeriesChange: handleSeriesChange,
        category,
        currentPostId: null,
        showAllOption: true,
        sticky: false,
      } : undefined}
    />
  );
}
