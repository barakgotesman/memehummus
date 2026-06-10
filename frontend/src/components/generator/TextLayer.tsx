import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { TextLayer as TextLayerType } from '@/types'

// html2canvas doesn't capture text-shadow or overflow correctly on <input> elements.
// We use contentEditable div instead so the canvas capture matches what the user sees.

interface TextLayerProps {
  layer: TextLayerType
  isSelected: boolean
  onSelect: () => void
  onChange: (patch: Partial<TextLayerType>) => void
  onMove: (patch: Partial<TextLayerType>) => void
  onMoveCommit: (patch: Partial<TextLayerType>) => void
  onDelete: () => void
  containerRef: React.RefObject<HTMLDivElement>
}

export default function TextLayer({ layer, isSelected, onSelect, onChange, onMove, onMoveCommit, onDelete, containerRef }: TextLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; lastX?: number; lastY?: number } | null>(null)
  const resizeState = useRef<{ startX: number; origWidth: number; origFontSize: number; lastWidth?: number; lastFontSize?: number } | null>(null)

  // Single-click selects/drags; double-click enters text editing mode.
  // This avoids contentEditable swallowing mousedown events needed for drag.
  const [editing, setEditing] = useState(false)

  // Exit edit mode when layer is deselected
  useEffect(() => {
    if (!isSelected) setEditing(false)
  }, [isSelected])

  // Exit edit mode when clicking outside the contentEditable
  useEffect(() => {
    if (!editing) return
    function handleOutsideMouseDown(e: MouseEvent) {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideMouseDown)
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown)
  }, [editing])

  // Keep the contentEditable div in sync when layer.text changes externally
  // (e.g. when a new layer is created). Avoid overwriting while the user is typing.
  useEffect(() => {
    const el = editRef.current
    if (el && el !== document.activeElement && el.innerText !== layer.text) {
      el.innerText = layer.text
    }
  }, [layer.text])

  /** Returns clientX/clientY from either a MouseEvent or a single-touch TouchEvent */
  function getEventCoords(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0]
      return { clientX: t.clientX, clientY: t.clientY }
    }
    return { clientX: e.clientX, clientY: e.clientY }
  }

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    if ((e.target as HTMLElement).closest('[data-resize]') || (e.target as HTMLElement).closest('[data-delete]')) return
    // If currently editing text, exit edit mode; next tap/click will drag
    if (editing) {
      editRef.current?.blur()
      return
    }
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    const { clientX, clientY } = 'touches' in e
      ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
      : { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY }
    dragState.current = { startX: clientX, startY: clientY, origX: layer.x, origY: layer.y }
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('touchend', stopDrag)
  }

  function onDragMove(e: MouseEvent | TouchEvent) {
    if (!dragState.current) return
    const container = containerRef.current
    if (!container) return
    if ('touches' in e) e.preventDefault()
    const rect = container.getBoundingClientRect()
    const { clientX, clientY } = getEventCoords(e)
    const dx = clientX - dragState.current.startX
    const dy = clientY - dragState.current.startY
    const newX = Math.max(0, Math.min(rect.width - layer.width, dragState.current.origX + dx))
    const newY = Math.max(0, Math.min(rect.height - layer.fontSize * 1.4, dragState.current.origY + dy))
    dragState.current.lastX = newX
    dragState.current.lastY = newY
    onMove({ x: newX, y: newY })
  }

  function stopDrag() {
    if (dragState.current?.lastX !== undefined) {
      onMoveCommit({ x: dragState.current.lastX, y: dragState.current.lastY })
    }
    dragState.current = null
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', stopDrag)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('touchend', stopDrag)
  }

  function startResize(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    e.stopPropagation()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    resizeState.current = { startX: clientX, origWidth: layer.width, origFontSize: layer.fontSize }
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', stopResize)
    window.addEventListener('touchmove', onResizeMove, { passive: false })
    window.addEventListener('touchend', stopResize)
  }

  function onResizeMove(e: MouseEvent | TouchEvent) {
    if (!resizeState.current) return
    if ('touches' in e) e.preventDefault()
    const { clientX } = getEventCoords(e)
    const dx = clientX - resizeState.current.startX
    const newWidth = Math.max(80, resizeState.current.origWidth + dx)
    const newFontSize = Math.max(14, Math.min(80, resizeState.current.origFontSize + Math.round(dx / 8)))
    resizeState.current.lastWidth = newWidth
    resizeState.current.lastFontSize = newFontSize
    onMove({ width: newWidth, fontSize: newFontSize })
  }

  function stopResize() {
    if (resizeState.current?.lastWidth !== undefined) {
      onMoveCommit({ width: resizeState.current.lastWidth, fontSize: resizeState.current.lastFontSize })
    }
    resizeState.current = null
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('touchmove', onResizeMove)
    window.removeEventListener('touchend', stopResize)
  }

  useEffect(() => () => {
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', stopDrag)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('touchend', stopDrag)
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('touchmove', onResizeMove)
    window.removeEventListener('touchend', stopResize)
  }, [])

  return (
    <div
      ref={layerRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onClick={e => { e.stopPropagation(); onSelect() }}
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        cursor: editing ? 'text' : 'move',
        userSelect: 'none',
        // Blue solid border in edit mode; white dashed when just selected
        outline: editing
          ? '2px solid rgba(100,160,255,0.9)'
          : isSelected
            ? '2px dashed rgba(255,255,255,0.8)'
            : 'none',
        overflow: 'visible',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {isSelected && (
        <button
          data-delete
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute',
            top: -12,
            right: -12,
            background: '#ba1a1a',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={12} color="white" />
        </button>
      )}

      <div
        ref={editRef}
        // Editable only after double-click — single click/drag goes to the outer wrapper
        contentEditable={editing}
        suppressContentEditableWarning
        onMouseDown={e => { if (editing) e.stopPropagation() }}
        onDoubleClick={e => { e.stopPropagation(); setEditing(true); editRef.current?.focus() }}
        onTouchEnd={e => {
          // Double-tap to enter edit mode on mobile
          if (!editing && e.currentTarget.dataset.lastTap) {
            const last = Number(e.currentTarget.dataset.lastTap)
            if (Date.now() - last < 400) {
              e.stopPropagation()
              setEditing(true)
              editRef.current?.focus()
              delete e.currentTarget.dataset.lastTap
              return
            }
          }
          e.currentTarget.dataset.lastTap = String(Date.now())
        }}
        onInput={e => onChange({ text: (e.currentTarget as HTMLDivElement).innerText })}
        dir="auto"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          width: '100%',
          fontFamily: layer.fontFamily,
          fontSize: layer.fontSize,
          fontWeight: layer.bold ? 'bold' : 'normal',
          fontStyle: layer.italic ? 'italic' : 'normal',
          textDecoration: layer.underline ? 'underline' : 'none',
          color: layer.color,
          // Multi-shadow technique for solid stroke outline — works correctly with html2canvas on divs
          textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000`,
          textAlign: 'center',
          // pointer shows drag cursor unless in edit mode
          cursor: editing ? 'text' : 'move',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          minWidth: 40,
          minHeight: layer.fontSize * 1.4,
          lineHeight: 1.4,
        }}
        data-placeholder="הקלד טקסט..."
      />

      {/* Hint shown when selected but not in edit mode.
          Flips below the layer when it's too close to the top edge to avoid canvas clipping. */}
      {isSelected && !editing && (
        <div
          style={{
            position: 'absolute',
            ...(layer.y < 30 ? { top: '100%', marginTop: 4 } : { top: -22 }),
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          לחץ פעמיים לעריכה • גרור להזזה
        </div>
      )}

      {isSelected && (
        <div
          data-resize
          onMouseDown={startResize}
          onTouchStart={startResize}
          style={{
            position: 'absolute',
            bottom: -6,
            right: -6,
            width: 14,
            height: 14,
            background: 'white',
            border: '2px solid #7b5800',
            borderRadius: 2,
            cursor: 'se-resize',
          }}
        />
      )}
    </div>
  )
}
