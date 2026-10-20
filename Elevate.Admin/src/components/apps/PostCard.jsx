import { Link } from 'react-router-dom'
import AppArt from './AppArt.jsx'
import { StatusPill } from '../ui/index.js'
import { getAppMeta, getTintStyle } from '../../constants/appMeta.js'
import { useCardImage } from '../../hooks/useCardImage.js'
import { formatDate } from '../../utils/formatters.js'
import { getImageLoadingProps } from '../../utils/postImages.js'

/**
 * 공개 사이트 블로그 카드(Elevate.Web DocsPostCard)와 같은 모양의 게시글 카드.
 * 이미지도 공개 카드와 같다: 공개 사이트 정적 썸네일 → DB 썸네일 → 앱 유리 타일.
 * 게시 상태는 썸네일을 가리지 않도록 날짜 옆에 표시한다.
 */
export function PostCard({ post, showApp = false, priority = false }) {
  const meta = getAppMeta(post.app)
  const title = post.title || '(제목 없음)'
  const { imageProps, pending, onError } = useCardImage(post)
  const loadingProps = getImageLoadingProps(Boolean(priority && imageProps))

  let media
  if (imageProps) media = <img {...imageProps} {...loadingProps} alt="" onError={onError} />
  else if (pending) media = <div className="ea-card__placeholder ea-skel" />
  else media = <AppArt variant="card" paint={meta.paint} glyph={meta.glyph} />

  return (
    <article className="ea-card" style={getTintStyle(post.app)}>
      <Link to={`/posts/${post.id}`} className="ea-card__link">
        <div className="ea-card__media">{media}</div>
        <div className="ea-card__body">
          {showApp && (
            <p className="ea-card__eyebrow">
              {meta.icon && <img src={meta.icon} alt="" width="14" height="14" />}
              {meta.name}
            </p>
          )}
          <h3 className="ea-card__title">{title}</h3>
          {post.excerpt && <p className="ea-card__excerpt">{post.excerpt}</p>}
          <p className="ea-card__meta">
            <StatusPill status={post.status} />
            <span>{formatDate(post.updatedAt)} 수정</span>
          </p>
        </div>
      </Link>
    </article>
  )
}

export function PostGridSkeleton({ count = 6 }) {
  return (
    <div className="ea-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="ea-card">
          <div className="ea-skel" style={{ aspectRatio: '16 / 9', borderRadius: 16 }} />
          <div style={{ display: 'grid', gap: 9, paddingTop: 16 }}>
            <div className="ea-skel" style={{ height: 16, width: '86%' }} />
            <div className="ea-skel" style={{ height: 16, width: '58%' }} />
            <div className="ea-skel" style={{ height: 12, width: '92%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
