import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SeriesNavigator 컴포넌트
 * 게시글 리스트 화면에서 같은 시리즈에 속한 게시글들의 순서를 표시하는 우측 사이드바
 * 
 * @param {Object} props
 * @param {Array} props.seriesPosts - 시리즈에 속한 게시글 배열 (id, slug, title, seriesOrder 포함)
 * @param {string} props.seriesTitle - 시리즈 이름
 * @param {string} props.category - 카테고리 이름 (링크 생성용)
 * @param {string} props.currentPostId - 현재 보고 있는 게시글 ID (optional, active 상태 표시용)
 */
export default function SeriesNavigator({ seriesPosts = [], seriesTitle = '', category = '', currentPostId = null }) {
  if (!seriesPosts || seriesPosts.length === 0) {
    return null;
  }

  return (
    <aside className="w-full">
      <div className="sticky top-4 clean-card no-hover rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm p-4 sm:p-5">
        <div className="mb-4">
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
            <span className="line-clamp-2">{seriesTitle || '시리즈'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">총 {seriesPosts.length}개</p>
        </div>

        <nav>
          <ol className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {seriesPosts.map((post) => {
              const isActive = currentPostId === post.id;
              return (
                <li key={post.slug}>
                  <Link
                    to={`/blog/${category}/${post.slug}`}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-ms-blue/10 text-ms-blue font-semibold border-l-4 border-ms-blue'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-ms-blue border-l-4 border-transparent'
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
      </div>
    </aside>
  );
}
