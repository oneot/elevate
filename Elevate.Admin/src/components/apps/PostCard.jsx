import { Link } from 'react-router-dom'
import AppArt from './AppArt.jsx'
import { StatusPill } from '../ui/index.js'
import { getAppMeta, getTintStyle } from '../../constants/appMeta.js'
import { formatDate } from '../../utils/formatters.js'

/**
 * 공개 사이트 블로그 카드와 같은 모양의 게시글 카드. 관리자 목록 API에는 썸네일이 없으므로
 * 이미지 자리는 앱 유리 타일로 채우고, 게시 상태를 함께 표시한다.
 */
export function PostCard({ post, showApp = false }) {
  const meta = getAppMeta(post.app)
  const title = post.title || '(제목 없음)'

  return (
    <article className="ea-card" style={getTintStyle(post.app)}>
      <Link to={`/posts/${post.id}`} className="ea-card__link">
        <div className="ea-card__media">
          <AppArt variant="card" paint={meta.paint} glyph={meta.glyph} />
          <span className="ea-card__status">
            <StatusPill status={post.status} />
          </span>
        </div>
        <div className="ea-card__body">
          {showApp && (
            <p className="ea-card__eyebrow">
              {meta.icon && <img src={meta.icon} alt="" width="14" height="14" />}
              {meta.name}
            </p>
          )}
          <h3 className="ea-card__title">{title}</h3>
          {post.excerpt && <p className="ea-card__excerpt">{post.excerpt}</p>}
          <p className="ea-card__meta">{formatDate(post.updatedAt)} 수정</p>
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
