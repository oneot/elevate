import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (node.attrs.collapsible !== shouldCollapse) {
      updateAttributes({ collapsible: shouldCollapse })
    }
  }, [shouldCollapse, updateAttributes, node.attrs.collapsible])

  useEffect(() => {
    setIsCollapsed(shouldCollapse)
  }, [shouldCollapse])

  const contentId = `collapsible-code-${node.attrs.id ?? Math.random().toString(36).slice(2, 8)}`

  return (
    <NodeViewWrapper className="relative my-4">
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
      {shouldCollapse && (
        <button
          type="button"
          contentEditable={false}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="mt-1 flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-ms-blue"
        >
          {isCollapsed ? '코드 펼치기 ▼' : '접기 ▲'}
          <span className="text-neutral-400">({lineCount}줄)</span>
        </button>
      )}
    </NodeViewWrapper>
  )
}
