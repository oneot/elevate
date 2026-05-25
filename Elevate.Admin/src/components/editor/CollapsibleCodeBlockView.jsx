import { useEffect, useMemo, useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const COLLAPSE_THRESHOLD = 15
const PREVIEW_LINES = 3

export default function CollapsibleCodeBlockView({ node, updateAttributes }) {
  const code = node.textContent || ''
  const lineCount = useMemo(() => code.split('\n').length, [code])
  const shouldCollapse = lineCount >= COLLAPSE_THRESHOLD
  const previewText = useMemo(() => code.split('\n').slice(0, PREVIEW_LINES).join('\n'), [code])
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse)

  useEffect(() => {
    updateAttributes({ collapsible: shouldCollapse })
  }, [shouldCollapse, updateAttributes])

  useEffect(() => {
    setIsCollapsed(shouldCollapse)
  }, [shouldCollapse])

  return (
    <NodeViewWrapper className="relative my-4">
      <pre className={`hljs rounded-md overflow-x-auto text-sm ${isCollapsed ? 'max-h-none' : ''}`}>
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
