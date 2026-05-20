/**
 * @file ProgramNews.jsx
 * @description Microsoft Elevate 행사 및 프로그램 소식 목록 페이지.
 *
 * "행사 소식(event)"과 "프로그램 소식(program-news)" 두 탭으로 구성되며,
 * 현재 탭은 URL의 ?tab 파라미터로 관리된다 (?tab=event / ?tab=program).
 * 기본 탭은 행사 소식이다.
 *
 * - 탭 전환 시 q/tags/page 파라미터를 초기화해 이전 탭 상태가 잔류하지 않도록 한다.
 * - NewsTabContent에 key={activeTab}을 부여해 탭 전환 시 강제 remount하여 훅 상태를 초기화한다.
 *
 * /all 페이지에는 program-news 게시글이 노출되지 않는다.
 * (BASE_CATEGORIES / POST_LIST_CATEGORIES에 포함되지 않음)
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PostListLayout from '../components/posts/PostListLayout';
import SearchBar from '../components/posts/SearchBar';
import Logo from '../components/common/Logo';
import Footer from '../components/layout/Footer';
import { useCategoryPostList } from '../hooks/useCategoryPostList';

// 탭 설정: key는 URL의 tab 파라미터 값, category는 API 카테고리 슬러그
const TABS = [
  { key: 'event', label: '행사 소식', category: 'event' },
  { key: 'program', label: '프로그램 소식', category: 'program-news' },
];

const PAGE_TITLE = '행사 및 프로그램 소식';

/**
 * 탭 하나의 콘텐츠 (게시글 목록 + 검색 + 태그 필터).
 * key={activeTab}으로 강제 remount되므로 탭 전환 시 훅 상태가 완전히 초기화된다.
 *
 * @param {{ category: string, displayName: string, activeTab: string, onTabChange: (key: string) => void }} props
 */
function NewsTabContent({ category, displayName, activeTab, onTabChange }) {
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
  } = useCategoryPostList(category);

  // PostListLayout의 navTabs에 전달할 탭 버튼 UI
  const navTabs = (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
            ${activeTab === tab.key
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <PostListLayout
      title={
        <>
          <Logo isBlog={true} />
          <p className="text-slate-400">|</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{PAGE_TITLE}</h1>
        </>
      }
      searchBar={
        <SearchBar placeholder={`Search ${displayName}`} value={qParam} onSubmit={handleSearchSubmit} />
      }
      navTabs={navTabs}
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
  );
}

/**
 * 최상위 컴포넌트. URL의 ?tab 파라미터를 읽어 현재 탭을 결정하고,
 * 탭 전환 시 q/tags/page를 초기화한다.
 */
export default function ProgramNews() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ?tab 값이 없거나 유효하지 않으면 첫 번째 탭(event)으로 기본값 설정
  const tabParam = searchParams.get('tab');
  const activeTab = TABS.find((t) => t.key === tabParam)?.key ?? TABS[0].key;
  const activeTabConfig = TABS.find((t) => t.key === activeTab);

  /**
   * 탭 전환 핸들러.
   * tab 파라미터만 남기고 q/tags/page를 제거해 이전 탭의 필터 상태가 잔류하지 않도록 한다.
   */
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setSearchParams({ tab: newTab }, { replace: false });
  };

  return (
    <>
      {/* key={activeTab}: 탭 전환 시 컴포넌트를 강제 remount해 훅 상태(q/tags/page)를 초기화한다 */}
      <NewsTabContent
        key={activeTab}
        category={activeTabConfig.category}
        displayName={activeTabConfig.label}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <Footer />
    </>
  );
}
