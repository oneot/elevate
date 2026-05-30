/**
 * @file GlassDocLayout.jsx
 * @description glassmorphism 스타일의 문서/게시글 페이지용 레이아웃 컴포넌트.
 *
 * 그라디언트 배경 + 노이즈 텍스처 + blur 장식 원을 배경으로 렌더링하며,
 * 본문 영역은 반투명 glass 패널로 처리된다.
 *
 * 사이드바 prop 조합에 따라 컬럼 레이아웃이 달라진다:
 * - leftAside + rightAside → 3컬럼 [280px | 1fr | 280px]
 * - rightAside만            → 2컬럼 [1fr | 280px]
 * - leftAside만             → 2컬럼 [280px | 1fr]
 * - 없음                    → 1컬럼
 *
 * `crumbs` 배열 형식: `{ label, to }` 링크 | `{ type: 'sep' }` 구분자
 */
import React from "react";
import { Link } from "react-router-dom";

/**
 * glassmorphism 문서 레이아웃.
 *
 * @param {Object} props
 * @param {Array<{label: string, to?: string, type?: 'sep'}>} [props.crumbs] - 브레드크럼 항목 배열
 * @param {React.ReactNode} props.children - glass 패널 내 본문 콘텐츠
 * @param {React.ReactNode} [props.footer] - 본문 하단 구분선 아래 표시할 콘텐츠
 * @param {React.ReactNode} [props.leftAside] - 좌측 사이드바 콘텐츠 (지정 시 좌측 컬럼 추가)
 * @param {React.ReactNode} [props.rightAside] - 우측 사이드바 콘텐츠 (지정 시 우측 컬럼 추가)
 * @param {boolean} [props.reserveLeftAside] - 콘텐츠가 로드되기 전에도 좌측 컬럼 폭을 예약한다
 * @param {boolean} [props.reserveRightAside] - 콘텐츠가 로드되기 전에도 우측 컬럼 폭을 예약한다
 * @returns {JSX.Element}
 */
export default function GlassDocLayout({
  crumbs,
  children,
  footer,
  leftAside,
  rightAside,
  reserveLeftAside = false,
  reserveRightAside = false,
}) {
  // 사이드바 유무에 따라 그리드 컬럼 구성을 결정한다.
  // leftAside/rightAside 둘 다 없는 경우 단순 1컬럼으로 유지한다.
  let gridClass = "grid grid-cols-1";
  const hasLeftColumn = Boolean(leftAside) || reserveLeftAside;
  const hasRightColumn = Boolean(rightAside) || reserveRightAside;

  if (hasLeftColumn && hasRightColumn) {
    gridClass = "grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]";
  } else if (hasRightColumn) {
    gridClass = "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]";
  } else if (hasLeftColumn) {
    gridClass = "grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]";
  }

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

        <div className={gridClass}>
          {/* 좌측 사이드바 (목차 등) — lg 이상에서만 표시 */}
          {hasLeftColumn && (
            <aside className="hidden min-w-0 self-start lg:sticky lg:top-6 lg:block">
              {leftAside}
            </aside>
          )}

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

          {/* 우측 사이드바 (시리즈 내비게이터, TOC 등) — lg 이상에서만 표시 */}
          {hasRightColumn && (
            <aside className="hidden min-w-0 self-start lg:sticky lg:top-6 lg:block">
              {rightAside}
            </aside>
          )}
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}
