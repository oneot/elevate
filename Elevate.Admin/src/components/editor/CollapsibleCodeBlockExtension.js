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
    return ReactNodeViewRenderer(CollapsibleCodeBlockView)
  },
})

export default CollapsibleCodeBlockExtension
