/**
 * @file ProgramNews.jsx
 * @description Microsoft Elevate 행사 소식 목록 페이지.
 *
 * `program-news` 카테고리의 게시글을 최대 100개 불러온 뒤 클라이언트 사이드에서
 * 태그 필터링과 페이지네이션을 수행한다. 공통 로직은 useCategoryPostList 훅에서 처리한다.
 *
 * /all 페이지에는 program-news 게시글이 노출되지 않는다.
 * (BASE_CATEGORIES / POST_LIST_CATEGORIES에 포함되지 않음)
 */
import React from 'react';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import Footer from '../components/layout/Footer';
import { useCategoryPostList } from '../hooks/useCategoryPostList';

const CATEGORY = 'program-news';
const DISPLAY_NAME = '행사 소식';

export default function ProgramNews() {
  const {
    qParam,
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
  } = useCategoryPostList(CATEGORY);

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
          <SearchBar placeholder={`Search ${DISPLAY_NAME}`} value={qParam} onSubmit={handleSearchSubmit} />
        }
        tagFilterProps={{
          allTags,
          selectedTags,
          onTagToggle: handleTagToggle,
          onClearAll: handleClearAllTags,
        }}
        posts={paginatedPosts}
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
