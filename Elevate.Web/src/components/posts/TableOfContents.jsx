/**
 * @file TableOfContents.jsx
 * @description 게시글 상세 페이지의 우측 목차 컴포넌트.
 *
 * 두 가지 Observer를 조합하여 동적 목차를 구현한다:
 * - `MutationObserver`: `dangerouslySetInnerHTML` 렌더링 후 DOM이 변경될 때 heading 목록을 재추출
 * - `IntersectionObserver`: 뷰포트 진입 heading을 추적하여 현재 활성 항목 강조
 *
 * `buildNestedHeadings`: 평탄한 `[h1, h2, h3, ...]` 배열을 부모-자식 트리로 변환 (스택 기반)
 * `post-title` id: 게시글 제목을 목차 최상단에 별도 스타일로 추가하기 위한 가상 항목
 */
import { useEffect, useState, useRef } from 'react';
import { getPostContentHeadings } from '../../utils/html';

/**
 * 평탄한 heading 배열을 부모-자식 중첩 트리로 변환한다.
 * 스택을 이용해 현재 heading보다 레벨이 높거나 같은 항목을 제거하며 트리를 구성한다.
 * @param {{ id: string, text: string, level: number }[]} flatHeadings
 * @returns {{ id: string, text: string, level: number, children: Array }[]}
 */
const buildNestedHeadings = (flatHeadings) => {
  const nested = [];
  const stack = [];

  flatHeadings.forEach((heading) => {
    // 같거나 더 작은 level의 항목들을 스택에서 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    const item = {
      ...heading,
      children: []
    };

    if (stack.length === 0) {
      // 스택이 비어있으면 최상위에 추가
      nested.push(item);
    } else {
      // 스택의 마지막 항목의 children에 추가
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  });

  return nested;
};

/**
 * heading의 children 배열을 재귀적으로 렌더링하는 헬퍼 컴포넌트.
 * isPostTitle 케이스와 일반 케이스 모두 이 컴포넌트를 재사용하여 중복을 방지한다.
 */
const ChildrenList = ({ items, activeId, onLinkClick, className = 'space-y-0' }) => {
  if (!items || items.length === 0) return null;
  return (
    <ul className={className}>
      {items.map((child) => (
        <TableOfContentsItem
          key={child.id}
          heading={child}
          activeId={activeId}
          onLinkClick={onLinkClick}
        />
      ))}
    </ul>
  );
};

/**
 * 목차 항목 하나를 렌더링하는 재귀 컴포넌트.
 * `post-title` id는 게시글 제목을 가리키는 가상 heading으로, 클릭 시 페이지 최상단으로 이동한다.
 */
const TableOfContentsItem = ({ heading, activeId, onLinkClick }) => {
  const isActive = activeId === heading.id;
  const isPostTitle = heading.id === 'post-title';

  // 게시글 제목은 특별한 스타일
  if (isPostTitle) {
    return (
      <li className="mb-4">
        <a
          href={`#${heading.id}`}
          className="block px-3 py-2 text-sm font-semibold text-ms-blue bg-ms-blue/10 border-l-4 border-ms-blue rounded-r transition-all line-clamp-2 hover:bg-ms-blue/15"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onLinkClick();
          }}
        >
          {heading.text}
        </a>
        <ChildrenList
          items={heading.children}
          activeId={activeId}
          onLinkClick={onLinkClick}
          className="space-y-0 mt-1"
        />
      </li>
    );
  }

  // 일반 제목의 스타일
  const paddingClass = {
    1: 'pl-0',
    2: 'pl-4',
    3: 'pl-8'
  }[heading.level];

  return (
    <li key={heading.id} className={paddingClass}>
      <a
        href={`#${heading.id}`}
        className={`block py-1.5 text-sm font-medium transition-all line-clamp-2 ${
          isActive
            ? 'text-ms-blue'
            : 'text-slate-600 hover:text-slate-800'
        }`}
        onClick={(e) => {
          e.preventDefault();
          const element = document.getElementById(heading.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            onLinkClick();
          }
        }}
      >
        {heading.text}
      </a>
      <ChildrenList
        items={heading.children}
        activeId={activeId}
        onLinkClick={onLinkClick}
      />
    </li>
  );
};

