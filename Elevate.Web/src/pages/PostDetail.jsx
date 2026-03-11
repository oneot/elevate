import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import TableOfContents from '../components/TableOfContents';
import SeriesNavigator from '../components/SeriesNavigator';

const VALID_CATEGORIES = ['m365', 'copilot', 'teams', 'minecraft', 'excel', 'onenote'];

const CATEGORY_DISPLAY_NAMES = {
    'm365': 'M365 개요',
    'copilot': 'Copilot',
    'teams': 'Teams',
    'minecraft': 'Minecraft',
    'excel': 'Excel',
    'onenote': 'OneNote'
};

const PostDetail = () => {
    const { category, postId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const seriesParam = (searchParams.get('series') || '').trim();

    // 카테고리를 소문자로 변환하여 검증
    const normalizedCategory = category?.toLowerCase();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [seriesByCategory, setSeriesByCategory] = useState({});

    useEffect(() => {
        if (!normalizedCategory || !postId) return;
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setNotFound(false);
            try {
                const postRes = await fetch(`/api/posts/${normalizedCategory}--${postId}.json`, { signal: controller.signal });
                if (!postRes.ok) {
                    setNotFound(true);
                    return;
                }
                const postData = await postRes.json();
                setPost(postData);

                try {
                    const listRes = await fetch('/api/posts.json', { signal: controller.signal });
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        setSeriesByCategory(listData.seriesByCategory || {});
                    } else {
                        setSeriesByCategory({});
                    }
                } catch (seriesErr) {
                    if (seriesErr.name !== 'AbortError') {
                        console.warn('PostDetail series index fetch error:', seriesErr);
                    }
                    setSeriesByCategory({});
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('PostDetail fetch error:', err);
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
        return () => controller.abort();
    }, [normalizedCategory, postId]);

    const availableSeriesOptions = useMemo(() => {
        if (!normalizedCategory) return [];
        const categorySeries = seriesByCategory[normalizedCategory];
        if (!categorySeries) return [];

        return Object.entries(categorySeries)
            .map(([name, posts]) => ({
                key: name,
                title: name,
                posts: Array.isArray(posts) ? posts : [],
            }))
            .filter((item) => item.posts.length >= 2)
            .sort((a, b) => {
                if (b.posts.length !== a.posts.length) return b.posts.length - a.posts.length;
                return a.title.localeCompare(b.title);
            });
    }, [normalizedCategory, seriesByCategory]);

    const selectedSeriesKey = useMemo(() => {
        if (availableSeriesOptions.length === 0) return '';
        if (seriesParam && availableSeriesOptions.some((item) => item.key === seriesParam)) {
            return seriesParam;
        }
        if (post?.series && availableSeriesOptions.some((item) => item.key === post.series)) {
            return post.series;
        }
        return availableSeriesOptions[0].key;
    }, [availableSeriesOptions, seriesParam, post?.series]);

    const selectedSeries = useMemo(() => {
        if (!selectedSeriesKey) return null;
        return availableSeriesOptions.find((item) => item.key === selectedSeriesKey) || null;
    }, [availableSeriesOptions, selectedSeriesKey]);

    const selectedSeriesPosts = selectedSeries?.posts || [];

    const currentSeriesIndex = useMemo(() => {
        if (!post || selectedSeriesPosts.length === 0) return -1;
        const byIdIndex = selectedSeriesPosts.findIndex((item) => item.id === post.id);
        if (byIdIndex > -1) return byIdIndex;
        if (post.seriesOrder == null) return -1;
        return selectedSeriesPosts.findIndex((item) => item.seriesOrder === post.seriesOrder);
    }, [post, selectedSeriesPosts]);

    const prevPost = currentSeriesIndex > 0 ? selectedSeriesPosts[currentSeriesIndex - 1] : null;
    const nextPost = currentSeriesIndex > -1 && currentSeriesIndex < selectedSeriesPosts.length - 1
        ? selectedSeriesPosts[currentSeriesIndex + 1]
        : null;

    const hasSeriesNavigator = Boolean(post?.series && selectedSeriesPosts.length > 0);
    const backToListHref = `/${normalizedCategory}`;

    const buildPostHref = (targetPost) => {
        if (!targetPost) return '#';
        const params = new URLSearchParams();
        if (selectedSeriesKey) {
            params.set('series', selectedSeriesKey);
        }
        const query = params.toString();
        return `/${normalizedCategory}/${targetPost.slug}${query ? `?${query}` : ''}`;
    };

    const updateSeriesQuery = (seriesKey) => {
        const newParams = new URLSearchParams(searchParams);
        if (seriesKey) {
            newParams.set('series', seriesKey);
        } else {
            newParams.delete('series');
        }
        setSearchParams(newParams, { replace: false });
    };

    useEffect(() => {
        if (!post) return;

        if (availableSeriesOptions.length === 0) {
            if (seriesParam) {
                updateSeriesQuery('');
            }
            return;
        }

        if (selectedSeriesKey && seriesParam !== selectedSeriesKey) {
            updateSeriesQuery(selectedSeriesKey);
        }
    }, [post, availableSeriesOptions, selectedSeriesKey, seriesParam]);

    // 유효하지 않은 카테고리인 경우 404로 리다이렉트
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        return <Navigate to="*" replace />;
    }

    if (notFound) {
        return <Navigate to="*" replace />;
    }

    const categoryDisplayName = CATEGORY_DISPLAY_NAMES[normalizedCategory];
    const postTitle = post?.title || postId;

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            <Helmet>
                <title>{postTitle} | {categoryDisplayName} | Microsoft Elevate</title>
                <meta name="description" content={`${postTitle} - ${categoryDisplayName} 블로그 포스트입니다.`} />
                <meta property="og:title" content={`${postTitle} | ${categoryDisplayName} | Microsoft Elevate`} />
                <meta property="og:description" content={`${postTitle} - ${categoryDisplayName} 블로그 포스트입니다.`} />
            </Helmet>

            {/* Background Blobs */}
            <div className="pastel-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Post Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 py-12">
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="clean-card no-hover rounded-[2.25rem] sm:rounded-[3rem] p-7 sm:p-10 lg:p-12 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
                                {/* Breadcrumb */}
                                <div className="text-sm text-slate-500 mb-6">
                                    <Link to="/" className="hover:text-ms-blue transition-colors">Home</Link>
                                    <span className="mx-2">/</span>
                                    <Link to={`/${normalizedCategory}`} className="hover:text-ms-blue transition-colors">{categoryDisplayName}</Link>
                                </div>

                                {loading && <div className="text-center py-8 text-slate-500">로딩 중...</div>}

                                {!loading && post && (
                                    <>
                                        {/* Post Title */}
                                        <h1 
                                            id="post-title"
                                            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight leading-tight">
                                            {post.title}
                                        </h1>

                                        {/* Meta */}
                                        <div className="mb-6 flex items-center gap-4 text-sm text-slate-500">
                                            <span className="inline-block px-4 py-2 bg-ms-blue/10 text-ms-blue rounded-full font-medium">
                                                {categoryDisplayName}
                                            </span>
                                            <span>{post.publishedAt}</span>
                                        </div>

                                        {/* Tags */}
                                        {Array.isArray(post.tags) && post.tags.length > 0 && (
                                            <div className="mb-8 flex flex-wrap gap-2 text-sm">
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Post Body */}
                                        <article className="prose prose-lg max-w-none text-slate-700">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]}>
                                                {post.content}
                                            </ReactMarkdown>
                                        </article>

                                        {(prevPost || nextPost) && (
                                            <div className="mt-10 border-t border-slate-200 pt-6">
                                                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center justify-center">
                                                    {prevPost && (
                                                        <Link
                                                            to={buildPostHref(prevPost)}
                                                            className="h-9 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                                                        >
                                                            이전 글
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to={backToListHref}
                                                        className="h-9 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                                                    >
                                                        목록으로
                                                    </Link>

                                                    {nextPost && (
                                                        <Link
                                                            to={buildPostHref(nextPost)}
                                                            className="h-9 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                                                        >
                                                            다음 글
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Series + Table of Contents Sidebar */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="space-y-4 lg:sticky lg:top-4">
                                {!loading && post && hasSeriesNavigator && (
                                    <SeriesNavigator
                                        seriesOptions={availableSeriesOptions}
                                        selectedSeries={selectedSeriesKey}
                                        onSeriesChange={updateSeriesQuery}
                                        category={normalizedCategory}
                                        currentPostId={post.id}
                                        buildPostHref={buildPostHref}
                                        previousPost={prevPost}
                                        nextPost={nextPost}
                                        backToListHref={backToListHref}
                                        sticky={false}
                                    />
                                )}

                                {!loading && post && (
                                    <TableOfContents content={post.content} postTitle={post.title} sticky={false} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
