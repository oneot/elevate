import React, { useLayoutEffect } from 'react';
import GlassDocLayout from './GlassDocLayout';
import TableOfContents from '../posts/TableOfContents';
import { sanitizeHtml } from '../../utils/html';
import { usePostContent } from '../../hooks/usePostContent';

const StaticDocPage = ({ category, slug, postTitle, crumbs, footer }) => {
  const { content, loading, error, contentRef } = usePostContent(category, slug);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <GlassDocLayout
      crumbs={crumbs}
      rightAside={
        <TableOfContents contentMarkdown={content} postTitle={postTitle} />
      }
      footer={footer}
    >
      <article>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 rounded bg-white/10 w-3/4" />
            <div className="h-4 rounded bg-white/10 w-full" />
            <div className="h-4 rounded bg-white/10 w-5/6" />
          </div>
        ) : error ? (
          <p className="text-red-500">게시글을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
        ) : (
          <div
            ref={contentRef}
            className="prose prose-slate max-w-none post-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        )}
      </article>
    </GlassDocLayout>
  );
};

export default StaticDocPage;
