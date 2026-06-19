/**
 * @file html.js
 * @description 게시글 HTML 콘텐츠 후처리 유틸리티 모음.
 *
 * API에서 받은 HTML을 DOMPurify로 소독(sanitize)하고,
 * 렌더링된 DOM에 heading id를 주입하거나 링크 동작을 복원하는 함수를 제공한다.
 */
import DOMPurify from 'dompurify';

/**
 * XSS를 방지하기 위해 HTML 문자열을 DOMPurify로 소독한다.
 *
 * `ADD_ATTR`에 target/rel을 허용하는 이유: 서버가 외부 링크에 미리 주입한
 * `target="_blank"` 및 `rel="noopener noreferrer"` 속성을 유지해야 하기 때문이다.
 *
 * @param {string} html - 소독할 HTML 문자열
 * @returns {string} 소독된 HTML 문자열 (입력이 falsy면 빈 문자열 반환)
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

/**
 * 게시글 HTML을 렌더링 전에 소독하고 h1~h6 id를 주입한다.
 *
 * 렌더 후 DOM mutation에만 의존하면 React 재렌더나 effect 순서에 따라 기존 문서의
 * heading id가 비어 있을 수 있다. 렌더 전에 HTML 문자열 자체를 안정화해 TOC와
 * 실제 본문 앵커가 같은 id를 보게 한다.
 *
 * @param {string} html - API에서 받은 게시글 HTML 문자열
 * @returns {string} sanitize + heading id 주입이 끝난 HTML 문자열
 */
export function preparePostHtml(html) {
  const sanitized = sanitizeHtml(html);
  if (!sanitized || typeof document === 'undefined') return sanitized;

  const template = document.createElement('template');
  template.innerHTML = sanitized;
  injectHeadingIds(template.content);
  return template.innerHTML;
}

/**
 * 컨테이너 내 모든 heading(h1~h6)에 id를 주입한다.
 *
 * 이미 id가 있는 heading은 건너뛰고, 텍스트 내용을 소문자 kebab-case로 변환해 id를 생성한다.
 * 같은 텍스트를 가진 heading이 여러 개일 경우 `-1`, `-2` 접미사로 중복을 방지한다.
 * TableOfContents 컴포넌트가 이 id를 앵커 링크로 참조하므로, 콘텐츠 렌더 직후 호출해야 한다.
 *
 * @param {Element} containerEl - heading을 탐색할 DOM 컨테이너 요소
 */
export function injectHeadingIds(containerEl) {
  if (!containerEl) return;
  const headings = containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
  // 문서 내 이미 사용 중인 모든 id를 미리 수집하여 새로 생성하는 id와 충돌하지 않도록 한다.
  const usedIds = new Set(
    Array.from(containerEl.querySelectorAll('[id]')).map((el) => el.id).filter(Boolean)
  );

  headings.forEach((el) => {
    if (el.id) return;
    const base = el.textContent
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]/g, '');
    // base가 빈 문자열이면 'heading'을 fallback으로 사용한다.
    const baseId = base || 'heading';
    let id = baseId;
    let suffix = 1;
    // 동일한 id가 이미 존재하면 숫자 접미사를 붙여 고유하게 만든다.
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }
    usedIds.add(id);
    el.id = id;
  });
}

/**
 * 게시글 본문 컨테이너 내 h1~h3 요소에서 목차 항목을 추출한다.
 *
 * PostDetail이 렌더 후 heading id를 주입하므로, 목차 컴포넌트는 전역 article 대신
 * 실제 본문 컨테이너를 기준으로 이 함수를 호출한다.
 *
 * @param {Element} containerEl - 게시글 본문 DOM 컨테이너
 * @returns {{ id: string, text: string, level: number }[]}
 */
export function getPostContentHeadings(containerEl) {
  if (!containerEl) return [];

  return Array.from(containerEl.querySelectorAll('h1, h2, h3'))
    .filter((element) => element.id)
    .map((element) => ({
      id: element.id,
      text: element.textContent || element.innerText || '',
      level: parseInt(element.tagName[1], 10),
    }));
}

