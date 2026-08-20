import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listSeriesByCategory } from '../api/posts';
import { getCategoryListRoute } from '../constants/categories';

export function useSeriesNavigation(normalizedCategory, post) {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesParam = (searchParams.get('series') || '').trim();

  const [seriesOptions, setSeriesOptions] = useState([]);

  useEffect(() => {
    if (!normalizedCategory) return;
    const controller = new AbortController();
    let cancelled = false;
    listSeriesByCategory(normalizedCategory, controller.signal)
      .then((data) => {
        if (cancelled) return;
        const options = (data?.items || []).map((s) => ({
          key: s.name,
          title: s.name,
          posts: s.posts || [],
        }));
        setSeriesOptions(options);
      })
      .catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setSeriesOptions([]);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [normalizedCategory]);

  const availableSeriesOptions = useMemo(() => {
    if (!normalizedCategory) return [];
    return seriesOptions.filter((item) => item.posts.length >= 2);
  }, [normalizedCategory, seriesOptions]);

  const selectedSeriesKey = useMemo(() => {
    if (availableSeriesOptions.length === 0) return '';
    if (seriesParam && availableSeriesOptions.some((item) => item.key === seriesParam)) {
      return seriesParam;
    }
    if (post?.series && availableSeriesOptions.some((item) => item.key === post.series)) {
      return post.series;
    }
    return availableSeriesOptions[0].key;
  }, [availableSeriesOptions, seriesParam, post]);

  const selectedSeries = useMemo(() => {
    if (!selectedSeriesKey) return null;
    return availableSeriesOptions.find((item) => item.key === selectedSeriesKey) || null;
  }, [availableSeriesOptions, selectedSeriesKey]);

  const selectedSeriesPosts = useMemo(() => selectedSeries?.posts || [], [selectedSeries]);

  const currentSeriesIndex = useMemo(() => {
    if (!post || selectedSeriesPosts.length === 0) return -1;
    const byIdIndex = selectedSeriesPosts.findIndex((item) => item.id === post.id);
    if (byIdIndex > -1) return byIdIndex;
    if (post.seriesOrder == null) return -1;
    return selectedSeriesPosts.findIndex((item) => item.seriesOrder === post.seriesOrder);
  }, [post, selectedSeriesPosts]);

  const prevPost = currentSeriesIndex > 0 ? selectedSeriesPosts[currentSeriesIndex - 1] : null;
  const nextPost =
    currentSeriesIndex > -1 && currentSeriesIndex < selectedSeriesPosts.length - 1
      ? selectedSeriesPosts[currentSeriesIndex + 1]
      : null;

  const hasSeriesNavigator = Boolean(post?.series && selectedSeriesPosts.length > 0);

  const backToListHref = getCategoryListRoute(normalizedCategory);

  const buildPostHref = useCallback(
    (targetPost) => {
      if (!targetPost) return '#';
      const params = new URLSearchParams();
      if (selectedSeriesKey) {
        params.set('series', selectedSeriesKey);
      }
      const query = params.toString();
      return `/${normalizedCategory}/${targetPost.slug}${query ? `?${query}` : ''}`;
    },
    [normalizedCategory, selectedSeriesKey]
  );

  const updateSeriesQuery = useCallback(
    (seriesKey, options = {}) => {
      const { replace = false } = options;
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (seriesKey) {
            newParams.set('series', seriesKey);
          } else {
            newParams.delete('series');
          }
          return newParams;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  // 시리즈 쿼리 자동 URL 동기화
  useEffect(() => {
    if (!post) return;

    if (availableSeriesOptions.length === 0) {
      if (seriesParam) {
        updateSeriesQuery('', { replace: true });
      }
      return;
    }

    if (selectedSeriesKey && seriesParam !== selectedSeriesKey) {
      updateSeriesQuery(selectedSeriesKey, { replace: true });
    }
  }, [post, availableSeriesOptions, selectedSeriesKey, seriesParam, updateSeriesQuery]);

  return {
    seriesOptions,
    availableSeriesOptions,
    selectedSeriesKey,
    selectedSeries,
    selectedSeriesPosts,
    currentSeriesIndex,
    prevPost,
    nextPost,
    hasSeriesNavigator,
    updateSeriesQuery,
    buildPostHref,
    backToListHref,
  };
}
