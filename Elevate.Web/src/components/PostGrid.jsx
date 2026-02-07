import React from 'react';
import PostCard from './PostCard';

const PostGrid = ({ posts = [] }) => {
  if (!posts.length) {
    return <div className="text-center text-slate-500 py-12">게시물이 없습니다.</div>;
  }

  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
    >
      {posts.map((p) => (
        <div key={p.id || p.slug} className="h-full">
          <PostCard post={p} />
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
