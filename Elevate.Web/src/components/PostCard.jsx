import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { id, slug, title, excerpt, imageUrl, author, publishedAt, likes = 0, comments = 0, category, tags = [] } = post;
  const safeCategory = category || 'all';
  const to = `/blog/${safeCategory}/${slug || id}`;
  const [showAllTags, setShowAllTags] = useState(false);
  const moreRef = useRef(null);
  const cardRef = useRef(null);

  // Removed horizontal scroll-on-hover animations for title and excerpt

  return (
    <article
      ref={cardRef}
      className="hover:shadow-lg reveal-card post-card rounded-2xl p-6 shadow-soft transition group bg-white h-full w-full max-w-full"
    >
      <Link to={to} aria-label={`Open post ${title}`} className="block focus:outline-none focus:ring-2 focus:ring-ms-blue/30 h-full">
        <div className="flex flex-col h-full">
          <div className="w-full rounded-md overflow-hidden bg-slate-100" style={{height: 160}}>
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
            )}
          </div>

          <div className="flex-1 mt-4 flex flex-col">
            <div className="overflow-hidden" style={{ minHeight: 48 }}>
              <h3
                className="text-lg font-semibold text-slate-900"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word'
                }}
              >
                {title}
              </h3>
            </div>
            <div className="text-sm text-slate-600 mt-2 overflow-hidden" style={{ maxHeight: 54 }}>
              <p className="m-0" style={{ whiteSpace: 'normal' }}>{excerpt}</p>
            </div>

            {tags.length > 0 && (
              <div
                className="relative flex flex-wrap items-center gap-1 mt-2 max-w-full min-w-0 mt-auto"
                onMouseEnter={() => setShowAllTags(true)}
                onMouseLeave={() => setShowAllTags(false)}
              >
                {tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full shrink-0 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 2 && (
                  <div className="relative shrink-0">
                    <button
                      ref={moreRef}
                      type="button"
                      className="text-xs px-2 py-0.5 text-slate-400 border border-transparent hover:border-slate-200 rounded-full"
                      onFocus={() => setShowAllTags(true)}
                      onBlur={() => setShowAllTags(false)}
                      onClick={() => setShowAllTags((v) => !v)}
                      aria-label={`추가 태그 ${tags.length - 2}개 보기`}
                    >
                      +{tags.length - 2}
                    </button>

                    {showAllTags && (
                      <div
                        role="tooltip"
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max max-w-[240px] rounded-xl border border-slate-200 bg-white shadow-lg p-3 text-xs text-slate-700"
                      >
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
