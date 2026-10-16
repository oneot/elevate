/**
 * @file DocsList.jsx
 * @description 목록 화면 구성 요소: 게시글 카드 그리드, 태그 칩, 페이지네이션,
 * 모바일 카테고리 전환기, 그리고 이들을 묶는 DocsListSection.
 */
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageLoadingProps, getThumbnailImageProps } from '../../utils/postImages';
import { formatDateKo } from '../../utils/url';
import { getDocsMeta, getTintStyle } from './docsMeta';
import { AppArt, GlassDrops } from './DocsHero';
import { useSlidingThumb } from './docsHooks';

const CARD_IMAGE_SIZES = '(min-width: 1440px) 340px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw';
const VISIBLE_TAGS = 12;

export function DocsPostCard({ post, priority = false, showCategory = false }) {
  const category = post.category || 'all';
  const meta = getDocsMeta(category);
  const imageProps = getThumbnailImageProps(post.thumbnail, { sizes: CARD_IMAGE_SIZES });
  const loadingProps = getImageLoadingProps(Boolean(priority && imageProps));
  const details = formatDateKo(post.publishedAt);

  return (
    <article className="edoc-card" style={getTintStyle(category)}>
      <Link to={`/${category}/${post.slug}`} className="edoc-card__link">
        <div className="edoc-card__media">
          {imageProps ? (
            <img {...imageProps} {...loadingProps} alt="" />
          ) : (
            <AppArt variant="card" paint={meta.paint} glyph={meta.glyph} />
          )}
        </div>
        <div className="edoc-card__body">
          {showCategory && (
            <p className="edoc-card__eyebrow">
              {meta.icon && <img src={meta.icon} alt="" width="14" height="14" />}
              {meta.name}
            </p>
          )}
          <h3 className="edoc-card__title">{post.title}</h3>
          {post.excerpt && <p className="edoc-card__excerpt">{post.excerpt}</p>}
          {details && <p className="edoc-card__meta">{details}</p>}
        </div>
      </Link>
    </article>
  );
}

export function DocsPostGrid({ posts, showCategory = false }) {
  return (
    <div className="edoc-grid">
      {posts.map((post, index) => (
        <DocsPostCard key={post.id || post.slug} post={post} priority={index < 3} showCategory={showCategory} />
      ))}
    </div>
  );
}

