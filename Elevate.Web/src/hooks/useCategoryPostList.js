/**
 * @file useCategoryPostList.js
 * @description 카테고리 게시글 목록 페이지에서 공통으로 사용하는 훅.
 *
 * 지정된 카테고리의 게시글을 최대 100개 불러온 뒤,
 * 태그 필터·검색어 필터·클라이언트 사이드 페이지네이션·URL 파라미터 동기화를 제공한다.
 *
 * ## URL 파라미터 형식
 * - `?q=검색어`       : 제목·요약 포함 검색. URL 저장 시 trim 적용.
 * - `?tags=a,b,c`    : 콤마 구분 복수 태그 선택 (AND 조건, 소문자 정규화).
 * - `?page=N`        : 현재 페이지 번호. 1페이지는 파라미터 생략.
 *
 * ## 태그 매칭 규칙
 * - 태그는 소문자 trim 후 중복 제거한다 (normalizeTag).
 * - 선택된 모든 태그를 포함하는 게시글만 표시한다 (AND 조건).
 */
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listPosts } from '../api/posts';
import { sortByEventDates } from '../utils/eventSorting';

export const POST_LIST_PAGE_SIZE = 20;

const normalizeTag = (tag) => (tag ?? '').toString().trim().toLowerCase();
const normalizeTagList = (list = []) => Array.from(new Set(list.map(normalizeTag).filter(Boolean)));

/**
 * event 카테고리 게시글을 "오늘과 가장 가까운 이벤트 우선" 기준으로 정렬한다.
 *
 * 우선순위:
 *   0. 진행 중 (오늘이 start~end 범위 내) → 시작일 ASC
 *   1. 미래   (start > today)             → 시작일 ASC (가장 빠른 것 먼저)
 *   2. 과거   (end < today)               → 종료일 DESC (가장 최근 지난 것 먼저)
 *   3. eventDates 없음                    → 변경 없음 (기존 순서 유지)
 *
 * @param {Array} posts - event 카테고리 게시글 목록
 * @param {Date}  today - 기준 날짜 (테스트 주입용, 기본값 new Date())
 */
function sortPostsByOwnEventDates(posts, today = new Date()) {
  return sortByEventDates(posts, (post) => post.eventDates, today);
}

/**
 * @param {string} category - 게시글을 불러올 카테고리 슬러그
 * @param {{ sortEventPosts?: boolean }} options - event 카테고리의 post.eventDates 정렬 여부
 * @returns 목록 페이지에 필요한 상태·핸들러
 */
export function useCategoryPostList(category, { sortEventPosts = true } = {}) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리 게시글을 최대 100개 fetch한다.
  // AbortController로 fetch를 취소하고, isActive 가드로 unmount 후 setState를 방지한다.
  // (finally는 AbortError 이후에도 실행되므로 isActive 체크가 필요)
  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listPosts({ category, limit: 100, signal: controller.signal });
        const allItems = (data.items || []).map((p) => ({ ...p, tags: normalizeTagList(p.tags || []) }));
        if (!isActive) return;
        setAllPosts(allItems);
        // 전체 게시글에서 고유 태그 목록을 수집한다.
        const tagSet = new Set();
        allItems.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(normalizeTag(t))));
        setAllTags(Array.from(tagSet));
      } catch (err) {
        if (err.name === 'AbortError' || !isActive) return;
        setError(err.message || '게시글을 불러오지 못했습니다.');
        setAllPosts([]);
        setAllTags([]);
      } finally {
        if (isActive) setLoading(false);
      }
    }
    load();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [category]);

  // 태그 + 검색어 필터 적용: 선택된 태그를 모두 포함하고 검색어가 제목/요약에 포함된 게시글만 표시.
  // event 카테고리는 필터 후 "오늘과 가장 가까운 이벤트 우선" 기준으로 추가 정렬한다.
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
    if (category === 'event' && sortEventPosts) {
      result = sortPostsByOwnEventDates(result);
    }
    return result;
  }, [allPosts, selectedTags, qParamLower, category, sortEventPosts]);

  // URL 파라미터를 일괄 업데이트한다 (빈 값 또는 page=1은 파라미터 삭제).
  // PostList.jsx와 동일하게 page=1일 때 파라미터를 제거해 URL을 간결하게 유지한다.
  const updateUrlParams = useCallback((params) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (!value || (key === 'page' && value === '1')) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
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

  // 클라이언트 사이드 페이지네이션: 필터링된 결과를 POST_LIST_PAGE_SIZE 단위로 slice한다.
  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / POST_LIST_PAGE_SIZE));
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const start = (currentPage - 1) * POST_LIST_PAGE_SIZE;
  const paginatedPosts = filteredPosts.slice(start, start + POST_LIST_PAGE_SIZE);

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
    allPosts,
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
    updateUrlParams,
  };
}
