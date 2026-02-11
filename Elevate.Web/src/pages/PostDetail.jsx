import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

    // 카테고리를 소문자로 변환하여 검증
    const normalizedCategory = category?.toLowerCase();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!normalizedCategory || !postId) return;
        const controller = new AbortController();
        async function load() {
            setLoading(true);
            setNotFound(false);
            try {
                const res = await fetch(`/api/posts/${normalizedCategory}--${postId}.json`, { signal: controller.signal });
                if (!res.ok) {
                    setNotFound(true);
                    return;
                }
                const data = await res.json();
                setPost(data);
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
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-4xl">
                    <div className="clean-card no-hover rounded-[3rem] p-12 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
                        {/* Breadcrumb */}
                        <div className="text-sm text-slate-500 mb-6">
                            <Link to="/" className="hover:text-ms-blue transition-colors">Home</Link>
                            <span className="mx-2">/</span>
                            <Link to="/blog" className="hover:text-ms-blue transition-colors">Blog</Link>
                            <span className="mx-2">/</span>
                            <Link to={`/blog/${normalizedCategory}`} className="hover:text-ms-blue transition-colors">{categoryDisplayName}</Link>
                        </div>

                        {loading && <div className="text-center py-8 text-slate-500">로딩 중...</div>}

                        {!loading && post && (
                            <>
                                {/* Post Title */}
                                <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4 tracking-tight">
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
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {post.content}
                                    </ReactMarkdown>
                                </article>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