export function DocsPostGridSkeleton({ count = 12 }) {
  return (
    <div className="edoc-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="edoc-card">
          <div className="edoc-skel" style={{ aspectRatio: '16 / 9', borderRadius: 16 }} />
          <div style={{ display: 'grid', gap: 9, paddingTop: 16 }}>
            <div className="edoc-skel" style={{ height: 16, width: '86%' }} />
            <div className="edoc-skel" style={{ height: 16, width: '58%' }} />
            <div className="edoc-skel" style={{ height: 12, width: '92%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocsEmpty({ title, children }) {
  return (
    <div className="edoc-empty" role="status">
      <div className="edoc-empty__drop" aria-hidden="true">
        <GlassDrops drops={[{ x: '0px', y: '0px', s: 46, dur: 6, delay: 0, pop: 0, dx: 0, dy: -6, jelly: 4 }]} />
      </div>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
    </div>
  );
}

export function DocsTagChips({ tags = [], selected = '', onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const uniqueTags = useMemo(() => {
    const seen = new Set();
    return tags.filter((tag) => {
      const key = String(tag || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [tags]);

  if (uniqueTags.length === 0) return null;

  const selectedIndex = uniqueTags.findIndex((tag) => tag.toLowerCase() === selected);
  const forced = selectedIndex >= VISIBLE_TAGS;
  const showAll = expanded || forced;
  const visibleTags = showAll ? uniqueTags : uniqueTags.slice(0, VISIBLE_TAGS);

  return (
    <div className="edoc-chips" role="group" aria-label="태그로 거르기">
      <button type="button" className="edoc-chip" aria-pressed={!selected} onClick={() => onSelect('')}>
        전체
      </button>
      {visibleTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="edoc-chip"
          aria-pressed={tag.toLowerCase() === selected}
          onClick={() => onSelect(tag)}
        >
          <span className="edoc-chip__hash" aria-hidden="true">
            #
          </span>
          {tag}
        </button>
      ))}
      {uniqueTags.length > VISIBLE_TAGS && !forced && (
        <button
          type="button"
          className="edoc-chip edoc-chip--more"
          aria-expanded={showAll}
          onClick={() => setExpanded((value) => !value)}
        >
          {showAll ? '접기' : `+${uniqueTags.length - VISIBLE_TAGS}개 더 보기`}
        </button>
      )}
    </div>
  );
}

function getPageNumbers(currentPage, totalPages, delta = 2) {
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  const pages = [];
  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push('gap-left');
  }
  for (let page = left; page <= right; page += 1) pages.push(page);
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push('gap-right');
    pages.push(totalPages);
  }
  return pages;
}

export function DocsPagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  useSlidingThumb(trackRef, thumbRef, `${currentPage}/${totalPages}`);

  if (totalPages <= 1 || !onPageChange) return null;

  return (
    <nav className="edoc-pager" aria-label="페이지 이동">
      <button
        type="button"
        className="edoc-pager__step"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        이전
      </button>
      <div className="edoc-pager__track" ref={trackRef}>
        <span className="edoc-thumb" ref={thumbRef} aria-hidden="true" />
        {getPageNumbers(currentPage, totalPages).map((page) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              className="edoc-pager__num"
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`${page} 페이지`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={page} className="edoc-pager__gap" aria-hidden="true">
              …
            </span>
          )
        )}
      </div>
      <button
        type="button"
        className="edoc-pager__step"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

/** 모바일 전용 카테고리 전환기 (데스크톱에서는 왼쪽 내비게이터가 대신한다). */
export function DocsCategorySwitcher({ items, activeKey }) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  useSlidingThumb(trackRef, thumbRef, activeKey);

  return (
    <nav className="edoc-seg edoc-seg--mobile" ref={trackRef} aria-label="카테고리">
      <span className="edoc-thumb" ref={thumbRef} aria-hidden="true" />
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className="edoc-seg__item"
          aria-current={item.key === activeKey ? 'page' : undefined}
        >
          {item.icon && <img src={item.icon} alt="" width="16" height="16" />}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** 목록 본문 섹션. */
export default function DocsListSection({
  switcher,
  heading,
  countLabel,
  clearLabel = '필터 지우기',
  onClear,
  tags,
  selectedTag = '',
  onTagSelect,
  loading,
  error,
  posts = [],
  skeletonCount = 12,
  showCategory = false,
  emptyTitle = '게시글이 없습니다.',
  emptyHint,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  let body;
  if (loading) body = <DocsPostGridSkeleton count={skeletonCount} />;
  else if (error) body = <DocsEmpty title="게시글을 불러오지 못했습니다.">{error}</DocsEmpty>;
  else if (posts.length === 0) body = <DocsEmpty title={emptyTitle}>{emptyHint}</DocsEmpty>;
  else body = <DocsPostGrid posts={posts} showCategory={showCategory} />;

  return (
    <section
      className="edoc-container edoc-container--wide edoc-section"
      aria-labelledby={heading ? 'edoc-list-heading' : undefined}
      aria-label={heading ? undefined : '게시글 목록'}
      aria-busy={loading || undefined}
    >
      {switcher}
      {(heading || countLabel || onClear) && (
        <div className="edoc-section__head">
          {heading && (
            <h2 id="edoc-list-heading" className="edoc-h2">
              {heading}
            </h2>
          )}
          <div className="edoc-section__tools">
            {countLabel && <span className="edoc-count">{countLabel}</span>}
            {onClear && (
              <button type="button" className="edoc-textlink" onClick={onClear}>
                {clearLabel}
              </button>
            )}
          </div>
        </div>
      )}
      {tags && onTagSelect && <DocsTagChips tags={tags} selected={selectedTag} onSelect={onTagSelect} />}
      {body}
      <DocsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
}
