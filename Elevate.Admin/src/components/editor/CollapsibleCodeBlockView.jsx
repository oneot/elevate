import { useEffect, useMemo, useRef, useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const COLLAPSE_THRESHOLD = 15
// 접힌 상태에서 보여줄 줄 수 (em 단위 max-height 계산에 사용)
const PREVIEW_LINE_HEIGHT_EM = 1.6
const PREVIEW_LINES = 3

export default function CollapsibleCodeBlockView({ node, updateAttributes }) {
  const code = node.textContent || ''
  const lines = useMemo(() => (code ? code.replace(/\n$/, '').split('\n') : []), [code])
  const lineCount = lines.length
  const shouldCollapse = lineCount >= COLLAPSE_THRESHOLD
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse)
  const [copyLabel, setCopyLabel] = useState('복사')

  useEffect(() => {
    if (node.attrs.collapsible !== shouldCollapse) {
      updateAttributes({ collapsible: shouldCollapse })
    }
  }, [shouldCollapse, updateAttributes, node.attrs.collapsible])

  useEffect(() => {
    setIsCollapsed(shouldCollapse)
  }, [shouldCollapse])

  const contentIdRef = useRef(`collapsible-code-${Math.random().toString(36).slice(2, 8)}`)
  const contentId = contentIdRef.current

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev)
  }

  const handleCopy = () => {
    const fullText = lines.join('\n')
    navigator.clipboard.writeText(fullText).then(() => {
      setCopyLabel('복사됨 ✓')
      setTimeout(() => setCopyLabel('복사'), 2000)
    }).catch(() => {
      setCopyLabel('복사 실패')
      setTimeout(() => setCopyLabel('복사'), 2000)
    })
  }

  // display:none 대신 max-height+overflow 클리핑 사용.
  // contentDOMElement를 항상 visible하게 유지해야 브라우저가 커서를 잃지 않아 스크롤이 발생하지 않는다.
  const collapsedStyle = isCollapsed
    ? { maxHeight: `${PREVIEW_LINES * PREVIEW_LINE_HEIGHT_EM}em`, overflowY: 'hidden' }
    : undefined

  return (
    <NodeViewWrapper className="relative my-4">
      <pre
        id={contentId}
        className="hljs rounded-md overflow-x-auto text-sm"
        style={collapsedStyle}
      >
        <NodeViewContent
          as="code"
          className={node.attrs.language ? `language-${node.attrs.language}` : ''}
        />
      </pre>
      <div contentEditable={false} className="mt-1 flex items-center gap-2">
        {shouldCollapse && (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleToggle}
            className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-ms-blue border border-neutral-200 rounded px-2 py-0.5"
          >
            {isCollapsed ? '코드 펼치기 ▼' : '접기 ▲'}
            <span className="text-neutral-400">({lineCount}줄)</span>
          </button>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-ms-blue border border-neutral-200 rounded px-2 py-0.5"
        >
          {copyLabel}
        </button>
      </div>
    </NodeViewWrapper>
  )
}
