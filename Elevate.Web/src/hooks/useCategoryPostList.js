/**
 * @file useCategoryPostList.js
 * @description 카테고리 게시글 목록 페이지에서 공통으로 사용하는 훅.
 *
 * 지정된 카테고리의 게시글을 최대 100개 불러온 뒤,
 * 태그 필터·검색어 필터·클라이언트 사이드 페이지네이션·URL 파라미터 동기화를 제공한다.
 */
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listPosts } from '../api/posts';

const PAGE_SIZE = 20;

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

/**
 * @param {string} category - 게시글을 불러올 카테고리 슬러그
 * @returns 목록 페이지에 필요한 상태·핸들러
 */
export function useCategoryPostList(category) {
  const [searchParams, setSearchParams] = useSearchParams();

  const _rawPage = parseInt(searchParams.get('page') || '1', 10);
  const pageParam = Number.isFinite(_rawPage) && _rawPage > 0 ? _rawPage : 1;
  const tagsParam = searchParams.get('tags') || '';
  // URL에 저장된 검색어 (SearchBar value에 전달). trim으로 앞뒤 공백 제거.
  const qParam = (searchParams.get('q') || '').trim();
  const qParamLower = qParam.toLowerCase();

  const selectedTags = useMemo(() => {
    if (!tagsParam) return [];
    return normalizeTagList(tagsParam.split(','));
  }, [tagsParam]);

  const [allPosts, setAllPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 카테고리 게시글을 최대 100개 fetch한다.
  // AbortController로 컴포넌트 unmount 시 진행 중인 fetch를 취소한다.
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listPosts({ category, limit: 100, signal: controller.signal });
        const allItems = (data.items || []).map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) }));
        setAllPosts(allItems);
        // 전체 게시글에서 고유 태그 목록을 수집한다.
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
  }, [category]);

  // 태그 + 검색어 필터 적용: 선택된 태그를 모두 포함하고 검색어가 제목/요약에 포함된 게시글만 표시
  const filteredPosts = useMemo(() => {
    let result = allPosts;
    if (selectedTags.length > 0) {
      result = result.filter((p) => {
        const postTags = p.tags || [];
        return selectedTags.every((t) => postTags.includes(t));
      });
    }
    if (qParamLower) {
      result = result.filter((p) =>
        (p.title || '').toLowerCase().includes(qParamLower) ||
        (p.excerpt || '').toLowerCase().includes(qParamLower)
      );
    }
    return result;
  }, [allPosts, selectedTags, qParamLower]);

  // URL 파라미터를 일괄 업데이트한다 (빈 값은 파라미터 삭제).
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
    const newTags = selectedTags.includes(normalizedTag)
      ? selectedTags.filter((t) => t !== normalizedTag)
      : [...selectedTags, normalizedTag];
    updateUrlParams({ tags: newTags.length > 0 ? newTags.join(',') : '', page: '1' });
  };

  const handleClearAllTags = () => {
    updateUrlParams({ tags: '', page: '1' });
  };

  // 클라이언트 사이드 페이지네이션: 필터링된 결과를 PAGE_SIZE 단위로 slice한다.
  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedPosts = filteredPosts.slice(start, start + PAGE_SIZE);

  const handlePageChange = (p) => {
    updateUrlParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 검색어 제출 시 trim하여 URL에 불필요한 공백이 남지 않도록 한다.
  const handleSearchSubmit = (q) => {
    updateUrlParams({ page: '1', q: q.trim() });
  };

  return {
    qParam,
    qParamLower,
    allTags,
    selectedTags,
    loading,
    error,
    filteredPosts,
    paginatedPosts,
    currentPage,
    totalPages,
    handleTagToggle,
    handleClearAllTags,
    handlePageChange,
    handleSearchSubmit,
  };
}