/**
 * 렌더링된 HTML 내 `<a>` 링크 동작을 복원한다.
 *
 * dangerouslySetInnerHTML로 삽입된 콘텐츠는 React의 이벤트 시스템 밖에 있으므로
 * 직접 이벤트 위임으로 처리해야 한다. 처리 규칙:
 * - 외부 링크: `target="_blank"` + `rel="noopener noreferrer"` 주입
 * - hash 앵커(`#id`): 해당 요소로 smooth scroll
 * - 내부 링크(`/path`): React Router의 `navigate()` 호출 (전체 페이지 새로고침 방지)
 *
 * 이벤트 위임 방식으로 개별 anchor마다 listener를 붙이는 것을 방지하고,
 * 반환된 cleanup 함수로 컴포넌트 unmount 시 listener를 해제한다.
 *
 * @param {Element} containerEl - 링크를 탐색할 DOM 컨테이너 요소
 * @param {Function} navigate - React Router의 navigate 함수
 * @returns {Function} 이벤트 리스너를 제거하는 cleanup 함수
 */
export function injectLinkHandlers(containerEl, navigate) {
  if (!containerEl) return () => {};

  // 렌더 시점에 외부 링크에 target/rel을 일괄 주입한다.
  // (클릭 이벤트 전에 속성을 확정해야 이후 분기 처리가 정확하다)
  // protocol-relative URL(//...)도 외부 링크로 간주한다.
  containerEl.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || (href.startsWith('/') && !href.startsWith('//'))) return;
    if (href.startsWith('#')) return;
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });

  const handleClick = (e) => {
    if (!(e.target instanceof Element)) return;
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    // Ctrl/Cmd/Shift/Alt+클릭, 중간 버튼, download 속성, target="_blank" 링크는
    // 브라우저 기본 동작(새 탭, 다운로드 등)을 유지한다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (anchor.hasAttribute('download')) return;
    if (anchor.getAttribute('target') === '_blank') return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      // hash 앵커: 해당 id 요소로 smooth scroll
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (href.startsWith('/') && !href.startsWith('//')) {
      // 내부 링크: React Router로 SPA 이동 (전체 페이지 reload 방지)
      e.preventDefault();
      navigate(href);
    }
  };

  containerEl.addEventListener('click', handleClick);
  return () => containerEl.removeEventListener('click', handleClick);
}

function appendClassName(element, className) {
  const current = element.className || '';
  const classes = new Set(current.split(/\s+/).filter(Boolean));
  classes.add(className);
  element.className = Array.from(classes).join(' ');
}

function toPositiveInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}

/**
 * 렌더링된 HTML 내 이미지와 iframe의 로딩 방식을 최적화한다.
 *
 * 게시글 본문 안의 이미지가 실제 LCP 후보인지 판단할 수 없으므로, 본문 미디어는
 * 기본적으로 lazy load한다. 상세 대표 이미지는 별도 컴포넌트에서 우선순위를 제어한다.
 *
 * @param {Element} containerEl - 미디어를 탐색할 DOM 컨테이너 요소
 */
export function optimizeEmbeddedMedia(containerEl) {
  if (!containerEl) return;

  containerEl.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('loading')) {
      image.setAttribute('loading', 'lazy');
    }
    if (!image.hasAttribute('decoding')) {
      image.setAttribute('decoding', 'async');
    }
    if (!image.hasAttribute('fetchpriority')) {
      image.setAttribute('fetchpriority', 'auto');
    }
    if (!image.hasAttribute('sizes')) {
      image.setAttribute('sizes', '(min-width: 1024px) 768px, 100vw');
    }
    const width = toPositiveInteger(image.getAttribute('width'));
    const height = toPositiveInteger(image.getAttribute('height'));
    if (width && height && !image.style.aspectRatio) {
      image.style.aspectRatio = `${width} / ${height}`;
    }
    appendClassName(image, 'post-content-media');
  });

  containerEl.querySelectorAll('iframe').forEach((iframe) => {
    if (!iframe.hasAttribute('loading')) {
      iframe.setAttribute('loading', 'lazy');
    }
    appendClassName(iframe, 'post-content-iframe');
  });
}

