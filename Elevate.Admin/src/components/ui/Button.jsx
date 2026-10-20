/**
 * 버튼 variant 별 스타일 (공개 사이트 블로그와 같은 알약 모양).
 * - primary: 주요 행동 (파란색)
 * - secondary: 보조 행동 (흰 배경, 얇은 테두리)
 * - ghost: 시각적으로 비침투적인 행동 (투명 배경)
 * - danger: 위험/삭제 행동 (빨간 글자)
 */
const styles = {
  primary: 'ea-btn--primary',
  secondary: 'ea-btn--secondary',
  ghost: 'ea-btn--ghost',
  danger: 'ea-btn--danger',
}

function Button({ variant = 'primary', size, type = 'button', className = '', disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ea-btn ${styles[variant] || styles.primary}${size === 'sm' ? ' ea-btn--sm' : ''} ${className}`}
      {...props}
    />
  )
}

export default Button
