import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="ea-container ea-section">
      <div className="ea-empty" role="status">
        <span className="ea-drop" aria-hidden="true" />
        <strong>페이지를 찾을 수 없습니다</strong>
        <span>요청하신 페이지가 없거나 관리자에서 더 이상 제공하지 않는 화면입니다.</span>
        <div className="ea-empty__actions">
          <Link to="/apps/all" className="ea-btn ea-btn--primary ea-btn--sm">전체 게시글로 이동</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
