import React, { useLayoutEffect, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

import GlassDocLayout from "../components/GlassDocLayout";
import getGlassMdComponents from "../components/getGlassMdComponents.jsx";
import TableOfContents from "../components/TableOfContents";

import { getPost } from "../lib/postsApi";

const MIEEArchive = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    getPost("mee", "miee-archive")
      .then((post) => setContent(post.contentMarkdown || ""))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const mdComponents = useMemo(() => getGlassMdComponents(), []);

  return (
    <GlassDocLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "커뮤니티 가입하기", to: "/mee/pre" },
        { type: "sep" },
        { label: "MEE 아카이브" },
      ]}
      rightAside={
        <TableOfContents
          content={content}
          postTitle="MEE 지원 아카이브(~2025-2026)"
        />
      }
      footer={
        <div className="flex items-center justify-start">
          <Link
            to="/mee/pre"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-[20px] transition hover:bg-white/[0.10]"
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={mdComponents}
          >
            {content}
          </ReactMarkdown>
        )}
      </article>
    </GlassDocLayout>
  );
};

export default MIEEArchive;