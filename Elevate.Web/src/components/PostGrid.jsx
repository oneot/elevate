import React from 'react';
import PostCard from './PostCard';

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
