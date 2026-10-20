/** Microsoft 사각형 로고 (공개 사이트 Logo와 같은 색). */
export default function MicrosoftMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="none" aria-hidden="true">
      <path d="M0 0H10.5V10.5H0V0Z" fill="#F25022" />
      <path d="M12.5 0H23V10.5H12.5V0Z" fill="#7FBA00" />
      <path d="M0 12.5H10.5V23H0V12.5Z" fill="#00A4EF" />
      <path d="M12.5 12.5H23V23H12.5V12.5Z" fill="#FFB900" />
    </svg>
  )
}
