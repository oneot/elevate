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

const clampImageWidth = (width, maxWidth) => (
  Math.min(Math.max(MIN_IMAGE_WIDTH, width), maxWidth)
)

const getDerivedSize = ({ width, height, aspectRatio }) => {
  if (width && height) return { width, height }
  if (width && aspectRatio) return { width, height: Math.max(1, Math.round(width / aspectRatio)) }
  if (height && aspectRatio) return { width: Math.max(1, Math.round(height * aspectRatio)), height }
  return null
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
  const measuredAspectRatio =
    measuredSize?.width && measuredSize?.height ? measuredSize.width / measuredSize.height : null
  const storedAspectRatio = storedWidth && storedHeight ? storedWidth / storedHeight : null
  const aspectRatio = measuredAspectRatio || storedAspectRatio
  const storedSize = getDerivedSize({
    width: storedWidth,
    height: storedHeight,
    aspectRatio,
  })
  const appliedWidth = resizeSize?.width || storedWidth || storedSize?.width || null
  const displaySize = resizeSize ?? (measuredSize?.width && measuredSize?.height ? measuredSize : storedSize)

  const imageStyle = useMemo(() => {
    if (!appliedWidth) return undefined
    return {
      width: `${appliedWidth}px`,
    }
  }, [appliedWidth])

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
    const frameId = window.requestAnimationFrame(measureImage)
    return () => window.cancelAnimationFrame(frameId)
  }, [appliedWidth, measureImage])

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
      const nextWidth = clampImageWidth(dragState.startWidth + deltaX, dragState.maxWidth)
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

  const getResizeMetrics = () => {
    const image = imageRef.current
    const wrapper = wrapperRef.current
    const editorRoot = wrapper?.closest('.ProseMirror')
    if (!image || !editorRoot) return null

    const imageRect = image.getBoundingClientRect()
    const maxWidth = getElementContentWidth(editorRoot)
    const measuredWidth = Math.round(imageRect.width)
    const measuredHeight = Math.round(imageRect.height)
    const naturalWidth = Math.round(image.naturalWidth)
    const naturalHeight = Math.round(image.naturalHeight)
    const startWidth = measuredWidth > 0 ? measuredWidth : naturalWidth
    const startHeight = measuredHeight > 0 ? measuredHeight : naturalHeight
    if (startWidth <= 0 || startHeight <= 0) return null

    return {
      startWidth,
      startHeight,
      aspectRatio: startWidth / startHeight,
      maxWidth: Math.max(MIN_IMAGE_WIDTH, maxWidth),
    }
  }

  const handlePointerDown = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const metrics = getResizeMetrics()
    if (!metrics) return

    dragStateRef.current = {
      startX: event.clientX,
      startWidth: metrics.startWidth,
      aspectRatio: metrics.aspectRatio,
      maxWidth: metrics.maxWidth,
      latestSize: { width: metrics.startWidth, height: metrics.startHeight },
      committedSize: null,
      previousCursor: document.body.style.cursor,
      previousUserSelect: document.body.style.userSelect,
    }
    setResizeSize({ width: metrics.startWidth, height: metrics.startHeight })
    setIsResizing(true)
    document.body.style.cursor = 'nwse-resize'
    document.body.style.userSelect = 'none'
  }

  const handleResizeKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return

    event.preventDefault()
    event.stopPropagation()

    const metrics = getResizeMetrics()
    if (!metrics) return

    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1
    const step = event.shiftKey ? 50 : 10
    const nextWidth = clampImageWidth(metrics.startWidth + (direction * step), metrics.maxWidth)
    const nextHeight = Math.max(1, Math.round(nextWidth / metrics.aspectRatio))
    const nextSize = { width: nextWidth, height: nextHeight }

    setResizeSize(nextSize)
    updateAttributesRef.current(nextSize)
    window.requestAnimationFrame(() => {
      setResizeSize(null)
      measureImage()
    })
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
          <button
            type="button"
            className="resizable-image-handle"
            aria-label="이미지 크기 조절"
            title="이미지 크기 조절"
            onPointerDown={handlePointerDown}
            onKeyDown={handleResizeKeyDown}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}

export default ResizableImageView
