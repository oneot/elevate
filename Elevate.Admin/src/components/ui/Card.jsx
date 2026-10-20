/** 흰 패널 표면 (clean-card). 오류 경계·안내 화면에서 사용한다. */
function Card({ children, className = '', ...props }) {
  return (
    <div className={`clean-card p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
