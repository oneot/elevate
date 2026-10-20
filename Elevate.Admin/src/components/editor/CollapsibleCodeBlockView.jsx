import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const COLLAPSE_THRESHOLD = 15
// 접힌 상태에서 보여줄 줄 수. 줄 높이는 공개 사이트 코드 블록과 같다 (styles/post-content.css의 pre line-height).
const PREVIEW_LINE_HEIGHT_EM = 1.62
const PREVIEW_LINES = 3

export default function CollapsibleCodeBlockView({ node, updateAttributes }) {
  const code = node.textContent || ''
  const lines = useMemo(() => (code ? code.replace(/\n$/, '').split('\n') : []), [code])
  const lineCount = lines.length
  const shouldCollapse = lineCount >= COLLAPSE_THRESHOLD
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse)
  const [copyLabel, setCopyLabel] = useState('복사')
  const copyTimerRef = useRef(null)

  useEffect(() => {
    if (node.attrs.collapsible !== shouldCollapse) {
      updateAttributes({ collapsible: shouldCollapse })
    }
  }, [shouldCollapse, updateAttributes, node.attrs.collapsible])

  useEffect(() => {
    setIsCollapsed(shouldCollapse)
  }, [shouldCollapse])

  // 언마운트 시 진행 중인 타이머 정리
  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }
  }, [])

  const generatedId = useId()
  const contentId = `collapsible-code-${generatedId.replace(/:/g, '')}`

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev)
  }

  const handleCopy = async () => {
    const fullText = lines.join('\n')
    let success = false

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(fullText)
        success = true
      } catch {
        // clipboard API 실패 시 execCommand 폴백으로 진행
      }
    }

    if (!success) {
      try {
        const ta = document.createElement('textarea')
        ta.value = fullText
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        success = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        success = false
      }
    }

    setCopyLabel(success ? '복사됨 ✓' : '복사 실패')
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopyLabel('복사'), 2000)
  }

  // display:none 대신 max-height+overflow 클리핑 사용.
  // contentDOMElement를 항상 visible하게 유지해야 브라우저가 커서를 잃지 않아 스크롤이 발생하지 않는다.
  // 코드 창의 위쪽 여백(점 3개 자리)에 가려지지 않도록 pre가 아니라 code를 줄 수만큼 자른다.
  const collapsedStyle = isCollapsed
    ? { display: 'block', maxHeight: `${PREVIEW_LINES * PREVIEW_LINE_HEIGHT_EM}em`, overflowY: 'hidden' }
    : undefined

  return (
    // 공개 사이트가 코드 블록에 붙이는 틀·버튼과 같은 클래스 (styles/post-content.css)
    <NodeViewWrapper className="collapsible-code-block relative">
      <pre id={contentId} className="hljs">
        <NodeViewContent
          as="code"
          className={node.attrs.language ? `language-${node.attrs.language}` : ''}
          style={collapsedStyle}
        />
      </pre>
      <div contentEditable={false} className="collapsible-code-actions">
        {shouldCollapse && (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleToggle}
            className="collapsible-code-toggle"
          >
            {isCollapsed ? '코드 펼치기 ▼' : '접기 ▲'} ({lineCount}줄)
          </button>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopy}
          className="collapsible-code-copy"
        >
          {copyLabel}
        </button>
      </div>
    </NodeViewWrapper>
  )
}
