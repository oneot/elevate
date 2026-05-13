/**
 * @file Microsoft365Update.jsx
 * @description Microsoft 365 업데이트 소식 목록 페이지.
 *
 * `update` 카테고리의 게시글을 최대 100개 한 번에 불러온 뒤,
 * 클라이언트 사이드에서 태그 필터링과 페이지네이션을 수행한다.
 * (서버 측 태그 AND 필터링이 지원되지 않아 클라이언트에서 처리)
 *
 * 태그 필터는 URL의 `?tags=tag1,tag2` 형식으로 복수 선택이 가능하며
 * AND 조건으로 동작한다 (선택된 모든 태그를 포함하는 게시글만 표시).
 */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import Footer from '../components/layout/Footer';
import { listPosts } from '../api/posts';

const CATEGORY = 'update';
const DISPLAY_NAME = '업데이트 소식';
const PAGE_SIZE = 20;

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

export default function Microsoft365Update() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _rawPage = parseInt(searchParams.get('page') || '1', 10);
  const pageParam = Number.isFinite(_rawPage) && _rawPage > 0 ? _rawPage : 1;
  const tagsParam = searchParams.get('tags') || '';
  const qParam = (searchParams.get('q') || '').trim().toLowerCase();
  const selectedTags = useMemo(() => {
    if (!tagsParam) return [];
    return normalizeTagList(tagsParam.split(','));
  }, [tagsParam]);

  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listPosts({ category: CATEGORY, limit: 100, signal: controller.signal });
        const allItems = (data.items || []).map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) }));
        setAllPosts(allItems);
        const tagSet = new Set();
        allItems.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(normalizeTag(t))));
        setAllTags(Array.from(tagSet));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || '게시글을 불러오지 못했습니다.');
        setAllPosts([]);
        setAllTags([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // 태그 + 검색어 필터 적용: 선택된 태그를 모두 포함하고 검색어가 제목/요약에 포함된 게시글만 표시
  const filteredPosts = useMemo(() => {
    let result = allPosts;
    if (selectedTags.length > 0) {
      result = result.filter((p) => {
        const postTags = p.tags || [];
        return selectedTags.every((t) => postTags.includes(t));
      });
    }
    if (qParam) {
      result = result.filter((p) =>
        (p.title || '').toLowerCase().includes(qParam) ||
        (p.excerpt || '').toLowerCase().includes(qParam)
      );
    }
    return result;
  }, [allPosts, selectedTags, qParam]);

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

  // 클라이언트 사이드 페이지네이션: 필터링된 결과를 PAGE_SIZE 단위로 slice한다.
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
    <>
      <PostListLayout
        title={
          <>
            <Logo isBlog={true} />
            <p className="text-slate-400">|</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">{DISPLAY_NAME}</h1>
          </>
        }
        searchBar={
          <SearchBar placeholder={`Search ${DISPLAY_NAME}`} value={qParam} onSubmit={(q) => { updateUrlParams({ page: '1', q }); }} />
        }
        tagFilterProps={{
          allTags,
          selectedTags,
          onTagToggle: handleTagToggle,
          onClearAll: handleClearAllTags,
        }}
        posts={posts}
        loading={loading}
        error={error}
        countLabel={!loading && selectedTags.length > 0 ? `${filteredPosts.length}개의 게시글이 일치합니다.` : undefined}
        activeQuery={qParam}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Footer />
    </>
  );
}