/**
 * 렌더링된 HTML 내 코드 블록에 복사 버튼을 주입한다.
 *
 * COLLAPSE_THRESHOLD 줄 이상인 `<pre>` 요소에는 접이식 토글 버튼도 함께 주입하며,
 * `data-collapsible="false"`가 명시된 블록은 접기 동작을 비활성화한다.
 *
 * @param {Element} containerEl - 탐색할 DOM 컨테이너 요소
 * @returns {Function} 이벤트 리스너를 제거하는 cleanup 함수
 */
let _collapsibleSeq = 0;
export function injectCollapsibleCodeBlocks(containerEl) {
  if (!containerEl) return () => {};

  const COLLAPSE_THRESHOLD = 10;
  const PREVIEW_LINES = 3;
  const cleanups = [];

  // data-collapsible-injected 속성으로 중복 주입 방지 (idempotency)
  containerEl.querySelectorAll('pre:not([data-collapsible-injected])').forEach((pre) => {
    let code = pre.querySelector('code');
    if (!code) {
      code = document.createElement('code');
      code.textContent = pre.textContent || '';
      pre.textContent = '';
      pre.appendChild(code);
    }

    const lines = code.textContent.replace(/\n$/, '').split('\n');
    const isCollapsible = lines.length >= COLLAPSE_THRESHOLD && pre.getAttribute('data-collapsible') !== 'false';
    const fullText = lines.join('\n');

    // 원본 pre에 처리 완료 마킹
    pre.setAttribute('data-collapsible-injected', 'true');

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = '복사';
    copyBtn.setAttribute('aria-label', '코드 복사');
    copyBtn.className = 'collapsible-code-copy';

    const handleCopy = () => {
      const write = (text) => {
        if (navigator.clipboard?.writeText) {
          return navigator.clipboard.writeText(text);
        }
        // clipboard API 미지원 시 execCommand 폴백
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          return ok ? Promise.resolve() : Promise.reject();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      write(fullText).then(() => {
        copyBtn.textContent = '복사됨 ✓';
        setTimeout(() => { copyBtn.textContent = '복사'; }, 2000);
      }).catch(() => {
        copyBtn.textContent = '복사 실패';
        setTimeout(() => { copyBtn.textContent = '복사'; }, 2000);
      });
    };

    copyBtn.addEventListener('click', handleCopy);
    cleanups.push(() => copyBtn.removeEventListener('click', handleCopy));

    const actionRow = document.createElement('div');
    actionRow.className = 'collapsible-code-actions';
    actionRow.appendChild(copyBtn);

    const wrapper = document.createElement('div');
    wrapper.className = 'collapsible-code-block';
    wrapper.appendChild(actionRow);

    if (!isCollapsible) {
      pre.replaceWith(wrapper);
      wrapper.insertBefore(pre, actionRow);
      return;
    }

    const previewText = lines.slice(0, PREVIEW_LINES).join('\n');
    let collapsed = true;

    // 접근성: 기존 pre.id 재사용, 없을 때만 모듈 스코프 카운터로 충돌 없는 id 생성
    const fullId = pre.id || `collapsible-code-${++_collapsibleSeq}`;
    if (!pre.id) pre.id = fullId;

    // 미리보기용 code 요소 (항상 DOM에 존재, hidden으로 가시성 토글)
    const previewCode = document.createElement('code');
    previewCode.className = code.className;
    previewCode.textContent = previewText;

    const previewPre = document.createElement('pre');
    previewPre.className = pre.className;
    previewPre.setAttribute('data-collapsible-injected', 'true');
    previewPre.setAttribute('aria-hidden', 'false');
    previewPre.appendChild(previewCode);

    // 전체 코드는 초기에 숨김
    pre.hidden = true;
    pre.setAttribute('aria-hidden', 'true');

    // 토글 버튼 — aria-controls는 항상 전체 코드 영역을 가리킴
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `코드 펼치기 (${lines.length}줄)`;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', fullId);
    btn.className = 'collapsible-code-toggle';
    actionRow.insertBefore(btn, copyBtn);
    wrapper.insertBefore(previewPre, actionRow);

    const ANIM_MS = 300;
    let isAnimating = false;

    const handleToggle = () => {
      if (isAnimating) return;
      isAnimating = true;
      collapsed = !collapsed;
      btn.setAttribute('aria-expanded', String(!collapsed));

      if (collapsed) {
        // ---- 접기 ----
        btn.textContent = `코드 펼치기 (${lines.length}줄)`;

        // pre를 현재 높이에서 0으로 애니메이션
        const h = pre.scrollHeight;
        pre.style.overflow = 'hidden';
        pre.style.maxHeight = `${h}px`;
        pre.style.transition = `max-height ${ANIM_MS}ms ease, opacity ${Math.round(ANIM_MS * 0.7)}ms ease`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            pre.style.maxHeight = '0';
            pre.style.opacity = '0';
          });
        });

        setTimeout(() => {
          pre.hidden = true;
          pre.setAttribute('aria-hidden', 'true');
          pre.style.maxHeight = '';
          pre.style.overflow = '';
          pre.style.transition = '';
          pre.style.opacity = '';

          // previewPre 페이드인
          previewPre.style.opacity = '0';
          previewPre.style.transition = `opacity ${Math.round(ANIM_MS * 0.4)}ms ease`;
          previewPre.hidden = false;
          previewPre.setAttribute('aria-hidden', 'false');
          requestAnimationFrame(() => { previewPre.style.opacity = '1'; });

          // 접기 후 코드블록 상단으로 스크롤
          wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          isAnimating = false;
        }, ANIM_MS);

      } else {
        // ---- 펼치기 ----
        btn.textContent = '코드 접기';

        // previewPre 페이드아웃
        previewPre.style.transition = `opacity ${Math.round(ANIM_MS * 0.4)}ms ease`;
        previewPre.style.opacity = '0';

        setTimeout(() => {
          previewPre.hidden = true;
          previewPre.setAttribute('aria-hidden', 'true');
          previewPre.style.transition = '';
          previewPre.style.opacity = '';

          // pre를 0에서 실제 높이로 애니메이션
          pre.hidden = false;
          pre.setAttribute('aria-hidden', 'false');
          pre.style.overflow = 'hidden';
          pre.style.maxHeight = '0';
          pre.style.opacity = '0';
          pre.style.transition = `max-height ${ANIM_MS}ms ease, opacity ${Math.round(ANIM_MS * 0.7)}ms ease`;
          requestAnimationFrame(() => {
            const fullH = pre.scrollHeight;
            pre.style.maxHeight = `${fullH}px`;
            pre.style.opacity = '1';
          });

          setTimeout(() => {
            pre.style.maxHeight = 'none';
            pre.style.overflow = '';
            pre.style.transition = '';
            pre.style.opacity = '';
            isAnimating = false;
          }, ANIM_MS + 50);
        }, Math.round(ANIM_MS * 0.4));
      }
    };

    btn.addEventListener('click', handleToggle);
    cleanups.push(() => btn.removeEventListener('click', handleToggle));

    // pre를 DOM에서 wrapper 위치로 교체한 뒤 wrapper 내부에 삽입 (actionRow 앞)
    pre.replaceWith(wrapper);
    wrapper.insertBefore(pre, actionRow);
  });

  return () => cleanups.forEach((fn) => fn());
}
