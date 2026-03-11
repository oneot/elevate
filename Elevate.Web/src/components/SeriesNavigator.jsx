import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * SeriesNavigator 컴포넌트
 * 게시글 리스트 화면에서 카테고리 내 시리즈를 선택하고
 * 선택한 시리즈의 게시글 순서를 표시하는 우측 사이드바
 * 
 * @param {Object} props
 * @param {Array} props.seriesOptions - 선택 가능한 시리즈 배열
 * @param {string} props.selectedSeries - 현재 선택된 시리즈 key
 * @param {Function} props.onSeriesChange - 시리즈 변경 콜백
 * @param {string} props.category - 카테고리 이름 (링크 생성용)
 * @param {string} props.currentPostId - 현재 보고 있는 게시글 ID (optional, active 상태 표시용)
 */
export default function SeriesNavigator({
  seriesOptions = [],
  selectedSeries = '',
  onSeriesChange = () => {},
  category = '',
  currentPostId = null,
  buildPostHref = null,
  previousPost = null,
  nextPost = null,
  backToListHref = '',
  sticky = true,
  showAllOption = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!seriesOptions || seriesOptions.length === 0) {
    return null;
  }

  // showAllOption이 자동으로 전체보기 sentinel 항목을 상단에 삽입
  const effectiveOptions = showAllOption
    ? [{ key: '', title: '전체보기', posts: [] }, ...seriesOptions]
    : seriesOptions;

  const currentSeries = effectiveOptions.find((item) => item.key === selectedSeries)
    || (showAllOption ? effectiveOptions[0] : seriesOptions[0]);
  const isShowAll = currentSeries?.key === '';
  const seriesPosts = currentSeries?.posts || [];
  const seriesTitle = isShowAll ? '전체보기' : (currentSeries?.title || '시리즈');

  const handleSelectSeries = (seriesKey) => {
    onSeriesChange(seriesKey);
    setIsOpen(false);
  };

  const getPostHref = (post) => {
    if (typeof buildPostHref === 'function') {
      return buildPostHref(post);
    }
    return `/${category}/${post.slug}`;
  };

  return (
    <aside className="w-full">
      <div className={`${sticky ? 'sticky top-4 ' : ''}clean-card no-hover rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm p-4 sm:p-5`}>
        <div className="mb-4 space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg 
              className="w-5 h-5 text-ms-blue" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span className="line-clamp-2">시리즈</span>
          </h3>

          <div className="relative" ref={dropdownRef}>
            <label htmlFor="series-select" className="block text-xs text-slate-500 mb-1">
              시리즈 선택
            </label>

            <button
              type="button"
              id="series-select"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              className="w-full rounded-lg border border-white/70 bg-white/85 backdrop-blur px-3 py-2 text-sm text-slate-700 flex items-center justify-between hover:border-ms-blue/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ms-blue/40"
            >
              <span className="truncate mr-2">
                {isShowAll ? '전체보기' : `${seriesTitle} (${seriesPosts.length})`}
              </span>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <ul
                role="listbox"
                aria-labelledby="series-select"
                className="absolute z-20 mt-2 w-full rounded-xl border border-white/70 bg-white/90 backdrop-blur-xl shadow-lg p-1.5"
              >
                {effectiveOptions.map((series) => {
                  const isSelected = series.key === currentSeries?.key;
                  return (
                    <li key={series.key === '' ? '__all__' : series.key} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => handleSelectSeries(series.key)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-ms-blue/12 text-ms-blue font-semibold border border-ms-blue/20'
                            : 'text-slate-700 hover:bg-white/80'
                        }`}
                      >
                        {series.key === '' ? '전체보기' : `${series.title} (${series.posts?.length || 0})`}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {isShowAll ? '시리즈를 선택하면 해당 게시글 목록이 표시됩니다.' : `${seriesTitle} · 총 ${seriesPosts.length}개`}
          </p>
        </div>

        {!isShowAll && (
          <nav>
            <ol className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {seriesPosts.map((post) => {
              const isActive = currentPostId === post.id;
              return (
                <li key={post.slug}>
                  <Link
                    to={getPostHref(post)}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-ms-blue/12 text-ms-blue font-semibold border-l-4 border-ms-blue shadow-[0_8px_20px_-12px_rgba(0,120,212,0.65)]'
                        : 'text-slate-700 hover:bg-white/75 hover:text-ms-blue border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 font-semibold ${isActive ? 'text-ms-blue' : 'text-slate-400'}`}>
                        {post.seriesOrder}.
                      </span>
                      <span className="line-clamp-2 flex-1">
                        {post.title}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        {(previousPost || nextPost) && (
          <div className="mt-4 pt-4 border-t border-slate-200/70">
            <div className="flex items-center gap-2">
              {previousPost ? (
                <Link
                  to={getPostHref(previousPost)}
                  className="flex-1 h-9 rounded-md border border-white/70 bg-white/80 px-2 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                >
                  이전 글
                </Link>
              ) : <div className="flex-1 h-9" />}

              <Link
                to={backToListHref || `/${category}`}
                className="flex-1 h-9 rounded-md border border-white/70 bg-white/80 px-2 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
              >
                목록으로
              </Link>

              {nextPost ? (
                <Link
                  to={getPostHref(nextPost)}
                  className="flex-1 h-9 rounded-md border border-white/70 bg-white/80 px-2 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                >
                  다음 글
                </Link>
              ) : <div className="flex-1 h-9" />}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
