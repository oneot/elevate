import DOMPurify from 'dompurify';

// 컨테이너 공개 접근 전환 후 blob URL 변환 불필요 — 원본 반환
export function replaceBlobUrls(html) {
  return html || '';
}

// 서버에서 반환된 HTML을 XSS 방지를 위해 sanitize
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

// <article> 내 heading 요소에 ID 자동 주입 (TableOfContents TOC용)
// rehype-slug가 빌드 타임에 하던 역할을 클라이언트에서 대체
export function injectHeadingIds(containerEl) {
  if (!containerEl) return;
  const headings = containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const usedIds = new Set();

  headings.forEach((el) => {
    if (el.id) return; // 이미 ID가 있으면 skip
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
