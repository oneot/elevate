import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImageView from './ResizableImageView.jsx'

const parseNumericAttribute = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (Number.isInteger(value) && value > 0) return value

  const stringValue = String(value)
  if (!/^[1-9]\d*$/.test(stringValue)) return null

  return Number(stringValue)
}

const parsePixelStyle = (value) => {
  if (value === null || value === undefined || value === '') return null

  const match = String(value).match(/^([1-9]\d*)px$/)
  return match ? Number(match[1]) : null
}

const parseHTMLSize = (attributeValue, styleValue) => (
  parseNumericAttribute(attributeValue) ?? parsePixelStyle(styleValue)
)

const parseSize = (value) => {
  return parseNumericAttribute(value)
}

const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => parseHTMLSize(element.getAttribute('width'), element.style.width),
        renderHTML: (attributes) => {
          const width = parseSize(attributes.width)
          return width ? { width } : {}
        },
      },
      height: {
        default: null,
        parseHTML: (element) => parseHTMLSize(element.getAttribute('height'), element.style.height),
        renderHTML: (attributes) => {
          const height = parseSize(attributes.height)
          return height ? { height } : {}
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

export default ResizableImageExtension
