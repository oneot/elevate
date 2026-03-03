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
