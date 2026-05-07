import { useEffect, useRef, useState } from 'react';
import { getPost } from '../lib/postsApi';
import { injectHeadingIds } from '../lib/htmlUtils';

export function usePostContent(category, slug) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const contentRef = useRef(null);

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
    }
  }, [content]);

  return { content, loading, error, contentRef };
}
