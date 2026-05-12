import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import NotFound from './NotFound';
import PostGrid from '../components/posts/PostGrid';
import Pagination from '../components/posts/Pagination';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import TagFilter from '../components/posts/TagFilter';
import Footer from '../components/layout/Footer';
import { listPosts } from '../api/posts';

const CATEGORY = 'update';
const DISPLAY_NAME = '업데이트 소식';
const PAGE_SIZE = 20;

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

export default function Microsoft365Update() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const tagsParam = searchParams.get('tags') || '';
  const selectedTags = useMemo(() => {
    if (!tagsParam) return [];
    return normalizeTagList(tagsParam.split(','));
  }, [tagsParam]);

  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listPosts({ category: CATEGORY, limit: 100 });
        const allItems = (data.items || []).map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) }));
        setAllPosts(allItems);
        const tagSet = new Set();
        allItems.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(normalizeTag(t))));
        setAllTags(Array.from(tagSet));
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

  // URL 파라미터 업데이트
  const updateUrlParams = useCallback((params) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

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

  // 페이지네이션
  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = filteredPosts.slice(start, start + PAGE_SIZE);

  const handlePageChange = (p) => {
    updateUrlParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="flex flex-col lg:grid lg:grid-cols-10 gap-6 items-stretch">
          <aside className="w-full lg:col-span-2 lg:sticky lg:top-4 self-stretch flex flex-col">
            <TagFilter
              allTags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllTags}
            />
          </aside>
          <section className="w-full lg:col-span-8">
            {loading && <div className="text-center py-8">로딩 중...</div>}
            <div className="mb-4 text-sm text-slate-600 min-h-6 flex items-center">
              {!loading && selectedTags.length > 0 && (
                <span>{filteredPosts.length}개의 게시글이 일치합니다.</span>
              )}
            </div>
            <PostGrid posts={posts} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
