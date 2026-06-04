/**
 * @file Microsoft365Update.jsx
 * @description Microsoft 365 업데이트 소식 목록 페이지.
 *
 * `update` 카테고리의 게시글을 최대 100개 불러온 뒤 클라이언트 사이드에서
 * 태그 필터링과 페이지네이션을 수행한다. 공통 로직은 useCategoryPostList 훅에서 처리한다.
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import Footer from '../components/layout/Footer';
import { POST_LIST_PAGE_SIZE, useCategoryPostList } from '../hooks/useCategoryPostList';
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from '../constants/seo';

const CATEGORY = 'update';
const DISPLAY_NAME = '업데이트 소식';
const PAGE_TITLE = 'AI & M365 최신 정보 | Microsoft Elevate';
const PAGE_DESCRIPTION = 'Microsoft AI와 Microsoft 365 제품 업데이트, 교육 현장 활용 소식을 확인하세요.';

export default function Microsoft365Update() {
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
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={canonicalUrl('/update')} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl('/update')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
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
        skeletonCount={POST_LIST_PAGE_SIZE}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Footer />
    </>
  );
}
