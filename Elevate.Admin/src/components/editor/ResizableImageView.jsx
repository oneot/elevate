import { NodeViewWrapper } from '@tiptap/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const MIN_IMAGE_WIDTH = 120

const toPositiveInteger = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const getElementContentWidth = (element) => {
  const rect = element.getBoundingClientRect()
  const styles = window.getComputedStyle(element)
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0
  return Math.max(0, Math.floor(rect.width - paddingLeft - paddingRight))
}

function ResizableImageView({ node, selected, updateAttributes }) {
  const wrapperRef = useRef(null)
  const imageRef = useRef(null)
  const dragStateRef = useRef(null)
  const commitTimerRef = useRef(null)
  const updateAttributesRef = useRef(updateAttributes)
  const [isResizing, setIsResizing] = useState(false)
  const [measuredSize, setMeasuredSize] = useState({ width: null, height: null })
  const [resizeSize, setResizeSize] = useState(null)

  const storedWidth = toPositiveInteger(node.attrs.width)
  const storedHeight = toPositiveInteger(node.attrs.height)
  const storedSize = storedWidth && storedHeight ? { width: storedWidth, height: storedHeight } : null
  const appliedSize = resizeSize ?? storedSize
  const displaySize = resizeSize ?? (measuredSize?.width && measuredSize?.height ? measuredSize : storedSize)

  const imageStyle = useMemo(() => {
    if (!appliedSize) return undefined
    return {
      width: `${appliedSize.width}px`,
    }
  }, [appliedSize])

  useEffect(() => {
    updateAttributesRef.current = updateAttributes
  }, [updateAttributes])

  const measureImage = useCallback(() => {
    const image = imageRef.current
    if (!image) return

    const rect = image.getBoundingClientRect()
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)
    if (width > 0 && height > 0) {
      setMeasuredSize({ width, height })
    }
  }, [])

  useEffect(() => {
    if (storedWidth && storedHeight) return undefined

    const frameId = window.requestAnimationFrame(measureImage)
    return () => window.cancelAnimationFrame(frameId)
  }, [measureImage, storedHeight, storedWidth])

  useEffect(() => {
    if (!storedWidth || !storedHeight) return undefined

    const frameId = window.requestAnimationFrame(measureImage)
    return () => window.cancelAnimationFrame(frameId)
  }, [measureImage, storedHeight, storedWidth])

  useEffect(() => {
    const restoreDocumentStyles = (dragState) => {
      document.body.style.cursor = dragState.previousCursor
      document.body.style.userSelect = dragState.previousUserSelect
    }

    const commitSize = (dragState, size) => {
      if (
        dragState.committedSize?.width === size.width &&
        dragState.committedSize?.height === size.height
      ) {
        return
      }

      updateAttributesRef.current(size)
      dragState.committedSize = size
    }

    const scheduleCommit = (dragState, size) => {
      window.clearTimeout(commitTimerRef.current)
      commitTimerRef.current = window.setTimeout(() => {
        commitSize(dragState, size)
        commitTimerRef.current = null
      }, 120)
    }

    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current
      if (!dragState) return

      event.preventDefault()
      const deltaX = event.clientX - dragState.startX
      const nextWidth = Math.min(
        Math.max(MIN_IMAGE_WIDTH, dragState.startWidth + deltaX),
        dragState.maxWidth,
      )
      const nextHeight = Math.max(1, Math.round(nextWidth / dragState.aspectRatio))
      const roundedWidth = Math.round(nextWidth)
      const nextSize = { width: roundedWidth, height: nextHeight }

      dragState.latestSize = nextSize
      setResizeSize(nextSize)
      scheduleCommit(dragState, nextSize)
    }

    const handlePointerUp = () => {
      const dragState = dragStateRef.current
      if (!dragState) return

      window.clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
      commitSize(dragState, dragState.latestSize)
      dragStateRef.current = null
      setResizeSize(null)
      setIsResizing(false)
      restoreDocumentStyles(dragState)
    }

    const handlePointerCancel = () => {
      const dragState = dragStateRef.current
      if (!dragState) return

      window.clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
      dragStateRef.current = null
      setResizeSize(null)
      setIsResizing(false)
      restoreDocumentStyles(dragState)
    }

    if (isResizing) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerCancel)
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [isResizing])

  useEffect(() => {
    return () => {
      const dragState = dragStateRef.current
      window.clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
      if (!dragState) return

      dragStateRef.current = null
      document.body.style.cursor = dragState.previousCursor
      document.body.style.userSelect = dragState.previousUserSelect
    }
  }, [])

  const handlePointerDown = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const image = imageRef.current
    const wrapper = wrapperRef.current
    const editorRoot = wrapper?.closest('.ProseMirror')
    if (!image || !editorRoot) return

    const imageRect = image.getBoundingClientRect()
    const maxWidth = getElementContentWidth(editorRoot)
    const measuredWidth = Math.round(imageRect.width)
    const measuredHeight = Math.round(imageRect.height)
    const naturalWidth = Math.round(image.naturalWidth)
    const naturalHeight = Math.round(image.naturalHeight)
    const startWidth = measuredWidth > 0 ? measuredWidth : naturalWidth
    const startHeight = measuredHeight > 0 ? measuredHeight : naturalHeight
    if (startWidth <= 0 || startHeight <= 0) return

    const aspectRatio = startWidth / startHeight

    dragStateRef.current = {
      startX: event.clientX,
      startWidth,
      aspectRatio,
      maxWidth: Math.max(MIN_IMAGE_WIDTH, maxWidth),
      latestSize: { width: startWidth, height: startHeight },
      committedSize: null,
      previousCursor: document.body.style.cursor,
      previousUserSelect: document.body.style.userSelect,
    }
    setResizeSize({ width: startWidth, height: startHeight })
    setIsResizing(true)
    document.body.style.cursor = 'nwse-resize'
    document.body.style.userSelect = 'none'
  }

  const showControls = selected || isResizing
  const badgeText =
    displaySize?.width && displaySize?.height
      ? `${displaySize.width} x ${displaySize.height}px`
      : ''

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      as="span"
      className={`resizable-image-node ${selected ? 'is-selected' : ''} ${
        isResizing ? 'is-resizing' : ''
      }`}
      data-resizable-image
    >
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        title={node.attrs.title || undefined}
        style={imageStyle}
        draggable={false}
        onLoad={measureImage}
      />
      {showControls && (
        <>
          {badgeText ? <span className="resizable-image-badge">{badgeText}</span> : null}
          <span
            className="resizable-image-handle"
            role="presentation"
            onPointerDown={handlePointerDown}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}

export default ResizableImageView
