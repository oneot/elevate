/**
 * @file DocsHero.jsx
 * @description Apple 문서 상단 히어로 밴드 (브레드크럼 · eyebrow · 제목 · 요약 · 메타).
 * 오른쪽에는 앱 아이콘 색으로 빛나는 유리 타일과 흰 유리 아이콘(AppArt)을 둔다.
 */
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getDocsMeta } from './docsMeta';

const DROPS = [
  { x: '63%', y: '50%', s: 58, dur: 13, delay: -2, pop: 0.15, dx: 6, dy: -10, jelly: 8 },
  { x: '9%', y: '10%', s: 30, dur: 11, delay: -5, pop: 0.3, dx: -5, dy: 8, jelly: 6 },
  { x: '84%', y: '6%', s: 16, dur: 9, delay: -1, pop: 0.42, dx: 4, dy: 7, jelly: 5 },
  { x: '1%', y: '70%', s: 12, dur: 10, delay: -7, pop: 0.5, dx: 5, dy: -6, jelly: 6 },
  { x: '37%', y: '84%', s: 20, dur: 12, delay: -4, pop: 0.36, dx: -6, dy: -8, jelly: 7 },
];

export function GlassDrops({ drops = DROPS }) {
  return drops.map((drop, index) => (
    <span
      key={index}
      className="edoc-drop"
      style={{
        '--x': drop.x,
        '--y': drop.y,
        '--s': `${drop.s}px`,
        '--dur': `${drop.dur}s`,
        '--delay': `${drop.delay}s`,
        '--pop': `${drop.pop}s`,
        '--dx': `${drop.dx}px`,
        '--dy': `${drop.dy}px`,
        '--jelly': `${drop.jelly}s`,
      }}
    />
  ));
}

/**
 * 유리 앱 타일: 앱 아이콘 색으로 은은하게 빛나는 반투명 타일 위에 흰 유리 아이콘을 올린다.
 * - hero: 타일 뒤로 같은 색의 옅은 빛 번짐(fluid)을 깐다.
 * - card: 썸네일 없는 게시글 카드의 이미지 자리를 채운다.
 */
export function AppArt({ paint, glyph, variant = 'hero', className = '' }) {
  return (
    <div
      className={`edoc-art edoc-art--${variant} ${className}`}
      aria-hidden="true"
      style={{ '--edoc-art-paint': `url("${paint}")`, '--edoc-art-glyph': `url("${glyph}")` }}
    >
      {variant === 'hero' && (
        <div className="edoc-art__fluid">
          <span className="edoc-art__blob edoc-art__blob--a" />
          <span className="edoc-art__blob edoc-art__blob--b" />
        </div>
      )}
      <div className="edoc-art__tile">
        <div className="edoc-art__glow" />
        <div className="edoc-art__frost" />
        <div className="edoc-art__grain" />
        <div className="edoc-art__glyph" />
        <div className="edoc-art__rim" />
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.category - 색/로고를 고르는 카테고리 키
 * @param {Array<{label: string, to?: string}>} [props.crumbs]
 * @param {React.ReactNode} [props.eyebrow]
 * @param {string} [props.eyebrowIcon]
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.abstract]
 * @param {React.ReactNode[]} [props.meta] - 세로 구분선으로 나뉘는 메타 정보
 * @param {boolean} [props.wide] - 목록 화면처럼 넓은 컨테이너를 쓴다
 * @param {boolean} [props.compact] - 상세 화면용 작은 장식
 * @param {string} [props.titleId]
 */
export default function DocsHero({
  category,
  crumbs = [],
  eyebrow,
  eyebrowIcon,
  title,
  abstract,
  meta = [],
  wide = false,
  compact = false,
  titleId = 'edoc-hero-title',
}) {
  const docsMeta = getDocsMeta(category);
  const metaItems = meta.filter(Boolean);

  return (
    <section className={`edoc-hero${compact ? ' edoc-hero--compact' : ''}`} aria-labelledby={titleId}>
      <AppArt key={docsMeta.key} className="edoc-hero__art" paint={docsMeta.paint} glyph={docsMeta.glyph} />
      <div className={`edoc-container${wide ? ' edoc-container--wide' : ''} edoc-hero__inner`}>
        <div className="edoc-hero__text">
          {crumbs.length > 0 && (
            <nav className="edoc-crumbs" aria-label="현재 위치">
              {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && (
                    <span className="edoc-crumbs__sep" aria-hidden="true">
                      /
                    </span>
                  )}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                </Fragment>
              ))}
            </nav>
          )}
          {eyebrow && (
            <p className="edoc-hero__eyebrow">
              {eyebrowIcon && <img src={eyebrowIcon} alt="" width="22" height="22" />}
              {eyebrow}
            </p>
          )}
          <h1 id={titleId} className="edoc-hero__title">
            {title}
          </h1>
          {abstract && <p className="edoc-hero__abstract">{abstract}</p>}
          {metaItems.length > 0 && (
            <div className="edoc-hero__meta">
              {metaItems.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function DocsArticleSkeleton() {
  return (
    <div aria-hidden="true">
      <section className="edoc-hero edoc-hero--compact">
        <div className="edoc-container edoc-hero__inner">
          <div className="edoc-hero__text" style={{ display: 'grid', gap: 14 }}>
            <div className="edoc-skel" style={{ height: 14, width: 200 }} />
            <div className="edoc-skel" style={{ height: 18, width: 150, marginTop: 8 }} />
            <div className="edoc-skel" style={{ height: 40, width: '88%' }} />
            <div className="edoc-skel" style={{ height: 20, width: '62%' }} />
          </div>
        </div>
      </section>
      <div className="edoc-container edoc-article-wrap" style={{ display: 'grid', gap: 14 }}>
        <div className="edoc-skel" style={{ height: 30, width: '40%', marginBottom: 8 }} />
        {[96, 90, 94, 72, 0, 92, 84, 64].map((width, index) =>
          width ? (
            <div key={index} className="edoc-skel" style={{ height: 16, width: `${width}%` }} />
          ) : (
            <div key={index} style={{ height: 14 }} />
          )
        )}
      </div>
    </div>
  );
}
