import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import NotFound from './NotFound';
import PostGrid from '../components/PostGrid';
import SearchBar from '../components/SearchBar';
import Logo from '../components/Logo';
import TagFilter from '../components/TagFilter';
import SeriesNavigator from '../components/SeriesNavigator';
import Pagination from '../components/Pagination';
import { listPosts, listTags, listSeriesByCategory, listSeriesPosts } from '../lib/postsApi';

const DISPLAY_NAMES = {
  all: 'ALL',
  m365: 'M365',
  copilot: 'Copilot',
  teams: 'Teams',
  minecraft: 'Minecraft',
  excel: 'Excel',
  onenote: 'OneNote',
  mee: 'MEE',
};

const BASE_CATEGORIES = ['m365', 'copilot', 'teams', 'minecraft', 'excel', 'onenote'];

const VALID_CATEGORIES = Object.keys(DISPLAY_NAMES);
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
  const displayName = isValidCategory ? (DISPLAY_NAMES[category] || category) : '';

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

  return (
    <div className="relative min-h-screen">
      <div className="pastel-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-12 py-8">
        <header className="mb-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Logo isBlog={true}/>
              <p className="text-slate-400">|</p>
              <h1 className="text-2xl sm:text-3xl font-bold">{displayName} Posts</h1>
            </div>
            <div className="w-full sm:w-80">
              <SearchBar placeholder={`Search ${displayName}`} onSubmit={(q) => { updateUrlParams({ q }); }} />
            </div>
          </div>
          <nav>
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
                    {DISPLAY_NAMES[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className={`flex flex-col lg:grid gap-6 ${hasSeriesSidebar ? 'lg:grid-cols-12' : 'lg:grid-cols-10'}`}>
          <aside className="w-full lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
            <TagFilter
              allTags={allTags}
              selectedTags={tagParam ? [tagParam] : []}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllTags}
            />
          </aside>

          <section className={`w-full ${hasSeriesSidebar ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8'}`}>
            {loading && <div className="text-center py-8">로딩 중...</div>}
            <div className="mb-4 text-sm text-slate-600 min-h-6 flex items-center">
              {!loading && totalCount > 0 && (
                <span>
                  {seriesParam
                    ? `${totalCount}개의 게시글`
                    : `총 ${totalCount}개 · ${pageParam} / ${totalPages} 페이지`}
                </span>
              )}
            </div>
            <PostGrid posts={posts} />
            {!seriesParam && (
              <Pagination
                currentPage={pageParam}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>

          {hasSeriesSidebar && (
            <aside className="w-full lg:col-span-3 xl:col-span-2 hidden lg:block lg:sticky lg:top-4 lg:self-start">
              <SeriesNavigator
                seriesOptions={seriesOptions}
                selectedSeries={selectedSeriesKey}
                onSeriesChange={handleSeriesChange}
                category={category}
                currentPostId={null}
                showAllOption={true}
                sticky={false}
              />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
