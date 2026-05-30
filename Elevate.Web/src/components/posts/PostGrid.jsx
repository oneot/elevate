/**
 * @file PostGrid.jsx
 * @description PostCard를 격자(grid) 형태로 배열하는 래퍼 컴포넌트.
 *
 * 게시글이 없을 경우 빈 상태 메시지를 표시한다.
 * 검색어가 있을 때와 없을 때 다른 메시지를 보여준다.
 */
import React from 'react';
import PostCard from './PostCard';

/**
 * 게시글 목록을 반응형 그리드로 렌더링한다.
 *
 * @param {Object} props
 * @param {Array} [props.posts=[]] - 렌더링할 게시글 객체 배열
 * @param {string} [props.activeQuery=''] - 현재 활성화된 검색어 (empty state 메시지 분기용)
 * @returns {JSX.Element}
 */
const PostGrid = ({ posts = [], activeQuery = '' }) => {
  if (!posts.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl select-none">{activeQuery ? '🔍' : '📭'}</span>
        {activeQuery ? (
          <>
            <p className="text-slate-700 font-medium">
              <span className="text-ms-blue">'{activeQuery}'</span>에 대한 검색 결과가 없습니다.
            </p>
            <p className="text-slate-400 text-sm">다른 검색어를 입력하거나 필터를 조정해보세요.</p>
          </>
        ) : (
          <p className="text-slate-500">게시물이 없습니다.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid w-full mx-auto gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-stretch xl:max-w-400 2xl:max-w-440">
      {posts.map((p, index) => (
        <div key={p.id || p.slug} className="h-full">
          <PostCard post={p} priority={index === 0} />
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
