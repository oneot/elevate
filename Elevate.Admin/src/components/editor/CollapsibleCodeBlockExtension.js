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
      // 접기/펼치기로 인한 pre 스타일 변경(max-height, overflow)은 contentDOM 외부에서
      // 발생하므로 기본 ignoreMutation 로직으로도 무시된다.
      // selection 변경은 ProseMirror가 처리해야 하므로 그대로 허용한다.
      ignoreMutation: ({ mutation }) => mutation.type !== 'selection',
    })
  },
})

export default CollapsibleCodeBlockExtension
