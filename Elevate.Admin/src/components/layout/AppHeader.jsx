import { Link } from 'react-router-dom'
import { ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { PUBLIC_SITE_URL } from '../../constants/site.js'
import MicrosoftMark from './MicrosoftMark.jsx'

function initialsOf(name) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const isLatin = (word) => /^[A-Za-z]/.test(word)
  if (words.length > 1 && isLatin(words[0]) && isLatin(words[1])) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return words[0][0].toUpperCase()
}

/** 공개 사이트 헤더와 같은 로고 바. 스크롤하면 위로 사라지고 아래 문서 바만 남는다. */
export default function AppHeader() {
  const { account, isAuthenticated, logout } = useAuth()
  const name = account?.name || account?.username || ''
  const mail = account?.username || ''

  return (
    <header className="ea-header">
      <div className="ea-header__inner">
        <Link to="/apps/all" className="ea-brand" aria-label="Microsoft Elevate 관리자 홈">
          <MicrosoftMark />
          <span className="ea-brand__name">Microsoft <span>Elevate</span></span>
          <span className="ea-brand__badge">Admin</span>
        </Link>
        <div className="ea-header__actions">
          <a className="ea-glass-pill ea-glass-pill--site" href={`${PUBLIC_SITE_URL}/all`} target="_blank" rel="noopener noreferrer" aria-label="공개 사이트 (새 창)">
            <ExternalLink size={15} aria-hidden="true" />
            <span className="ea-glass-pill__label">공개 사이트</span>
          </a>
          {isAuthenticated && (
            <>
              <div className="ea-account" title={mail || name}>
                <span className="ea-avatar" aria-hidden="true">{initialsOf(name)}</span>
                <span className="ea-account__text">
                  <span className="ea-account__name">{name}</span>
                  {mail && mail !== name && <span className="ea-account__mail">{mail}</span>}
                </span>
              </div>
              <button type="button" className="ea-linkbtn" onClick={() => logout()} aria-label="로그아웃">
                <LogOut size={15} aria-hidden="true" />
                <span className="ea-linkbtn__label">로그아웃</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
