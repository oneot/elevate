/**
 * @file DocsNavigator.jsx
 * @description Apple 문서 사이드바 형태의 트리 내비게이터.
 *
 * - 섹션 제목 + 펼침/접힘 트리 (현재 위치의 상위 항목은 자동으로 펼침)
 * - 현재 항목을 따라 부드럽게 이동하는 흰색 글래스 하이라이트
 * - 하단 필터 입력 (`/` 키는 DocsShell에서 이 입력으로 포커스를 옮긴다)
 */
import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListFilter, X } from 'lucide-react';

function collectParents(sections) {
  const parents = new Map();
  const walk = (nodes, parentId) => {
    nodes.forEach((node) => {
      if (parentId) parents.set(node.id, parentId);
      if (node.children?.length) walk(node.children, node.id);
    });
  };
  sections.forEach((section) => walk(section.nodes || [], null));
  return parents;
}

function filterNodes(nodes, query) {
  const result = [];
  nodes.forEach((node) => {
    const children = node.children?.length ? filterNodes(node.children, query) : [];
    const selfMatch = node.label.toLowerCase().includes(query);
    if (selfMatch || children.length) {
      result.push({ ...node, children: children.length ? children : undefined, hasChildren: false });
    }
  });
  return result;
}

function Highlight({ text, query }) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="edoc-mark">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

function NavList({ nodes, depth, ctx }) {
  return (
    <ul className="edoc-nav__list">
      {nodes.map((node) => (
        <NavItem key={node.id} node={node} depth={depth} ctx={ctx} />
      ))}
    </ul>
  );
}

function NavItem({ node, depth, ctx }) {
  const lazy = Boolean(node.hasChildren) && !node.children;
  const expandable = lazy || Boolean(node.children?.length);
  const expanded = expandable && ctx.isExpanded(node);
  const isActive = ctx.activeId === node.id;
  const handleSelect = () => {
    if (node.onSelect) node.onSelect();
    else if (!node.to && expandable) ctx.toggle(node);
  };

  const content = (
    <>
      {node.iconSrc ? (
        <span className="edoc-nav__icon">
          <img src={node.iconSrc} alt="" width="18" height="18" decoding="async" />
        </span>
      ) : node.icon ? (
        <span className="edoc-nav__icon">{createElement(node.icon, { size: 15, strokeWidth: 1.8, 'aria-hidden': true })}</span>
      ) : null}
      {node.prefix != null && <span className="edoc-nav__prefix">{node.prefix}</span>}
      <span className="edoc-nav__label">
        <Highlight text={node.label} query={ctx.query} />
      </span>
      {node.badge != null && <span className="edoc-nav__badge">{node.badge}</span>}
    </>
  );

  const linkProps = {
    className: 'edoc-nav__link',
    title: node.title || node.label,
    'aria-current': isActive ? (node.kind === 'toc' ? 'location' : 'page') : undefined,
  };

  return (
    <li>
      <div
        ref={(element) => ctx.registerRow(node.id, element)}
        className="edoc-nav__row"
        data-kind={node.kind || 'item'}
        data-active={isActive ? 'true' : undefined}
        data-emph={node.emphasis ? 'true' : undefined}
        style={{ '--depth': depth }}
      >
        {expandable ? (
          <button
            type="button"
            className="edoc-nav__disc"
            aria-expanded={expanded}
            aria-label={`${node.label} ${expanded ? '접기' : '펼치기'}`}
            onClick={() => ctx.toggle(node)}
          >
            <ChevronRight size={13} strokeWidth={2.4} aria-hidden="true" />
          </button>
        ) : (
          <span className="edoc-nav__spacer" aria-hidden="true" />
        )}
        {node.to ? (
          <Link to={node.to} {...linkProps} onClick={node.onSelect}>
            {content}
          </Link>
        ) : (
          <button type="button" {...linkProps} onClick={handleSelect}>
            {content}
          </button>
        )}
      </div>
      {expanded &&
        (node.children ? (
          <NavList nodes={node.children} depth={depth + 1} ctx={ctx} />
        ) : (
          <p className="edoc-nav__note" style={{ '--depth': depth + 1 }}>
            불러오는 중…
          </p>
        ))}
    </li>
  );
}

