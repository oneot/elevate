import React from "react";
import { Link } from "react-router-dom";

/**
 * options.linkCards:
 * [
 *   { href, title, desc, tone: "blue" | "mint" }
 * ]
 */
export default function getGlassMdComponents(options = {}) {
  const { linkCards = [] } = options;

  const tone = {
    blue: {
      tint: "bg-blue-400/6",
      bar: "bg-gradient-to-b from-blue-500/60 via-indigo-500/45 to-sky-500/35",
    },
    mint: {
      tint: "bg-emerald-400/6",
      bar: "bg-gradient-to-b from-emerald-500/55 via-teal-500/42 to-cyan-500/30",
    },
  };
  const getTone = (t) => tone[t] ?? tone.blue;

  const isDownloadableFile = (href) => {
    // same-origin downloadable types
    return (
      typeof href === "string" &&
      (href.startsWith("/attach/") || href.startsWith("/downloads/")) &&
      /\.(docx|pdf|pptx|xlsx|zip)$/i.test(href)
    );
  };

  const filenameFromHref = (href) => {
    try {
      const clean = href.split("?")[0].split("#")[0];
      const parts = clean.split("/");
      return parts[parts.length - 1] || "download";
    } catch {
      return "download";
    }
  };

  return {
    a: ({ href, children, ...props }) => {
      if (!href) return <a {...props}>{children}</a>;

      // ✅ /mee/pre page link cards
      const card = linkCards.find((c) => c.href === href);
      if (card) {
        const t = getTone(card.tone);

        return (
          <Link to={href} className="group my-6 block">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.06] backdrop-blur-[26px] shadow-[0_14px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-[1px] hover:bg-white/[0.08] hover:shadow-[0_20px_70px_rgba(15,23,42,0.16)] active:translate-y-0">
              <div className={`pointer-events-none absolute inset-0 ${t.tint}`} />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/14" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-white/8 to-transparent" />

              <div className={`pointer-events-none absolute left-0 top-0 h-full w-[5px] ${t.bar}`} />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-white/5 blur-xl" />

              <div className="relative px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold tracking-tight text-slate-900">
                      {card.title ?? children}
                    </div>
                    {card.desc ? (
                      <div className="mt-1 text-sm leading-relaxed text-slate-700">
                        {card.desc}
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-slate-500 transition group-hover:text-slate-800">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M10 7l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      }

      // ✅ downloadable attachments: force download
      if (isDownloadableFile(href)) {
        const filename = filenameFromHref(href);
        return (
          <a
            href={href}
            download={filename}
            {...props}
            className="text-ms-blue hover:underline underline-offset-4"
          >
            {children}
          </a>
        );
      }

      const isInternal = href.startsWith("/") || href.startsWith("#");
      if (isInternal) {
        return (
          <Link
            to={href}
            {...props}
            className="text-ms-blue hover:underline underline-offset-4"
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
          className="text-ms-blue hover:underline underline-offset-4"
        >
          {children}
        </a>
      );
    },

    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 mt-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3 mt-10">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-slate-800 mb-2 mt-6">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="mb-4 text-[15px] leading-7 text-slate-800">{children}</p>
    ),

    ul: ({ children }) => (
      <ul className="mb-5 ml-5 list-disc space-y-1 text-[15px] leading-7 text-slate-800">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-5 ml-5 list-decimal space-y-1 text-[15px] leading-7 text-slate-800">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,

    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-slate-300/70 pl-4 italic text-slate-700">
        {children}
      </blockquote>
    ),

    aside: ({ children, ...props }) => (
      <aside className="my-6 border-l-2 border-slate-200 pl-4 text-slate-800" {...props}>
        {children}
      </aside>
    ),

    img: ({ src, alt, ...props }) => (
      <img
        src={src}
        alt={alt}
        className="my-7 w-full rounded-2xl border border-white/18 shadow-[0_10px_34px_rgba(15,23,42,0.14)]"
        {...props}
        loading="lazy"
      />
    ),

    table: ({ children, ...props }) => (
      <div className="my-7 overflow-x-auto rounded-2xl border border-white/18 bg-white/[0.05] backdrop-blur-[18px] shadow-sm">
        <table className="min-w-full text-left text-[14px] text-slate-800" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 font-semibold text-slate-900 bg-white/10 border-b border-slate-200/60">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 border-b border-slate-200/50 align-top">
        {children}
      </td>
    ),
  };
}