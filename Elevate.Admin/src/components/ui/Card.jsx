/**
 * 카드 왼쪽 강조 테두리 colorScheme 별 스타일.
 * - blue: Microsoft Blue (주요 콘텐츠)
 * - green: Microsoft Green (긍정적 상태)
 * - orange: Microsoft Orange (주의/강조)
 * - slate: 중립 회색 (일반 항목)
 * colorScheme 를 지정하지 않으면 왼쪽 테두리 없이 기본 카드로 렌더링한다.
 */
const borderSchemes = {
  blue: 'border-l-4 border-l-ms-blue',
  green: 'border-l-4 border-l-ms-green',
  orange: 'border-l-4 border-l-ms-orange',
  slate: 'border-l-4 border-l-neutral-300',
}

function Card({ 
  children, 
  colorScheme, 
  className = '',
  onClick,
  ...props 
}) {
  const isClickable = typeof onClick === 'function'
  const leftBorder = colorScheme ? borderSchemes[colorScheme] || '' : ''
  
  return (
    <div
      onClick={onClick}
      className={`
        clean-card p-6 ${leftBorder}
        ${isClickable ? 'cursor-pointer hover:bg-neutral-50' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
