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

/**
 * 렌더링된 HTML 내 `data-collapsible="true"` 속성의 `<pre>` 코드 블록에
 * 접이식 토글 버튼을 주입한다.
 *
 * 에디터에서 15줄 이상의 코드 블록에 data-collapsible 속성이 저장되며,
 * 공개 게시글 페이지에서 이를 감지해 미리보기(3줄) + 펼치기 버튼 UI를 추가한다.
 *
 * @param {Element} containerEl - 탐색할 DOM 컨테이너 요소
 * @returns {Function} 이벤트 리스너를 제거하는 cleanup 함수
 */
export function injectCollapsibleCodeBlocks(containerEl) {
  if (!containerEl) return () => {};

  const PREVIEW_LINES = 3;
  const cleanups = [];

  // data-collapsible-injected 속성으로 중복 주입 방지 (idempotency)
  containerEl.querySelectorAll('pre[data-collapsible="true"]:not([data-collapsible-injected])').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    const lines = code.textContent.replace(/\n$/, '').split('\n');
    if (lines.length <= PREVIEW_LINES) return;

    const previewText = lines.slice(0, PREVIEW_LINES).join('\n');
    let collapsed = true;

    // 원본 pre에 처리 완료 마킹 및 접근성 식별자 부여
    pre.setAttribute('data-collapsible-injected', 'true');

    // 접근성: 기존 pre.id 재사용, 없을 때만 충돌 없는 고유 id 생성
    const fullId = pre.id || `collapsible-code-${Math.random().toString(36).slice(2, 8)}-full`;
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
    btn.style.cssText =
      'display:block;margin-top:4px;padding:2px 10px;font-size:0.75rem;' +
      'background:transparent;border:1px solid #d1d5db;border-radius:4px;' +
      'cursor:pointer;color:#6b7280;';

    const wrapper = document.createElement('div');
    wrapper.appendChild(previewPre);
    wrapper.appendChild(btn);

    const handleToggle = () => {
      collapsed = !collapsed;
      if (collapsed) {
        previewPre.hidden = false;
        previewPre.setAttribute('aria-hidden', 'false');
        pre.hidden = true;
        pre.setAttribute('aria-hidden', 'true');
        btn.textContent = `코드 펼치기 (${lines.length}줄)`;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        previewPre.hidden = true;
        previewPre.setAttribute('aria-hidden', 'true');
        pre.hidden = false;
        pre.setAttribute('aria-hidden', 'false');
        btn.textContent = '코드 접기';
        btn.setAttribute('aria-expanded', 'true');
      }
    };

    btn.addEventListener('click', handleToggle);
    cleanups.push(() => btn.removeEventListener('click', handleToggle));

    // pre를 DOM에서 wrapper 위치로 교체한 뒤 wrapper 내부에 삽입 (btn 앞)
    pre.replaceWith(wrapper);
    wrapper.insertBefore(pre, btn);
  });

  return () => cleanups.forEach((fn) => fn());
}

