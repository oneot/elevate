import DOMPurify from 'dompurify';
import { API_BASE } from './apiClient';

const BLOB_URL_PATTERN = /https:\/\/[a-z0-9]+\.blob\.core\.windows\.net\/[^/]+\/(uploads\/[^"'\s>]+)/g;

// Azure Blob Storage URL을 이미지 프록시 URL로 교체 (공개 접근 불가 환경 대응)
export function replaceBlobUrls(html) {
  if (!html) return '';
  return html.replace(BLOB_URL_PATTERN, (_, blobPath) =>
    `${API_BASE}/image?path=${encodeURIComponent(blobPath)}`
  );
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
