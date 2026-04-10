import React, { useEffect, useState, useMemo } from 'react';
import TagFilter from '../components/TagFilter';
import PostGrid from '../components/PostGrid';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;
const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

export default function UpdateList() {
  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        // update 폴더 내 게시글만 가져오는 API 또는 posts.json이 필요하다면 경로 수정
        const res = await fetch('/api/posts.json', { signal: controller.signal });
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        // update 카테고리만 필터링
        const updatePosts = (data.items || []).filter((p) => (p.category || '').toLowerCase() === 'update');
        setAllPosts(updatePosts.map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) })));
        // update 게시글에서만 태그 추출
        const tagSet = new Set();
        updatePosts.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(normalizeTag(t))));
        setAllTags(Array.from(tagSet));
      } catch (err) {
        setAllPosts([]);
        setAllTags([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // 태그 필터링 (AND 조건)
  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return allPosts;
    return allPosts.filter((p) => {
      const postTags = p.tags || [];
      return selectedTags.every((t) => postTags.includes(t));
    });
  }, [allPosts, selectedTags]);

  // 페이지네이션
  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = filteredPosts.slice(start, start + PAGE_SIZE);

  const handleTagToggle = (tag) => {
    const normalizedTag = normalizeTag(tag);
    setCurrentPage(1);
    setSelectedTags((prev) =>
      prev.includes(normalizedTag)
        ? prev.filter((t) => t !== normalizedTag)
        : [...prev, normalizedTag]
    );
  };
  const handleClearAllTags = () => {
    setSelectedTags([]);
    setCurrentPage(1);
  };
  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      <main className="w-full px-4 sm:px-6 lg:px-12 py-8">
        <header className="mb-10 flex flex-col gap-5">
          <h1 className="text-2xl sm:text-3xl font-bold">Update Posts</h1>
        </header>
        <div className="flex flex-col lg:grid gap-6 lg:grid-cols-10">
          <aside className="w-full lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
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
    </div>
  );
}
