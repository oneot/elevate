/**
 * 앱 유리 타일: 앱 아이콘 색으로 은은하게 빛나는 반투명 타일 위에 흰 유리 아이콘을 올린다.
 * 공개 사이트 블로그의 AppArt와 같은 모양이다.
 * - hero: 타일 뒤로 같은 색의 옅은 빛 번짐을 깐다.
 * - card: 게시글 카드의 이미지 자리를 채운다.
 */
export default function AppArt({ paint, glyph, variant = 'hero', className = '' }) {
  return (
    <div
      className={`ea-art ea-art--${variant} ${className}`}
      aria-hidden="true"
      style={{ '--ea-art-paint': `url("${paint}")`, '--ea-art-glyph': `url("${glyph}")` }}
    >
      {variant === 'hero' && (
        <div className="ea-art__fluid">
          <span className="ea-art__blob ea-art__blob--a" />
          <span className="ea-art__blob ea-art__blob--b" />
        </div>
      )}
      <div className="ea-art__tile">
        <div className="ea-art__glow" />
        <div className="ea-art__frost" />
        <div className="ea-art__glyph" />
        <div className="ea-art__rim" />
      </div>
    </div>
  )
}