/** 내비게이터 상단: 뒤로 가기 링크 + 제목 (Apple의 "‹ All Technologies / SwiftUI"). */
export function NavHeader({ backTo, backLabel, title, titleTo, subtitle }) {
  return (
    <div className="edoc-nav__head">
      {backTo && (
        <Link to={backTo} className="edoc-nav__back">
          <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      {title &&
        (titleTo ? (
          <Link to={titleTo} className="edoc-nav__title">
            {title}
          </Link>
        ) : (
          <p className="edoc-nav__title">{title}</p>
        ))}
      {subtitle && <p className="edoc-nav__subtitle">{subtitle}</p>}
    </div>
  );
}

export function NavSkeleton() {
  return (
    <div className="edoc-nav__scroll">
      <div className="edoc-nav-skel" aria-hidden="true">
        {[46, 72, 88, 64, 80, 58, 76, 66].map((width, index) => (
          <div key={index} className="edoc-skel" style={{ height: 14, width: `${width}%` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {React.ReactNode} [props.header]
 * @param {Array<{ id: string, heading?: string, nodes: Array }>} props.sections
 *   node: { id, label, to?, onSelect?, icon?, iconSrc?, prefix?, badge?, kind?: 'item'|'toc',
 *           emphasis?, children?, hasChildren?, onExpand?, defaultExpanded? }
 * @param {string} [props.activeId] - 하이라이트가 놓일 항목 id
 * @param {string} [props.resetKey] - 바뀌면 사용자가 펼치거나 접은 상태를 초기화한다
 */
export default function DocsNavigator({
  header,
  sections,
  activeId = '',
  resetKey = '',
  filterPlaceholder = '필터',
  emptyLabel = '일치하는 항목이 없습니다.',
}) {
  const [query, setQuery] = useState('');
  const [overrides, setOverrides] = useState({});
  const [overridesKey, setOverridesKey] = useState(resetKey);
  if (overridesKey !== resetKey) {
    setOverridesKey(resetKey);
    setOverrides({});
  }

  const scrollRef = useRef(null);
  const treeRef = useRef(null);
  const dropRef = useRef(null);
  const inputRef = useRef(null);
  const rowsRef = useRef(new Map());
  const lastScrolledRef = useRef(null);
  const placeRef = useRef(() => {});

  const q = query.trim().toLowerCase();
  const parents = useMemo(() => collectParents(sections), [sections]);
  const activeAncestors = useMemo(() => {
    const ancestors = new Set();
    let parent = parents.get(activeId);
    while (parent) {
      ancestors.add(parent);
      parent = parents.get(parent);
    }
    return ancestors;
  }, [parents, activeId]);

  const visibleSections = useMemo(() => {
    if (!q) return sections;
    return sections
      .map((section) => ({ ...section, nodes: filterNodes(section.nodes || [], q) }))
      .filter((section) => section.nodes.length > 0);
  }, [sections, q]);

  const isExpanded = useCallback(
    (node) => {
      if (q) return true;
      if (Object.prototype.hasOwnProperty.call(overrides, node.id)) return overrides[node.id];
      return Boolean(node.defaultExpanded) || activeAncestors.has(node.id);
    },
    [q, overrides, activeAncestors]
  );

  const toggle = useCallback(
    (node) => {
      const next = !isExpanded(node);
      setOverrides((prev) => ({ ...prev, [node.id]: next }));
      if (next && !node.children && node.onExpand) node.onExpand();
    },
    [isExpanded]
  );

  const registerRow = useCallback((id, element) => {
    if (element) rowsRef.current.set(id, element);
    else rowsRef.current.delete(id);
  }, []);

  // Glide the white glass highlight to the active row (or its nearest visible ancestor).
  const place = useCallback(
    (allowScroll) => {
      const drop = dropRef.current;
      if (!drop) return;
      let targetId = activeId;
      while (targetId && !rowsRef.current.has(targetId)) targetId = parents.get(targetId);
      const row = targetId ? rowsRef.current.get(targetId) : null;
      if (!row || row.offsetHeight === 0) {
        drop.dataset.visible = 'false';
        return;
      }
      drop.style.setProperty('--y', `${row.offsetTop}px`);
      drop.style.setProperty('--h', `${row.offsetHeight}px`);
      drop.dataset.visible = 'true';
      if (drop.dataset.ready !== 'true') {
        requestAnimationFrame(() => {
          if (dropRef.current) dropRef.current.dataset.ready = 'true';
        });
      }

      const scroller = scrollRef.current;
      if (!allowScroll || !scroller || lastScrolledRef.current === activeId || scroller.clientHeight === 0) return;
      lastScrolledRef.current = activeId;
      const scrollerRect = scroller.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (rowRect.top < scrollerRect.top + 48 || rowRect.bottom > scrollerRect.bottom - 48) {
        scroller.scrollTo({
          top: scroller.scrollTop + (rowRect.top - scrollerRect.top) - scrollerRect.height * 0.35,
          behavior: drop.dataset.ready === 'true' ? 'smooth' : 'auto',
        });
      }
    },
    [activeId, parents]
  );

  useLayoutEffect(() => {
    placeRef.current = place;
    place(true);
  });

  useEffect(() => {
    const tree = treeRef.current;
    if (!tree || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => placeRef.current(false));
    observer.observe(tree);
    return () => observer.disconnect();
  }, []);

  const ctx = { isExpanded, toggle, activeId, query: q, registerRow };

  return (
    <>
      <div className="edoc-nav__scroll" ref={scrollRef}>
        {header}
        <div className="edoc-nav__tree" ref={treeRef}>
          <span className="edoc-nav__drop" ref={dropRef} aria-hidden="true" />
          {visibleSections.length === 0 ? (
            <p className="edoc-nav__note">{emptyLabel}</p>
          ) : (
            visibleSections.map((section) => (
              <div key={section.id} className="edoc-nav__group" role="group" aria-label={section.heading || undefined}>
                {section.heading && <p className="edoc-nav__heading">{section.heading}</p>}
                <NavList nodes={section.nodes} depth={0} ctx={ctx} />
              </div>
            ))
          )}
        </div>
      </div>
      <div className="edoc-nav__foot">
        <div className="edoc-filter">
          <ListFilter className="edoc-filter__icon" size={15} aria-hidden="true" />
          <input
            ref={inputRef}
            data-edoc-filter=""
            type="text"
            className="edoc-filter__input"
            value={query}
            placeholder={filterPlaceholder}
            aria-label={filterPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Escape') return;
              if (query) {
                event.stopPropagation();
                setQuery('');
              } else {
                event.currentTarget.blur();
              }
            }}
          />
          {query && (
            <button
              type="button"
              className="edoc-filter__clear"
              aria-label="필터 지우기"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <X size={12} strokeWidth={3} aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          className="edoc-kbd"
          aria-label="필터로 이동 (/ 키)"
          title="/ 키를 누르면 필터로 이동합니다"
          onClick={() => inputRef.current?.focus()}
        >
          /
        </button>
      </div>
    </>
  );
}
