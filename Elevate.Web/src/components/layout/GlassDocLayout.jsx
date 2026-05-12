import React from "react";
import { Link } from "react-router-dom";

export default function GlassDocLayout({
  crumbs,
  children,
  footer,
  rightAside,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_50%_100%,rgba(14,165,233,0.10),transparent_60%)]">
      {/* ultra subtle noise */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.6%22/%3E%3C/svg%3E')]"></div>

      {/* soft blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-white/14 blur-3xl" />
        <div className="absolute top-24 -right-28 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* breadcrumb pill */}
        <nav className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-2xl">
          {crumbs?.map((c, idx) => {
            const last = idx === crumbs.length - 1;

            if (c.type === "sep") {
              return (
                <span key={idx} className="text-slate-400">
                  /
                </span>
              );
            }

            if (last || !c.to) {
              return (
                <span key={idx} className="text-slate-600">
                  {c.label}
                </span>
              );
            }

            return (
              <Link
                key={idx}
                to={c.to}
                className="font-semibold text-ms-blue hover:opacity-90"
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        <div
          className={
            rightAside
              ? "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
              : "grid grid-cols-1"
          }
        >
          {/* main glass panel */}
          <div className="relative min-w-0 overflow-hidden rounded-[30px] border border-white/22 bg-white/[0.04] shadow-[0_22px_90px_rgba(15,23,42,0.18)] backdrop-blur-[34px]">
            {/* glass edge + reflection */}
            <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/14" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/22 via-white/8 to-transparent" />

            <div className="relative px-5 py-10 sm:px-10">
              {children}

              {footer ? (
                <div className="mt-10 border-t border-white/20 pt-6">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>

          {rightAside ? (
            <aside className="hidden min-w-0 self-start lg:sticky lg:top-6 lg:block">
              {rightAside}
            </aside>
          ) : null}
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}