/**
 * 게시글 목차 컴포넌트.
 * heading이 없으면 null을 반환한다.
 *
 * @param {Object} props
 * @param {string} [props.contentMarkdown] - 콘텐츠 변경 감지용 의존성 (실제로는 HTML 문자열)
 * @param {string} [props.postTitle] - 목차 최상단에 추가할 게시글 제목
 * @param {boolean} [props.sticky=true] - true이면 `sticky top-4` 포지션 적용
 * @returns {JSX.Element|null}
 */
const TableOfContents = ({ contentMarkdown, postTitle, sticky = true }) => {
  const [activeId, setActiveId] = useState('');
  const [headings, setHeadings] = useState([]);
  const observerRef = useRef(null);

  // MutationObserver로 article DOM 변경을 감지하고 heading을 재추출한다.
  // heading id는 렌더 후 주입되므로 attribute 변경도 감지한다.
  useEffect(() => {
    const contentRoot = document.querySelector('article .post-content');
    if (!contentRoot) return;

    const updateHeadings = () => {
      const flatHeadings = getPostContentHeadings(contentRoot);
      
      // 게시글 제목을 첫 번째 항목으로 추가
      if (postTitle) {
        flatHeadings.unshift({
          id: 'post-title',
          text: postTitle,
          level: 1
        });
      }

      if (flatHeadings.length > 0) {
        const nested = buildNestedHeadings(flatHeadings);
        setHeadings(nested);
      } else {
        setHeadings([]);
      }
    };

    updateHeadings();

    const observer = new MutationObserver(updateHeadings);
    observer.observe(contentRoot, {
      attributes: true,
      attributeFilter: ['id'],
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      observer.disconnect();
    };
  }, [contentMarkdown, postTitle]);

  // IntersectionObserver로 뷰포트 진입 heading을 추적한다.
  // 동시에 여러 heading이 보일 때는 top 좌표가 가장 위인 항목을 active로 선택한다.
  // 페이지 최하단에 도달하면 scroll 이벤트로 마지막 heading을 active로 강제 설정한다.
  useEffect(() => {
    if (headings.length === 0) return;

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 마크다운 렌더링된 제목 요소들 수집
    const headingElements = document.querySelectorAll('article .post-content h1, article .post-content h2, article .post-content h3');

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let visibleHeadings = [];

        entries.forEach((entry) => {
          if (entry.target.id && entry.isIntersecting) {
            visibleHeadings.push({
              id: entry.target.id,
              top: entry.boundingClientRect.top
            });
          }
        });

        if (visibleHeadings.length > 0) {
          visibleHeadings.sort((a, b) => a.top - b.top);
          setActiveId(visibleHeadings[0].id);
        }
      },
      {
        rootMargin: '0px 0px -60% 0px'
      }
    );

    headingElements.forEach((element) => {
      if (element.id) {
        observer.observe(element);
      }
    });

    observerRef.current = observer;

    const handleScroll = () => {
      const headingElements = document.querySelectorAll('article .post-content h1, article .post-content h2, article .post-content h3');
      if (headingElements.length === 0) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= documentHeight - 100) {
        const lastHeading = headingElements[headingElements.length - 1];
        if (lastHeading && lastHeading.id) {
          setActiveId(lastHeading.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={`${sticky ? 'sticky top-4 ' : ''}clean-card no-hover p-4 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50`}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        목차
      </div>
      <ul className="space-y-0 text-sm">
        {headings.map((heading) => (
          <TableOfContentsItem
            key={heading.id}
            heading={heading}
            activeId={activeId}
            onLinkClick={() => {
              // 링크 클릭 후 추가 동작 필요 시
            }}
          />
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
