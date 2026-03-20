import React, { useLayoutEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";

import GlassDocLayout from "../components/GlassDocLayout";
import getGlassMdComponents from "../components/getGlassMdComponents.jsx";
import TableOfContents from "../components/TableOfContents";

import agenthonInterviewMd from "../content/agenthon/agenthon-interview.md?raw";

const AgenthonInterview = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const mdComponents = useMemo(() => getGlassMdComponents(), []);

  return (
    <GlassDocLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "Agenthon", to: "/agenthon" },
        { type: "sep" },
        { label: "인터뷰" },
      ]}
      rightAside={
        <TableOfContents
          content={agenthonInterviewMd}
          postTitle="에이전톤 우수사례"
        />
      }
      footer={
        <div className="flex items-center justify-start">
          <Link
            to="/#agenthon"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-[20px] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white/[0.10]"
          >
            <span className="text-slate-500">←</span>
            Microsoft Elevate
          </Link>
        </div>
      }
    >
      <article>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={mdComponents}
        >
          {agenthonInterviewMd}
        </ReactMarkdown>
      </article>
    </GlassDocLayout>
  );
};

export default AgenthonInterview;