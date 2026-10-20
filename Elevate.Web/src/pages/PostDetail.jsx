/**
 * @file PostDetail.jsx
 * @description 개별 게시글 상세 페이지 (Apple Developer Documentation 스타일 레이아웃).
 *
 * URL 파라미터(`/:category/:postId`)로 게시글을 API에서 가져와 렌더링한다.
 * DocsShell을 기반으로 하며, 같은 카테고리의 게시글 목록(최신순)과 목차(TOC)를 왼쪽 내비게이터에 모은다.
 *
 * - `AbortController`로 라우트 전환 시 진행 중인 fetch를 취소한다.
 * - HTML 콘텐츠는 `sanitizeHtml`(DOMPurify)로 소독 후 `dangerouslySetInnerHTML`로 렌더링한다.
 * - heading id는 preparePostHtml에서 미리 주입되며, 같은 id로 내비게이터 목차와 스크롤 스파이를 만든다.
 * - 현재 글은 카테고리 글 목록 안에서 펼쳐지고, 그 아래에 목차가 중첩된다 (Apple 문서의 현재 페이지 하위 항목처럼).
 * - 본문 하단에 작성일 기준 이전(더 오래된)/다음(더 최근) 글 카드를 표시한다.
 * - 화면에서만 나눈 카테고리(M365의 Word/PowerPoint/Forms/OneDrive, Copilot Studio의 GitHub/Azure)는
 *   서버 카테고리로 조회하고, 글이 속한 화면 카테고리와 URL이 다르면 올바른 주소로 바꾼다
 *   (예: /m365/forms-share → /forms/forms-share, /copilot-studio/github-pages → /github/github-pages).
 * - 제목과 부제목은 화면용으로 다듬은 문구(constants/postText.js)를 쓴다.
 * - 사이드바 제목(카테고리 이름) 앞에는 앱 아이콘을 둔다. 아이콘이 없는 카테고리·섹션은 글자만 보여 준다.
 *   전체 게시글로 가는 길은 문서 바·브레드크럼·상단 '블로그' 메뉴가 맡아 사이드바에 뒤로 가기 링크를 두지 않는다.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import DocsShell from '../components/elevate-docs/DocsShell';
import DocsHero, { DocsArticleSkeleton } from '../components/elevate-docs/DocsHero';
import DocsNavigator, { NavHeader, NavSkeleton } from '../components/elevate-docs/DocsNavigator';
import DocsPrevNext from '../components/elevate-docs/DocsPrevNext';
import { DocsLoadError } from '../components/elevate-docs/DocsList';
import { scrollToElementSettled, useCategoryPosts, usePostOutline, useScrollSpy } from '../components/elevate-docs/docsHooks';
import { getDocsMeta, getDocsSection, getTintStyle } from '../components/elevate-docs/docsMeta';
import { getPost, getLatestAgenthonPost } from '../api/posts';
import { useApiResource } from '../hooks/useApiResource';
import { preparePostHtml, injectHeadingIds, injectLinkHandlers, injectCollapsibleCodeBlocks, optimizeEmbeddedMedia } from '../utils/html';
import { formatDateKo } from '../utils/url';
import {
    POST_DETAIL_VALID_CATEGORIES,
    POST_LIST_CATEGORIES,
    CATEGORY_DISPLAY_NAMES,
    getApiCategory,
    getCategoryListRoute,
    getDisplayCategory,
    toDisplayPost,
} from '../constants/categories';
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from '../constants/seo';
import NotFound from './NotFound';

const VALID_CATEGORIES = POST_DETAIL_VALID_CATEGORIES;

function getStableOgImage(thumbnail) {
    const imageUrl = typeof thumbnail === 'string' ? thumbnail : thumbnail?.url;
    if (!imageUrl || imageUrl.includes('blob.core.windows.net')) {
        return DEFAULT_OG_IMAGE;
    }
    return imageUrl;
}

const PostContent = memo(function PostContent({ html, navigate }) {
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        if (!contentRef.current || !html) return;
        optimizeEmbeddedMedia(contentRef.current);
        injectHeadingIds(contentRef.current);
        const cleanupLinks = injectLinkHandlers(contentRef.current, navigate);
        const cleanupCollapsible = injectCollapsibleCodeBlocks(contentRef.current);
        return () => {
            cleanupLinks();
            cleanupCollapsible();
        };
    }, [html, navigate]);

    return (
        <article className="edoc-article">
            <div
                ref={contentRef}
                className="prose prose-slate max-w-none post-content"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </article>
    );
});

function headingsToNavNodes(headings, onSelectHeading) {
    return headings.map((heading) => ({
        id: `toc:${heading.id}`,
        label: heading.text,
        kind: 'toc',
        onSelect: () => onSelectHeading(heading.id),
        children: heading.children.length ? headingsToNavNodes(heading.children, onSelectHeading) : undefined,
    }));
}

const SECTION_ROOTS = {
    update: { label: '최신 정보', to: '/update' },
    program: { label: '프로그램 소식', to: '/program-news' },
    agenthon: { label: '에이전톤', to: '/agenthon' },
};

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

    const apiCategory = getApiCategory(normalizedCategory);
    const isValidCategory = VALID_CATEGORIES.includes(normalizedCategory)
        && (!useLatest || normalizedCategory === 'agenthon');
    const loadPost = useCallback(async (signal) => {
        const postData = useLatest
            ? await getLatestAgenthonPost({ signal })
            : await getPost(apiCategory, postIdParam, { signal });
        return postData ? toDisplayPost(postData) : null;
    }, [apiCategory, postIdParam, useLatest]);
    const { data: post, loading, error, retry } = useApiResource(
        isValidCategory && (useLatest || postIdParam) ? loadPost : null,
    );
    const postId = useLatest ? post?.slug : postIdParam;
    const isReady = !loading && !error && Boolean(post);
    const preparedContentHtml = useMemo(
        () => preparePostHtml(post?.contentMarkdown || ''),
        [post?.contentMarkdown]
    );

    // 글이 실제로 속한 화면 카테고리 (예: m365 서버 글 중 Forms 글 → forms)
    const displayCategory = (post && getDisplayCategory(post)) || normalizedCategory;

    // URL 카테고리가 글의 화면 카테고리와 다르면 올바른 주소로 교체한다.
    useEffect(() => {
        if (useLatest || !post || post.slug !== postIdParam) return;
        if (displayCategory !== normalizedCategory && VALID_CATEGORIES.includes(displayCategory)) {
            navigate(`/${displayCategory}/${post.slug}`, { replace: true });
        }
    }, [useLatest, post, postIdParam, displayCategory, normalizedCategory, navigate]);

    // 같은 카테고리의 게시글 (최신순) — 사이드바와 이전/다음 글에 사용
    // 이전 글 = 더 먼저 쓴 글(목록에서 아래), 다음 글 = 더 최근에 쓴 글(목록에서 위)
    const { postsMap, errorsMap, ensure: ensureCategoryPosts } = useCategoryPosts();
    useEffect(() => {
        if (isReady && displayCategory) ensureCategoryPosts(displayCategory);
    }, [isReady, displayCategory, ensureCategoryPosts]);
    const categoryPostsLoaded = Boolean(postsMap[displayCategory]);
    const categoryPosts = useMemo(() => postsMap[displayCategory] || [], [postsMap, displayCategory]);
    const currentIndex = post ? categoryPosts.findIndex((item) => item.id === post.id) : -1;
    const prevPost = currentIndex > -1 && currentIndex < categoryPosts.length - 1 ? categoryPosts[currentIndex + 1] : null;
    const nextPost = currentIndex > 0 ? categoryPosts[currentIndex - 1] : null;
    const backToListHref = getCategoryListRoute(displayCategory);
    const buildPostHref = useCallback((item) => `/${item.category}/${item.slug}`, []);

    const outline = usePostOutline(isReady ? preparedContentHtml : '');
    const headingIds = useMemo(() => outline.headings.map((heading) => heading.id), [outline.headings]);
    const [activeHeadingId, lockHeading] = useScrollSpy(headingIds);

    const scrollToHeading = useCallback((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        lockHeading(id);
        scrollToElementSettled(element);
    }, [lockHeading]);

    const scrollToTop = useCallback(() => {
        lockHeading('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [lockHeading]);

    const navSections = useMemo(() => {
        if (!post) return [];
        const tocNodes = headingsToNavNodes(outline.tree, scrollToHeading);
        const currentNode = {
            id: `post:${post.id}`,
            label: post.title,
            emphasis: true,
            defaultExpanded: true,
            onSelect: scrollToTop,
            children: tocNodes.length ? tocNodes : undefined,
        };
        const toNode = (item) => (
            item.id === post.id ? currentNode : { id: `post:${item.id}`, label: item.title, to: buildPostHref(item) }
        );
        if (currentIndex > -1) {
            return [{ id: 'posts', nodes: categoryPosts.map(toNode) }];
        }
        if (!categoryPostsLoaded || categoryPosts.length === 0) {
            return [{ id: 'current', nodes: [currentNode] }];
        }
        return [
            { id: 'current', heading: '이 글의 목차', nodes: [currentNode] },
            { id: 'posts', heading: '이 카테고리의 다른 글', nodes: categoryPosts.map(toNode) },
        ];
    }, [post, outline.tree, scrollToHeading, scrollToTop, categoryPosts, categoryPostsLoaded, currentIndex, buildPostHref]);

    // 유효하지 않은 카테고리인 경우 404 페이지를 직접 렌더링 (<Navigate to="*">는 잘못된 상대 경로로 이동)
    if (!isValidCategory) {
        return <NotFound />;
    }

    if (error?.status === 404 || (!loading && !error && !post)) {
        return <NotFound />;
    }

    const categoryDisplayName = CATEGORY_DISPLAY_NAMES[displayCategory] || CATEGORY_DISPLAY_NAMES[normalizedCategory];
    // 로딩 중에는 URL의 postId를 임시 제목으로 사용한다.
    const postTitle = post?.title || postId;
    const pageTitle = `${postTitle ?? ''} | ${categoryDisplayName} | Microsoft Elevate`;
    const pageDescription = post?.excerpt || `${postTitle ?? ''} - ${categoryDisplayName} 블로그 포스트입니다.`;
    const pageUrl = canonicalUrl(useLatest ? '/agenthon' : `/${normalizedCategory}/${postId || ''}`);
    const ogImage = getStableOgImage(post?.thumbnail);

    const docsMeta = getDocsMeta(displayCategory);
    const section = getDocsSection(displayCategory);
    const sectionRoot = SECTION_ROOTS[section];

    const crumbs = sectionRoot
        ? [{ label: sectionRoot.label, to: sectionRoot.to }]
        : [
            { label: 'Blog', to: '/all' },
            ...(backToListHref !== '/' ? [{ label: categoryDisplayName, to: backToListHref }] : []),
        ];

    const heroMeta = post ? [
        formatDateKo(post.publishedAt),
        outline.minutes ? `약 ${outline.minutes}분 분량` : null,
    ] : [];

    const searchBase = POST_LIST_CATEGORIES.includes(displayCategory) ? `/${displayCategory}` : '/all';
    const search = {
        placeholder: searchBase === '/all' ? '블로그 검색' : `${categoryDisplayName}에서 검색`,
        onSubmit: (q) => {
            if (q) navigate(`${searchBase}?q=${encodeURIComponent(q)}`);
        },
    };

    const navigator = isReady ? (
        <DocsNavigator
            header={(
                <>
                    <NavHeader
                        title={categoryDisplayName}
                        titleTo={backToListHref !== '/' ? backToListHref : undefined}
                        iconSrc={docsMeta.icon || undefined}
                        subtitle={categoryPostsLoaded ? `게시글 ${categoryPosts.length}개 · 최신순` : undefined}
                    />
                    {errorsMap[displayCategory] && (
                        <div className="edoc-nav__note" role="alert">
                            <p>{errorsMap[displayCategory]}</p>
                            <button type="button" className="edoc-textlink" onClick={() => ensureCategoryPosts(displayCategory)}>
                                목록 다시 시도
                            </button>
                        </div>
                    )}
                </>
            )}
            sections={navSections}
            activeId={activeHeadingId ? `toc:${activeHeadingId}` : `post:${post.id}`}
            resetKey={post.id}
        />
    ) : loading ? <NavSkeleton /> : (
        <DocsNavigator
            sections={[]}
            emptyLabel="게시글을 불러오지 못했습니다."
        />
    );

    return (
        <>
            {/* Helmet은 DocsShell 외부에 위치해도 React Portal로 <head>에 주입된다. */}
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

            <DocsShell
                section={section}
                tintStyle={getTintStyle(displayCategory)}
                navigator={navigator}
                search={search}
                fabLabel="목차"
            >
                {loading && <DocsArticleSkeleton />}
                {!loading && error && (
                    <div className="edoc-container edoc-section">
                        <DocsLoadError message={error.message} onRetry={retry} />
                    </div>
                )}

                {isReady && (
                    <>
                        <DocsHero
                            compact
                            category={displayCategory}
                            titleId="post-title"
                            crumbs={crumbs}
                            eyebrow={categoryDisplayName}
                            eyebrowIcon={docsMeta.icon}
                            title={post.title}
                            abstract={post.excerpt}
                            meta={heroMeta}
                        />

                        <div className="edoc-container edoc-article-wrap">
                            {/* 유튜브 임베드 카드 (frontmatter에 youtube 필드가 있을 때) */}
                            {post.youtube && (
                                <div className="edoc-video">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${post.youtube}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            <PostContent html={preparedContentHtml} navigate={navigate} />

                            <DocsPrevNext
                                prev={prevPost}
                                next={nextPost}
                                buildHref={buildPostHref}
                                // /agenthon은 목록이 아니라 최신 글 화면이라, 에이전톤 글은 전체 게시글로 돌려보낸다.
                                backTo={displayCategory === 'agenthon' ? '/all' : backToListHref}
                                backLabel={displayCategory === 'agenthon' ? '전체 게시글' : `${categoryDisplayName} 목록으로`}
                            />
                        </div>
                    </>
                )}
            </DocsShell>
        </>
    );
};

export default PostDetail;
