/**
 * @file DocsPrevNext.jsx
 * @description 게시글 하단의 이전/다음 글 카드와 목록으로 돌아가기 링크.
 */
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocsPrevNext({ prev, next, buildHref, backTo, backLabel }) {
  return (
    <>
      {(prev || next) && (
        <nav className="edoc-pn" aria-label="시리즈 이동">
          {prev && (
            <Link to={buildHref(prev)} className="edoc-pn__card" rel="prev">
              <span className="edoc-pn__label">
                <ChevronLeft size={15} aria-hidden="true" />
                이전 글
              </span>
              <span className="edoc-pn__title">{prev.title}</span>
            </Link>
          )}
          {next && (
            <Link to={buildHref(next)} className="edoc-pn__card edoc-pn__card--next" rel="next">
              <span className="edoc-pn__label">
                다음 글
                <ChevronRight size={15} aria-hidden="true" />
              </span>
              <span className="edoc-pn__title">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
      {backTo && (
        <p className="edoc-backlist">
          <Link to={backTo}>
            <ChevronLeft size={15} aria-hidden="true" />
            {backLabel}
          </Link>
        </p>
      )}
    </>
  );
}
