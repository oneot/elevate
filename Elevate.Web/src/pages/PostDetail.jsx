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
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GlassDocLayout from '../components/layout/GlassDocLayout';
import TableOfContents from '../components/posts/TableOfContents';
import SeriesNavigator from '../components/posts/SeriesNavigator';
import { getPost, getLatestAgenthonPost } from '../api/posts';
import { sanitizeHtml, injectHeadingIds, injectLinkHandlers, injectCollapsibleCodeBlocks, optimizeEmbeddedMedia } from '../utils/html';
import { formatDateKo } from '../utils/url';
import { POST_DETAIL_VALID_CATEGORIES, CATEGORY_DISPLAY_NAMES, getCategoryListRoute } from '../constants/categories';
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from '../constants/seo';
import { useSeriesNavigation } from '../hooks/useSeriesNavigation';
import NotFound from './NotFound';

const VALID_CATEGORIES = POST_DETAIL_VALID_CATEGORIES;

function getStableOgImage(thumbnail) {
    const imageUrl = typeof thumbnail === 'string' ? thumbnail : thumbnail?.url;
    if (!imageUrl || imageUrl.includes('blob.core.windows.net')) {
        return DEFAULT_OG_IMAGE;
    }
    return imageUrl;
}

/**
 * @param {object}  props
 * @param {string}  [props.categoryProp]  URL 파라미터 대신 사용할 카테고리 (예: "agenthon")
 * @param {boolean} [props.useLatest]     true면 해당 카테고리의 최신 게시글을 자동 조회한다.
 */
const PostDetail = ({ categoryProp, useLatest = false }) => {
    const { category: categoryParam, postId: postIdParam } = useParams();
    const navigate = useNavigate();

    // categoryProp이 있으면 URL 파라미터보다 우선한다 (고정 URL 라우트용)
    const normalizedCategory = (categoryProp || categoryParam)?.toLowerCase();

    // useLatest 모드일 때 getLatestAgenthonPost()로 최신 게시글을 직접 로드한다.
    // 목록 API + 상세 API 2단계 호출이 이미 캡슐화되어 있으므로 중복 구현 없이 재사용한다.
    const [resolvedPostId, setResolvedPostId] = useState(postIdParam ?? null);
    const [loadingLatest, setLoadingLatest] = useState(useLatest);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        // useLatest 모드는 현재 agenthon 카테고리에서만 지원한다.
        // 다른 카테고리에서 useLatest=true로 재사용할 경우 잘못된 게시글을 로드하지 않도록 가드한다.
        if (!useLatest || !normalizedCategory) return;
        if (normalizedCategory !== 'agenthon') return;
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingLatest(true);
        getLatestAgenthonPost()
            .then((post) => {
                if (cancelled) return;
                if (post?.slug) {
                    setResolvedPostId(post.slug);
                } else {
                    // 최신 게시글이 없으면 notFound 처리하여 무한 로딩 방지
                    setResolvedPostId(null);
                    setNotFound(true);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (cancelled) return;
                setResolvedPostId(null);
                setNotFound(true);
                setLoading(false);
            })
            .finally(() => { if (!cancelled) setLoadingLatest(false); });
        return () => { cancelled = true; };
    }, [normalizedCategory, useLatest]);

    // URL 파라미터가 변경될 때 resolvedPostId를 동기화한다 (일반 /:category/:postId 라우트용)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!useLatest) setResolvedPostId(postIdParam ?? null);
    }, [postIdParam, useLatest]);

    const postId = resolvedPostId;

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

    // HTML 콘텐츠 렌더링 후 heading ID 주입(TableOfContents용) + 링크 핸들러 주입(SPA 이동/외부 링크)
    // + data-collapsible="true" 코드 블록에 접이식 토글 버튼 주입
    useLayoutEffect(() => {
        if (!contentRef.current || !post?.contentMarkdown) return;
        optimizeEmbeddedMedia(contentRef.current);
        injectHeadingIds(contentRef.current);
        const cleanupLinks = injectLinkHandlers(contentRef.current, navigate);
        const cleanupCollapsible = injectCollapsibleCodeBlocks(contentRef.current);
        return () => {
            cleanupLinks();
            cleanupCollapsible();
        };
    }, [post?.contentMarkdown, navigate]);

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

    // 유효하지 않은 카테고리인 경우 404 페이지를 직접 렌더링 (<Navigate to="*">는 잘못된 상대 경로로 이동)
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        return <NotFound />;
    }

    if (notFound) {
        return <NotFound />;
    }

    const categoryDisplayName = CATEGORY_DISPLAY_NAMES[normalizedCategory];
    // 로딩 중에는 URL의 postId를 임시 제목으로 사용한다.
    const postTitle = post?.title || postId;
    const pageTitle = `${postTitle ?? ''} | ${categoryDisplayName} | Microsoft Elevate`;
    const pageDescription = post?.excerpt || `${postTitle ?? ''} - ${categoryDisplayName} 블로그 포스트입니다.`;
    const pageUrl = canonicalUrl(useLatest ? '/agenthon' : `/${normalizedCategory}/${postId || ''}`);
    const ogImage = getStableOgImage(post?.thumbnail);

    // GlassDocLayout에 전달할 breadcrumb 목록.
    // 로딩이 완료되기 전에는 마지막 항목이 postId(슬러그)로 표시된다.
    // getCategoryListRoute로 카테고리별 실제 목록 경로를 사용하여 존재하지 않는 링크를 방지한다.
    const crumbs = [
        { label: 'Home', to: '/' },
        { type: 'sep' },
        { label: categoryDisplayName, to: getCategoryListRoute(normalizedCategory) },
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
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={pageUrl} />
                <meta property="og:site_name" content={SITE_NAME} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:type" content="article" />
                <meta property="og:locale" content="ko_KR" />
                {post?.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
                {post?.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={ogImage} />
            </Helmet>

            <GlassDocLayout
                crumbs={crumbs}
                leftAside={leftAside}
                rightAside={rightAside}
                reserveLeftAside
                reserveRightAside
                footer={footer}
            >
                {(loading || loadingLatest) && (
                    <div className="min-h-[520px] py-8 text-center text-slate-500">
                        로딩 중...
                    </div>
                )}

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
