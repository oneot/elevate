import { useEffect, useState, useRef } from 'react';

// DOM의 제목 요소에서 실제 ID를 읽기 (rehype-slug로 생성된 ID)
const extractHeadingsFromDOM = () => {
  const headings = [];
  const headingElements = document.querySelectorAll('article h1, article h2, article h3');

  console.log('🔍 extractHeadingsFromDOM - found elements:', headingElements.length);

  headingElements.forEach((element) => {
    console.log(`  - ${element.tagName}: id="${element.id}", text="${element.textContent}"`);
    if (element.id) {
      headings.push({
        id: element.id,
        text: element.textContent || element.innerText,
        level: parseInt(element.tagName[1], 10)
      });
    }
  });

  console.log('✅ extracted headings:', headings);
  return headings;
};

// 평탄한 배열을 중첩 구조로 변환
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

// 목차 아이템 렌더링 (재귀)
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
            console.log('🔗 Clicked on post title');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onLinkClick();
          }}
        >
          {heading.text}
        </a>
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
          console.log('🔗 Clicked on heading:', heading.id);
          const element = document.getElementById(heading.id);
          console.log('📍 Found element:', element);
          if (element) {
            console.log('📜 Scrolling to:', heading.id);
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            onLinkClick();
          } else {
            console.warn('⚠️ Element not found:', heading.id);
          }
        }}
      >
        {heading.text}
      </a>
      {heading.children && heading.children.length > 0 && (
        <ul className="space-y-0">
          {heading.children.map((child) => (
            <TableOfContentsItem
              key={child.id}
              heading={child}
              activeId={activeId}
              onLinkClick={onLinkClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const TableOfContents = ({ content, postTitle }) => {
  const [activeId, setActiveId] = useState('');
  const [headings, setHeadings] = useState([]);
  const observerRef = useRef(null);

  // DOM 마크다운 렌더링 후 제목 추출
  useEffect(() => {
    // article 요소 찾기
    const article = document.querySelector('article');
    if (!article) {
      console.warn('⚠️ article element not found');
      return;
    }

    console.log('🎯 TableOfContents mounted, content prop changed');

    // 초기 추출 (약간의 딜레이 포함)
    const initialTimer = setTimeout(() => {
      console.log('⏱️ Running initial heading extraction');
      const flatHeadings = extractHeadingsFromDOM();
      
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
      }
    }, 150);

    // MutationObserver 설정 - article 내용 변경 감지
    const handleMutation = () => {
      console.log('🔄 Mutation detected, extracting headings');
      const flatHeadings = extractHeadingsFromDOM();
      
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
      }
    };

    const observer = new MutationObserver(handleMutation);
    observer.observe(article, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      clearTimeout(initialTimer);
      observer.disconnect();
    };
  }, [content, postTitle]);

  // Intersection Observer로 현재 섹션 추적
  useEffect(() => {
    if (headings.length === 0) return;

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 마크다운 렌더링된 제목 요소들 수집
    const headingElements = document.querySelectorAll('article h1, article h2, article h3');

    if (headingElements.length === 0) return;

    console.log('🔍 Setting up IntersectionObserver for', headingElements.length, 'headings');

    // Intersection Observer 생성
    const observer = new IntersectionObserver(
      (entries) => {
        // 모든 heading 요소들 중 현재 viewpoint에서 가장 상단에 보이는 것 찾기
        let visibleHeadings = [];

        entries.forEach((entry) => {
          if (entry.target.id && entry.isIntersecting) {
            visibleHeadings.push({
              id: entry.target.id,
              top: entry.boundingClientRect.top
            });
          }
        });

        // 화면의 가장 상단에 있는 제목 선택
        if (visibleHeadings.length > 0) {
          visibleHeadings.sort((a, b) => a.top - b.top);
          console.log('📌 Setting activeId to:', visibleHeadings[0].id);
          setActiveId(visibleHeadings[0].id);
        }
      },
      {
        rootMargin: '0px 0px -60% 0px' // 페이지의 상단 40%에서 감지
      }
    );

    // 모든 제목 요소 관찰
    headingElements.forEach((element) => {
      if (element.id) {
        console.log('👀 Observing:', element.id);
        observer.observe(element);
      }
    });

    observerRef.current = observer;

    // 추가: 스크롤 이벤트로 마지막 heading 감지
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('article h1, article h2, article h3');
      if (headingElements.length === 0) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 페이지 하단에 가까우면 마지막 heading 활성화
      if (scrollPosition >= documentHeight - 100) {
        const lastHeading = headingElements[headingElements.length - 1];
        if (lastHeading && lastHeading.id) {
          console.log('📍 Bottom reached, setting activeId to:', lastHeading.id);
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
    <nav className="clean-card no-hover p-4 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50">
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
