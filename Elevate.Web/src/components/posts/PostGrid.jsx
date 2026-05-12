/**
 * @file PostGrid.jsx
 * @description PostCard를 격자(grid) 형태로 배열하는 래퍼 컴포넌트.
 *
 * 게시글이 없을 경우 빈 상태 메시지를 표시한다.
 */
import React from 'react';
import PostCard from './PostCard';

/**
 * 게시글 목록을 반응형 그리드로 렌더링한다.
 *
 * @param {Object} props
 * @param {Array} [props.posts=[]] - 렌더링할 게시글 객체 배열
 * @returns {JSX.Element}
 */
const PostGrid = ({ posts = [] }) => {
  if (!posts.length) {
    return <div className="text-center text-slate-500 py-12">게시물이 없습니다.</div>;
  }

  return (
    <div className="grid w-full mx-auto gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-items-stretch xl:max-w-400 2xl:max-w-440">
      {posts.map((p) => (
        <div key={p.id || p.slug} className="h-full">
          <PostCard post={p} />
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
