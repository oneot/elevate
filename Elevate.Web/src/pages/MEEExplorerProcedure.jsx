import React, { useLayoutEffect } from "react";
import { Link } from "react-router-dom";

import GlassDocLayout from "../components/layout/GlassDocLayout";
import TableOfContents from "../components/posts/TableOfContents";

import { sanitizeHtml } from "../utils/html";
import { usePostContent } from "../hooks/usePostContent";

const MEEExplorerProcedure = () => {
  const { content, loading, error, contentRef } = usePostContent("mee", "explorer-procedure");

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <GlassDocLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "커뮤니티 가입하기", to: "/mee/pre" },
        { type: "sep" },
        { label: "Explorer 지원 절차" },
      ]}
      rightAside={
        <TableOfContents
          contentMarkdown={content}
          postTitle="MEE(Explorer) 지원 절차"
        />
      }
      footer={
        <div className="flex items-center justify-start">
          <Link
            to="/mee/pre"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-[20px] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/[0.10]"
          >
            <span className="text-slate-500">←</span>
            커뮤니티 가입하기로 돌아가기
          </Link>
        </div>
      }
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

export default MEEExplorerProcedure;