import DOMPurify from 'dompurify';

export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

export function injectHeadingIds(containerEl) {
  if (!containerEl) return;
  const headings = containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const usedIds = new Set();

  headings.forEach((el) => {
    if (el.id) return;
    const base = el.textContent
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-가-힣]/g, '');
    let id = base || 'heading';
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${base}-${suffix++}`;
    }
    usedIds.add(id);
    el.id = id;
  });
}

// 렌더링된 HTML 내 <a> 링크 동작을 복원한다.
// - 외부 링크: target="_blank" + rel="noopener noreferrer" 주입
// - hash anchor (#id): scrollIntoView smooth 처리
// - 내부 링크 (/path): SPA navigate() 호출
// 이벤트 위임 방식으로 listener 중복 방지, cleanup 함수를 반환한다.
export function injectLinkHandlers(containerEl, navigate) {
  if (!containerEl) return () => {};

  containerEl.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('/') || href.startsWith('#')) return;
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });

  const handleClick = (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  containerEl.addEventListener('click', handleClick);
  return () => containerEl.removeEventListener('click', handleClick);
}
