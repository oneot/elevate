/**
 * @file ShowcaseLayout.jsx
 * @description 쇼케이스·정적 콘텐츠 페이지용 공통 레이아웃 컴포넌트.
 *
 * 그라디언트 배경 + 노이즈 텍스처 + blur 장식 원을 렌더링하고,
 * 선택적으로 브레드크럼 내비게이션, 제목, 부제목, 자식 콘텐츠를 배치한다.
 * `crumbs` 배열의 각 항목은 `{ label, to }` 링크 또는 `{ type: 'sep' }` 구분자 형태를 사용한다.
 */
import React from "react";
import { Link } from "react-router-dom";

/**
 * 쇼케이스·정적 페이지용 레이아웃.
 *
 * @param {Object} props
 * @param {Array<{label: string, to?: string, type?: 'sep'}>} [props.crumbs] - 브레드크럼 항목 배열
 * @param {string} [props.title] - 페이지 제목
 * @param {string} [props.subtitle] - 페이지 부제목
 * @param {React.ReactNode} props.children - 본문 콘텐츠
 * @returns {JSX.Element}
 */
export default function ShowcaseLayout({
  crumbs,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden lg:h-dvh lg:overflow-hidden bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_50%_100%,rgba(14,165,233,0.10),transparent_60%)]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.6%22/%3E%3C/svg%3E')]"></div>

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-white/14 blur-3xl" />
        <div className="absolute top-24 -right-28 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:h-full lg:flex lg:flex-col">
        {crumbs?.length ? (
          <nav className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-2xl">
            {crumbs.map((c, idx) => {
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
        ) : null}

        <header className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {title ? (
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
            ) : null}

            {subtitle ? (
              <p className="mt-3 text-base leading-7 text-slate-700 sm:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>

        </header>

        <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}