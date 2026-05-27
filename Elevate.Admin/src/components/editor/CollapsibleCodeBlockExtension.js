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
    // ignoreMutation 옵션을 사용하지 않는다.
    // options.ignoreMutation 이 존재하면 TipTap이 contentDOM.contains() 체크를 우회해
    // characterData/childList 변경(타이핑)까지 무시하게 되어 ProseMirror 내부 doc이
    // 업데이트되지 않고, 저장 시 타이핑한 내용이 소실된다.
    // 접기/펼치기 scroll 문제는 max-height CSS로 이미 해결됐으므로 ignoreMutation 불필요.
    return ReactNodeViewRenderer(CollapsibleCodeBlockView)
  },
})

export default CollapsibleCodeBlockExtension
