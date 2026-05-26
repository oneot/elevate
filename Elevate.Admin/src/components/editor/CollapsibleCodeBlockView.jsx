import { useEffect, useMemo, useRef, useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const COLLAPSE_THRESHOLD = 15
const PREVIEW_LINES = 3

export default function CollapsibleCodeBlockView({ node, updateAttributes }) {
  const code = node.textContent || ''
  const lines = useMemo(() => (code ? code.replace(/\n$/, '').split('\n') : []), [code])
  const lineCount = lines.length
  const shouldCollapse = lineCount >= COLLAPSE_THRESHOLD
  const previewText = useMemo(() => lines.slice(0, PREVIEW_LINES).join('\n'), [lines])
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
  const wrapperRef = useRef(null)
  const btnRef = useRef(null)

  const handleToggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    if (next) {
      // 접힘: 토글 버튼이 뷰포트 안에 오도록 스크롤
      requestAnimationFrame(() => {
        btnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
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

  return (
    <NodeViewWrapper ref={wrapperRef} className="relative my-4">
      <pre
        id={contentId}
        className={`hljs rounded-md overflow-x-auto text-sm ${isCollapsed ? 'max-h-none' : ''}`}
      >
        {isCollapsed ? (
          <code className={node.attrs.language ? `language-${node.attrs.language}` : ''}>
            {previewText}
            {lineCount > PREVIEW_LINES && '\n...'}
          </code>
        ) : (
          <NodeViewContent
            as="code"
            className={node.attrs.language ? `language-${node.attrs.language}` : ''}
          />
        )}
      </pre>
      <div contentEditable={false} className="mt-1 flex items-center gap-2">
        {shouldCollapse && (
          <button
            ref={btnRef}
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={contentId}
            onClick={handleToggle}
            className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-ms-blue border border-neutral-200 rounded px-2 py-0.5"
          >
            {isCollapsed ? '코드 펼치기 ▼' : '접기 ▲'}
            <span className="text-neutral-400">({lineCount}줄)</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-ms-blue border border-neutral-200 rounded px-2 py-0.5"
        >
          {copyLabel}
        </button>
      </div>
    </NodeViewWrapper>
  )
}
