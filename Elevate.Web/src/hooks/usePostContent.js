/**
 * @file usePostContent.js
 * @description 게시글 상세 콘텐츠를 API에서 불러오고, 렌더링 후 DOM을 후처리하는 커스텀 훅.
 *
 * 반환값의 `contentRef`를 게시글 본문 컨테이너 요소에 연결하면,
 * 콘텐츠가 DOM에 반영된 직후 heading id 주입과 링크 핸들러 등록이 자동으로 수행된다.
 *
 * @see injectHeadingIds - 목차(TableOfContents)가 heading id에 의존하므로 렌더 후 반드시 호출
 * @see injectLinkHandlers - SPA 내부 링크를 React Router로 처리하기 위해 필요
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPost } from '../api/posts';
import { injectHeadingIds, injectLinkHandlers } from '../utils/html';

/**
 * 게시글 콘텐츠를 불러오고 DOM 후처리를 담당하는 훅.
 *
 * @param {string} category - 게시글 카테고리 (URL 세그먼트)
 * @param {string} slug - 게시글 슬러그 (URL 세그먼트)
 * @returns {{ content: string, loading: boolean, error: boolean, contentRef: React.RefObject }}
 */
export function usePostContent(category, slug) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // ─── 콘텐츠 fetch ────────────────────────────────────────────────────
  useEffect(() => {
    // cancelled 플래그: 컴포넌트가 unmount되거나 category/slug가 바뀐 후
    // 이전 비동기 콜백이 setState를 호출하는 race condition을 방지한다.
    let cancelled = false;
    setContent('');
    setLoading(true);
    setError(false);
    getPost(category, slug)
      .then((post) => { if (!cancelled) setContent(post.contentMarkdown || ''); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, slug]);

  // ─── DOM 후처리 ───────────────────────────────────────────────────────
  useEffect(() => {
    if (contentRef.current && content) {
      // dangerouslySetInnerHTML이 DOM에 반영된 직후 실행된다.
      // heading id를 주입해야 TableOfContents가 올바른 앵커를 참조할 수 있다.
      injectHeadingIds(contentRef.current);
      // 내부/외부/hash 링크 동작을 복원한다. cleanup 함수로 이벤트 리스너를 해제한다.
      const cleanup = injectLinkHandlers(contentRef.current, navigate);
      return cleanup;
    }
  }, [content, navigate]);

  return { content, loading, error, contentRef };
}
