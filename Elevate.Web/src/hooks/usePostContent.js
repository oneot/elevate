import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPost } from '../api/posts';
import { injectHeadingIds, injectLinkHandlers } from '../utils/html';

export function usePostContent(category, slug) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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

  useEffect(() => {
    if (contentRef.current && content) {
      injectHeadingIds(contentRef.current);
      const cleanup = injectLinkHandlers(contentRef.current, navigate);
      return cleanup;
    }
  }, [content, navigate]);

  return { content, loading, error, contentRef };
}
