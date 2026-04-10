import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import NotFound from './NotFound';
import PostGrid from '../components/PostGrid';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Logo from '../components/Logo';
import TagFilter from '../components/TagFilter';
import SeriesNavigator from '../components/SeriesNavigator';

const DISPLAY_NAMES = {
  all: 'ALL',
  m365: 'M365',
  copilot: 'Copilot',
  teams: 'Teams',
  minecraft: 'Minecraft',
  excel: 'Excel',
  onenote: 'OneNote',
};

const VALID_CATEGORIES = Object.keys(DISPLAY_NAMES);

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

export default function PostList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const seriesParam = (searchParams.get('series') || '').trim();
  // 4x5 슬롯(20개) 고정 레이아웃을 유지하기 위한 페이지 크기
  const PAGE_SIZE = 20;

  // Parse selected tags from URL query param
  const tagsParam = searchParams.get('tags') || '';
  const selectedTags = useMemo(() => {
    if (!tagsParam) return [];
    return normalizeTagList(tagsParam.split(','));
  }, [tagsParam]);

  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [seriesByCategory, setSeriesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  // intentionally not exposing error to UI; keep only for console/logging
  const [_error, setError] = useState(null);

  const isValidCategory = category && VALID_CATEGORIES.includes(category);
  const displayName = isValidCategory ? (DISPLAY_NAMES[category] || category) : '';

  useEffect(() => {
    if (!isValidCategory) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch static posts.json
        const res = await fetch('/api/posts.json', { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Server error ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const allItems = data.items || [];
        const normalizedAllTags = normalizeTagList(data.allTags || []);
        const normalizedItems = allItems.map((p) => ({
          ...p,
          tags: normalizeTagList(p.tags || []),
        }));
        setAllTags(normalizedAllTags);
        setSeriesByCategory(data.seriesByCategory || {});

        // Client-side filtering by category
        let filtered;
        if ((category || '').toLowerCase() === 'all') {
          // m365update 카테고리 글 제외 (대소문자 무관)
          filtered = normalizedItems.filter((p) => (p.category || '').toLowerCase() !== 'm365update');
        } else {
          filtered = normalizedItems.filter((p) => (p.category || '').toLowerCase() === (category || '').toLowerCase());
        }
        setAllPosts(filtered);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load posts');
        console.warn('PostList fetch error:', err.message || err);
        setAllPosts([]);
        setAllTags([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [category, isValidCategory]);

  // Filter posts by selected tags (AND condition)
  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return allPosts;
    return allPosts.filter((p) => {
      const postTags = p.tags || [];
      return selectedTags.every((t) => postTags.includes(t));
    });
  }, [allPosts, selectedTags]);

  // Build available series options for sidebar (category scoped)
  const availableSeriesData = useMemo(() => {
    if (!category || category === 'all') return null;
    const categorySeries = seriesByCategory[category];
    if (!categorySeries || Object.keys(categorySeries).length === 0) return null;

    // Count series occurrences in filtered posts
    const seriesCounts = {};
    filteredPosts.forEach((post) => {
      if (post.series && categorySeries[post.series]) {
        seriesCounts[post.series] = (seriesCounts[post.series] || 0) + 1;
      }
    });

    // Keep only series that can be displayed in the sidebar
    const seriesNames = Object.keys(seriesCounts);
    if (seriesNames.length === 0) return null;

    const seriesList = seriesNames
      .map((name) => ({
        key: name,
        title: name,
        count: seriesCounts[name] || 0,
        posts: categorySeries[name] || [],
      }))
      .filter((item) => item.posts.length >= 2)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.title.localeCompare(b.title);
      });

    return seriesList.length > 0 ? seriesList : null;
  }, [category, seriesByCategory, filteredPosts]);

  // seriesParam이 유효한 시리즈 key이면 해당 시리즈를, 없거나 유효하지 않으면 null(= 전체보기)
  const selectedSeriesData = useMemo(() => {
    if (!availableSeriesData || availableSeriesData.length === 0) return null;
    if (!seriesParam) return null;
    return availableSeriesData.find((item) => item.key === seriesParam) || null;
  }, [availableSeriesData, seriesParam]);

  const hasSeriesSidebar = Boolean(availableSeriesData && availableSeriesData.length > 0);

  // 시리즈 필터: 선택된 시리즈가 있으면 해당 시리즈 게시글만, 없으면(전체보기) 전체
  const seriesFilteredPosts = useMemo(() => {
    if (!selectedSeriesData) return filteredPosts;
    const seriesPostIds = new Set(selectedSeriesData.posts.map((p) => p.id));
    return filteredPosts.filter((p) => seriesPostIds.has(p.id));
  }, [filteredPosts, selectedSeriesData]);

  // Paginate series-filtered posts
  const total = seriesFilteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = seriesFilteredPosts.slice(start, start + PAGE_SIZE);

  const updateUrlParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: false });
  };

  useEffect(() => {
    if (!isValidCategory) return;

    // all 카테고리 또는 시리즈 데이터가 없으면 series 쿼리 제거
    if (category === 'all' || !availableSeriesData || availableSeriesData.length === 0) {
      if (seriesParam) updateUrlParams({ series: '' });
      return;
    }

    // seriesParam이 있지만 유효하지 않은 값이면 제거 (전체보기로 복귀)
    if (seriesParam && !availableSeriesData.some((item) => item.key === seriesParam)) {
      updateUrlParams({ series: '' });
    }
  }, [isValidCategory, category, seriesParam, availableSeriesData]);

  const handlePageChange = (p) => {
    updateUrlParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagToggle = (tag) => {
    const normalizedTag = normalizeTag(tag);
    let newTags;
    if (selectedTags.includes(normalizedTag)) {
      newTags = selectedTags.filter((t) => t !== normalizedTag);
    } else {
      newTags = [...selectedTags, normalizedTag];
    }
    updateUrlParams({ 
      tags: newTags.length > 0 ? newTags.join(',') : '',
      page: '1' // Reset to first page when filtering
    });
  };

  const handleClearAllTags = () => {
    updateUrlParams({ tags: '', page: '1' });
  };

  const handleSeriesChange = (seriesKey) => {
    updateUrlParams({ series: seriesKey || '' });
  };

  // Early return for invalid category - placed after all hooks
  if (!isValidCategory) {
    return <NotFound />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Blobs (same as Home) */}
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
          <div className="w-full sm:w-80"><SearchBar placeholder={`Search ${displayName}`} onSubmit={(q) => { updateUrlParams({ page: '1', q }); }} /></div>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-2">
            {VALID_CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={`/${c}`} className={`inline-block px-3.5 py-2 rounded-full border text-sm sm:text-base transition-all duration-200 ${c === category ? 'bg-ms-blue text-white border-ms-blue shadow-[0_10px_24px_-12px_rgba(0,120,212,0.95)]' : 'bg-white/85 backdrop-blur border-white/70 text-slate-700 hover:border-ms-blue/35 hover:text-ms-blue'}`}>
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
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </aside>

        <section className={`w-full ${hasSeriesSidebar ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8'}`}>
          {loading && <div className="text-center py-8">로딩 중...</div>}
          <div className="mb-4 text-sm text-slate-600 min-h-6 flex items-center">
            {!loading && (selectedTags.length > 0 || selectedSeriesData) && (
              <span>{seriesFilteredPosts.length}개의 게시글이 일치합니다.</span>
            )}
          </div>
          <PostGrid posts={posts} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>

        {hasSeriesSidebar && (
          <aside className="w-full lg:col-span-3 xl:col-span-2 hidden lg:block lg:sticky lg:top-4 lg:self-start">
            <SeriesNavigator
              seriesOptions={availableSeriesData || []}
              selectedSeries={selectedSeriesData?.key || ''}
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
