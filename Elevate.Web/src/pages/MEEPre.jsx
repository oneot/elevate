import React, { useLayoutEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

import GlassDocLayout from "../components/mee/GlassDocLayout";
import getGlassMdComponents from "../components/mee/getGlassMdComponents.jsx";

import preMeeMd from "../content/mee/pre-mee.md?raw";

const MEEPre = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const mdComponents = useMemo(
    () =>
      getGlassMdComponents({
        linkCards: [
          {
            href: "/mee/explorer-procedure",
            title: "MEE(Explorer) 지원 절차",
            desc: "Explorer 지원을 위한 전체 절차를 단계별로 확인합니다.",
            tone: "blue",
          },
          {
            href: "/mee/miee-archive",
            title: "MEE 지원 아카이브(~2025-2026)",
            desc: "연도별 지원서/모집 링크/문항 요약 자료를 모아둔 페이지입니다.",
            tone: "mint",
          },
        ],
      }),
    []
  );

  return (
    <GlassDocLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "커뮤니티 가입하기" },
      ]}
      footer={
        <div className="flex items-center justify-end">
          {/* ✅ go to home and jump to MEE section */}
          <Link
            to="/#mee"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-[20px] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/[0.10]"
          >
            <span className="text-slate-500">←</span>
            Microsoft Elevate
          </Link>
        </div>
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={mdComponents}
      >
        {preMeeMd}
      </ReactMarkdown>
    </GlassDocLayout>
  );
};

export default MEEPre;