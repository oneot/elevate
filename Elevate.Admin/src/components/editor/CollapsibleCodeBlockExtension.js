import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CollapsibleCodeBlockView from './CollapsibleCodeBlockView.jsx'

const CollapsibleCodeBlockExtension = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      collapsible: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-collapsible') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.collapsible) {
            return {}
          }

          return {
            'data-collapsible': 'true',
          }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleCodeBlockView, {
      // 접기/펼치기 토글 시 style 변경 등 DOM 뮤테이션을 ProseMirror가 감지하면
      // 자동으로 scrollIntoView가 발생한다. 이를 방지하기 위해 모든 뮤테이션을 무시한다.
      ignoreMutation: () => true,
    })
  },
})

export default CollapsibleCodeBlockExtension
