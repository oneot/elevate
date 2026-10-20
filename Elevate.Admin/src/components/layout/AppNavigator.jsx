import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { useAdminPosts } from '../../hooks/adminPosts.js'
import { ALL_APPS_KEY, APP_KEYS, getApiCategory } from '../../constants/apps.js'
import { getAppMeta } from '../../constants/appMeta.js'

/**
 * 공개 사이트 블로그 사이드바처럼 '전체 게시글'과 13개 앱을 아이콘·게시글 수와 함께 보여 준다.
 * 개수는 관리자 목록 기준이라 임시저장·보관 글도 포함한다.
 */
export default function AppNavigator({ activeApp }) {
  const { posts, byCategory, initialized } = useAdminPosts()

  const counts = useMemo(() => posts.reduce((result, post) => {
    result[post.app] = (result[post.app] || 0) + 1
    return result
  }, {}), [posts])

  const badgeFor = (app) => (byCategory[getApiCategory(app)] ? counts[app] || 0 : undefined)

  return (
    <div className="ea-nav__scroll">
      <p className="ea-nav__heading">게시글</p>
      <ul className="ea-nav__list">
        <li>
          <Link
            to={`/apps/${ALL_APPS_KEY}`}
            className="ea-nav__link"
            aria-current={activeApp === ALL_APPS_KEY ? 'page' : undefined}
          >
            <span className="ea-nav__icon"><LayoutGrid size={16} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="ea-nav__label">전체 게시글</span>
            {initialized && <span className="ea-nav__badge">{posts.length}</span>}
          </Link>
        </li>
      </ul>
      <p className="ea-nav__heading">앱</p>
      <ul className="ea-nav__list">
        {APP_KEYS.map((app) => {
          const meta = getAppMeta(app)
          const badge = badgeFor(app)
          return (
            <li key={app}>
              <Link
                to={`/apps/${app}`}
                className="ea-nav__link"
                aria-current={activeApp === app ? 'page' : undefined}
              >
                <span className="ea-nav__icon">
                  <img src={meta.icon} alt="" width="18" height="18" decoding="async" />
                </span>
                <span className="ea-nav__label">{meta.name}</span>
                {badge != null && <span className="ea-nav__badge">{badge}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="ea-nav__note">
        Word·PowerPoint·Forms·OneDrive는 M365 글을, GitHub·Azure는 Copilot Studio 글을 공개 사이트와 같은 규칙으로 나눠 보여 줍니다.
      </p>
    </div>
  )
}
