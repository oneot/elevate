import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import GlassDocLayout from "../components/GlassDocLayout";
import TableOfContents from "../components/TableOfContents";
import { sanitizeHtml, injectHeadingIds, injectLinkHandlers } from "../lib/htmlUtils";
import { getLatestAgenthonPost } from "../lib/postsApi";

const AgenthonInterview = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLatestAgenthonPost()
      .then((post) => {
        if (cancelled) return;
        if (!post) {
          setContent('');
          setError('게시글을 찾을 수 없습니다.');
        } else {
          setContent(post.contentMarkdown || '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(`게시글을 불러오지 못했습니다. (${err?.message || err})`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (contentRef.current && content) {
      injectHeadingIds(contentRef.current);
      const cleanup = injectLinkHandlers(contentRef.current, navigate);
      return cleanup;
    }
  }, [content, navigate]);

  const footer = (
    <div className="flex items-center justify-start">
      <Link
        to="/#agenthon"
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-[20px] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/[0.10]"
      >
        <span className="text-slate-500">←</span>
        Microsoft Elevate
      </Link>
    </div>
  );

  return (
    <GlassDocLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "Agenthon", to: "/agenthon" },
      ]}
      rightAside={
        content ? (
          <TableOfContents contentMarkdown={content} postTitle="에이전톤 우수사례" />
        ) : null
      }
      footer={footer}
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 rounded bg-white/10 w-3/4" />
          <div className="h-4 rounded bg-white/10 w-full" />
          <div className="h-4 rounded bg-white/10 w-5/6" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-slate-500">{error}</div>
      ) : (
        <article>
          <div
            ref={contentRef}
            className="prose prose-slate max-w-none post-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        </article>
      )}
    </GlassDocLayout>
  );
};

export default AgenthonInterview;
