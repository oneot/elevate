import React, { useEffect, useState, useMemo } from 'react';
import NotFound from '../pages/NotFound';
import PostGrid from './PostGrid';
import Pagination from './Pagination';
import SearchBar from './SearchBar';
import Logo from './Logo';
import SeriesNavigator from './SeriesNavigator';
import TagFilter from './TagFilter';
import Footer from './Footer';

const CATEGORY = 'update';
const DISPLAY_NAME = '업데이트 소식';
const PAGE_SIZE = 20;

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

export default function Microsoft365Update() {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const seriesParam = (searchParams.get('series') || '').trim();
  const tagsParam = searchParams.get('tags') || '';
  const selectedTags = useMemo(() => {
    if (!tagsParam) return [];
    return normalizeTagList(tagsParam.split(','));
  }, [tagsParam]);

  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [seriesByCategory, setSeriesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/posts.json', { signal: controller.signal });
        if (!res.ok) throw new Error(`Server error ${res.status} ${res.statusText}`);
        const data = await res.json();
        const allItems = data.items || [];
        const normalizedItems = allItems.map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) }));
        // update 카테고리만 필터링
        const updatePosts = normalizedItems.filter((p) => p.category === CATEGORY);
        setAllPosts(updatePosts);
        // update 게시글에서만 태그 추출
        const tagSet = new Set();
        updatePosts.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(normalizeTag(t))));
        setAllTags(Array.from(tagSet));
        setSeriesByCategory(data.seriesByCategory || {});
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load posts');
        setAllPosts([]);
        setAllTags([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // 태그 필터 적용 (AND 조건)
  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return allPosts;
    return allPosts.filter((p) => {
      const postTags = p.tags || [];
      return selectedTags.every((t) => postTags.includes(t));
    });
  }, [allPosts, selectedTags]);
  // 태그 필터 핸들러
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
      page: '1',
    });
  };
  const handleClearAllTags = () => {
    updateUrlParams({ tags: '', page: '1' });
  };

  // 시리즈 필터
  const availableSeriesData = useMemo(() => {
    const categorySeries = seriesByCategory[CATEGORY];
    if (!categorySeries || Object.keys(categorySeries).length === 0) return null;
    const seriesCounts = {};
    filteredPosts.forEach((post) => {
      if (post.series && categorySeries[post.series]) {
        seriesCounts[post.series] = (seriesCounts[post.series] || 0) + 1;
      }
    });
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
  }, [seriesByCategory, filteredPosts]);

  const selectedSeriesData = useMemo(() => {
    if (!availableSeriesData || availableSeriesData.length === 0) return null;
    if (!seriesParam) return null;
    return availableSeriesData.find((item) => item.key === seriesParam) || null;
  }, [availableSeriesData, seriesParam]);

  const hasSeriesSidebar = Boolean(availableSeriesData && availableSeriesData.length > 0);

  const seriesFilteredPosts = useMemo(() => {
    if (!selectedSeriesData) return filteredPosts;
    const seriesPostIds = new Set(selectedSeriesData.posts.map((p) => p.id));
    return filteredPosts.filter((p) => seriesPostIds.has(p.id));
  }, [filteredPosts, selectedSeriesData]);

  // 페이지네이션
  const total = seriesFilteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = seriesFilteredPosts.slice(start, start + PAGE_SIZE);

  // URL 파라미터 업데이트
  const updateUrlParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams}`);
  };

  const handlePageChange = (p) => {
    updateUrlParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const handleSeriesChange = (seriesKey) => {
    updateUrlParams({ series: seriesKey || '' });
  };

  return (
    <div className="relative min-h-screen">
      <div className="pastel-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <main className="w-full px-4 sm:px-6 lg:px-12 py-8">
        <header className="mb-10 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Logo isBlog={true}/>
            <p className="text-slate-400">|</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">{DISPLAY_NAME}</h1>
          </div>
          <div className="w-full sm:w-80 mt-2"><SearchBar placeholder={`Search ${DISPLAY_NAME}`} onSubmit={(q) => { updateUrlParams({ page: '1', q }); }} /></div>
        </header>
        <div className={`flex flex-col lg:grid gap-6 items-stretch ${hasSeriesSidebar ? 'lg:grid-cols-12' : 'lg:grid-cols-10'}`}>
          <aside className="w-full lg:col-span-2 lg:sticky lg:top-4 self-stretch flex flex-col">
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
                category={CATEGORY}
                currentPostId={null}
                showAllOption={true}
                sticky={false}
              />
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
