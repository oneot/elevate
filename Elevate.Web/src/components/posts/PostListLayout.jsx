import React from 'react';
import PostGrid from './PostGrid';
import Pagination from './Pagination';
import TagFilter from './TagFilter';
import SeriesNavigator from './SeriesNavigator';

const PostListLayout = ({
  title,
  searchBar,
  navTabs,
  tagFilterProps,
  posts,
  loading,
  error,
  countLabel,
  currentPage,
  totalPages,
  onPageChange,
  seriesNavigatorProps,
  activeQuery,
  calendarSlot,
  listHeading,
}) => {
  const hasSeriesSidebar = Boolean(seriesNavigatorProps);

  return (
    <div className="relative min-h-screen">
      <div className="pastel-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-12 py-8">
        <header className="mb-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {title}
            </div>
            {searchBar && <div className="w-full sm:w-80">{searchBar}</div>}
          </div>
          {navTabs && <nav>{navTabs}</nav>}
        </header>

        {calendarSlot && (
          <div className="w-full mb-6">
            {calendarSlot}
          </div>
        )}

        {listHeading && (
          <h2 className="text-xl font-bold text-slate-800 mb-4">{listHeading}</h2>
        )}

        <div className={`flex flex-col lg:grid gap-6 ${hasSeriesSidebar ? 'lg:grid-cols-12' : 'lg:grid-cols-10'}`}>
          <aside className="w-full lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
            {/* 게시글 카운트 라벨 높이만큼 상단 정렬 */}
            <div className="mb-4 min-h-6 hidden lg:block" aria-hidden="true" />
            <TagFilter {...tagFilterProps} />
          </aside>

          <section className={`w-full ${hasSeriesSidebar ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8'}`}>
            {loading && <div className="text-center py-8">로딩 중...</div>}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="text-4xl">⚠️</span>
                <p className="text-slate-600 text-sm">게시글을 불러오지 못했습니다.</p>
                <p className="text-slate-400 text-xs">{error}</p>
              </div>
            )}
            <div className="mb-4 text-sm text-slate-600 min-h-6 flex items-center">
              {!loading && countLabel && <span>{countLabel}</span>}
            </div>
            {!loading && !error && (
              <PostGrid posts={posts} activeQuery={activeQuery} />
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </section>

          {hasSeriesSidebar && (
            <aside className="w-full lg:col-span-3 xl:col-span-2 hidden lg:block lg:sticky lg:top-4 lg:self-start">
              <SeriesNavigator {...seriesNavigatorProps} />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default PostListLayout;
