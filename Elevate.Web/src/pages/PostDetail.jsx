/**
 * @file PostDetail.jsx
 * @description 개별 게시글 상세 페이지.
 *
 * URL 파라미터(`/:category/:postId`)로 게시글을 API에서 가져와 렌더링한다.
 * GlassDocLayout을 기반으로 하며, 좌측(TOC)·우측(SeriesNavigator) 사이드바를 지원한다.
 *
 * - `AbortController`로 라우트 전환 시 진행 중인 fetch를 취소한다.
 * - HTML 콘텐츠는 `sanitizeHtml`(DOMPurify)로 소독 후 `dangerouslySetInnerHTML`로 렌더링한다.
 * - 렌더링 후 `injectHeadingIds`로 heading id를 주입하여 좌측 TableOfContents와 연동한다.
 * - 게시글이 시리즈에 속하면 우측에 SeriesNavigator를, 하단 footer에 이전/다음 버튼을 표시한다.
 */
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import GlassDocLayout from '../components/layout/GlassDocLayout';
import TableOfContents from '../components/posts/TableOfContents';
import SeriesNavigator from '../components/posts/SeriesNavigator';
import { getPost, listPosts } from '../api/posts';
import { sanitizeHtml, injectHeadingIds } from '../utils/html';
import { formatDateKo } from '../utils/url';
import { POST_DETAIL_VALID_CATEGORIES, CATEGORY_DISPLAY_NAMES } from '../constants/categories';
import { useSeriesNavigation } from '../hooks/useSeriesNavigation';

const VALID_CATEGORIES = POST_DETAIL_VALID_CATEGORIES;

/**
 * @param {object}  props
 * @param {string}  [props.categoryProp]  URL 파라미터 대신 사용할 카테고리 (예: "agenthon")
 * @param {boolean} [props.useLatest]     true면 해당 카테고리의 최신 게시글을 자동 조회한다.
 */
const PostDetail = ({ categoryProp, useLatest = false }) => {
    const { category: categoryParam, postId: postIdParam } = useParams();

    // categoryProp이 있으면 URL 파라미터보다 우선한다 (고정 URL 라우트용)
    const normalizedCategory = (categoryProp || categoryParam)?.toLowerCase();

    // useLatest 모드일 때 최신 게시글 slug를 동적으로 조회하여 설정한다
    const [resolvedPostId, setResolvedPostId] = useState(postIdParam ?? null);
    const [loadingLatest, setLoadingLatest] = useState(useLatest);

    useEffect(() => {
        if (!useLatest || !normalizedCategory) return;
        setLoadingLatest(true);
        listPosts({ category: normalizedCategory, limit: 1, page: 1 })
            .then((data) => {
                const slug = data?.items?.[0]?.slug ?? null;
                setResolvedPostId(slug);
            })
            .catch(() => setResolvedPostId(null))
            .finally(() => setLoadingLatest(false));
    }, [normalizedCategory, useLatest]);

    // URL 파라미터가 변경될 때 resolvedPostId를 동기화한다 (일반 /:category/:postId 라우트용)
    useEffect(() => {
        if (!useLatest) setResolvedPostId(postIdParam ?? null);
    }, [postIdParam, useLatest]);

    const postId = resolvedPostId;

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
    // 로딩 중에는 URL의 postId를 임시 제목으로 사용한다.
    const postTitle = post?.title || postId;

    // GlassDocLayout에 전달할 breadcrumb 목록.
    // 로딩이 완료되기 전에는 마지막 항목이 postId(슬러그)로 표시된다.
    const crumbs = [
        { label: 'Home', to: '/' },
        { type: 'sep' },
        { label: categoryDisplayName, to: `/${normalizedCategory}` },
        { type: 'sep' },
        { label: postTitle },
    ];

    // 게시글 로드 완료 시 좌측 TOC를 표시한다.
    const leftAside = !loading && !loadingLatest && post
        ? <TableOfContents contentMarkdown={post.contentMarkdown} postTitle={post.title} sticky={false} />
        : null;

    // 시리즈가 있을 때만 우측 SeriesNavigator를 표시한다.
    const rightAside = !loading && !loadingLatest && post && hasSeriesNavigator
        ? (
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
        )
        : null;

    // 시리즈가 있을 때 footer에 이전/다음/목록 버튼을 표시한다.
    // 모바일에서 rightAside(SeriesNavigator)가 숨겨지므로 footer로 대체 내비게이션을 제공한다.
    const footer = (prevPost || nextPost)
        ? (
            <div>
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
        )
        : null;

    return (
        <>
            {/* Helmet은 GlassDocLayout 외부에 위치해도 React Portal로 <head>에 주입된다. */}
            <Helmet>
                <title>{`${postTitle ?? ''} | ${categoryDisplayName} | Microsoft Elevate`}</title>
                <meta name="description" content={post?.excerpt || `${postTitle ?? ''} - ${categoryDisplayName} 블로그 포스트입니다.`} />
                <meta property="og:title" content={`${postTitle ?? ''} | ${categoryDisplayName} | Microsoft Elevate`} />
                <meta property="og:description" content={post?.excerpt || `${postTitle ?? ''} - ${categoryDisplayName} 블로그 포스트입니다.`} />
                {(post?.thumbnail?.signedUrl || post?.thumbnail?.url || (typeof post?.thumbnail === 'string' && post?.thumbnail)) && (
                    <meta property="og:image" content={post.thumbnail?.signedUrl || post.thumbnail?.url || post.thumbnail} />
                )}
            </Helmet>

            <GlassDocLayout
                crumbs={crumbs}
                leftAside={leftAside}
                rightAside={rightAside}
                footer={footer}
            >
                {(loading || loadingLatest) && <div className="text-center py-8 text-slate-500">로딩 중...</div>}

                {!loading && !loadingLatest && post && (
                    <>
                        {/* Post Title */}
                        <h1
                            id="post-title"
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight leading-tight"
                        >
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="mb-6 flex items-center gap-4 text-sm text-slate-500">
                            <span className="inline-block px-4 py-2 bg-ms-blue/10 text-ms-blue rounded-full font-medium">
                                {categoryDisplayName}
                            </span>
                            <span>{formatDateKo(post.publishedAt)}</span>
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
                    </>
                )}
            </GlassDocLayout>
        </>
    );
};

export default PostDetail;
