/**
 * @file PostDetail.jsx
 * @description 개별 게시글 상세 페이지.
 *
 * URL 파라미터(`/:category/:postId`)로 게시글을 API에서 가져와 렌더링한다.
 * - `AbortController`로 라우트 전환 시 진행 중인 fetch를 취소한다.
 * - HTML 콘텐츠는 `sanitizeHtml`(DOMPurify)로 소독 후 `dangerouslySetInnerHTML`로 렌더링한다.
 * - 렌더링 후 `injectHeadingIds`로 heading id를 주입하여 좌측 TableOfContents와 연동한다.
 * - 게시글이 시리즈에 속하면 우측에 SeriesNavigator를 표시한다.
 */
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import TableOfContents from '../components/posts/TableOfContents';
import SeriesNavigator from '../components/posts/SeriesNavigator';
import { getPost } from '../api/posts';
import { sanitizeHtml, injectHeadingIds } from '../utils/html';
import { POST_DETAIL_VALID_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '../constants/categories';
import { useSeriesNavigation } from '../hooks/useSeriesNavigation';

const VALID_CATEGORIES = POST_DETAIL_VALID_CATEGORIES;

const PostDetail = () => {
    const { category, postId } = useParams();

    // 카테고리를 소문자로 변환하여 검증
    const normalizedCategory = category?.toLowerCase();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!normalizedCategory || !postId) return;
        // AbortController: 라우트 전환 시 이전 fetch를 취소하여 응답이 뒤늦게 도착해도
        // 현재 페이지의 상태를 덮어쓰지 않도록 한다.
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setNotFound(false);
            try {
                const postData = await getPost(normalizedCategory, postId, { signal: controller.signal });
                setPost(postData);
            } catch (err) {
                if (err.name === 'AbortError') return;
                if (err.status === 404) {
                    setNotFound(true);
                } else {
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

    // HTML 콘텐츠 렌더링 후 heading ID 주입 (TableOfContents용)
    useEffect(() => {
        if (contentRef.current && post?.contentMarkdown) {
            injectHeadingIds(contentRef.current);
        }
    }, [post?.contentMarkdown]);

    const {
        availableSeriesOptions,
        selectedSeriesKey,
        prevPost,
        nextPost,
        hasSeriesNavigator,
        updateSeriesQuery,
        buildPostHref,
        backToListHref,
    } = useSeriesNavigation(normalizedCategory, post);

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
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_3.4fr_1fr] gap-6">
                        {/* Table of Contents Sidebar (Left) */}
                        <div className="hidden lg:block min-w-0">
                            <div className="lg:sticky lg:top-4">
                                {!loading && post && (
                                    <TableOfContents contentMarkdown={post.contentMarkdown} postTitle={post.title} sticky={false} />
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="min-w-0">
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

                                        {/* 유튜브 임베드 카드 (frontmatter에 youtube 필드가 있을 때) */}
                                        {post.youtube && (
                                            <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center shadow-lg">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${post.youtube}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        )}

                                        {/* Post Body */}
                                        <article>
                                            <div
                                                ref={contentRef}
                                                className="prose prose-slate max-w-none post-content"
                                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.contentMarkdown || '') }}
                                            />
                                        </article>

                                        {(prevPost || nextPost) && (
                                            <div className="mt-10 border-t border-white/60 pt-6">
                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                                    시리즈 이동
                                                </div>
                                                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center justify-center rounded-xl border border-white/60 bg-white/70 backdrop-blur px-2.5 py-2">
                                                    {prevPost && (
                                                        <Link
                                                            to={buildPostHref(prevPost)}
                                                            className="h-9 rounded-md border border-white/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                                                        >
                                                            이전 글
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to={backToListHref}
                                                        className="h-9 rounded-md border border-white/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
                                                    >
                                                        목록으로
                                                    </Link>

                                                    {nextPost && (
                                                        <Link
                                                            to={buildPostHref(nextPost)}
                                                            className="h-9 rounded-md border border-white/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 hover:border-ms-blue/40 hover:text-ms-blue transition-colors text-center inline-flex items-center justify-center"
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

                        {/* Series Sidebar (Right) */}
                        <div className="hidden lg:block min-w-0">
                            <div className="lg:sticky lg:top-4">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
