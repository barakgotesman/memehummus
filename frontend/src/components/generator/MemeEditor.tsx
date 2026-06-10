import { useRef, useState, useEffect } from 'react'
import TextLayer from './TextLayer'
import type { TextLayer as TextLayerType, DankStrip, CropRegion } from '@/types'

interface MemeEditorProps {
  imageUrl: string | null
  textLayers: TextLayerType[]
  dankStrip: DankStrip | null
  selectedId: number | null
  onSelect: (id: number | null) => void
  onLayerChange: (id: number, patch: Partial<TextLayerType>) => void
  onLayerMove: (id: number, patch: Partial<TextLayerType>) => void
  onLayerMoveCommit: (id: number, patch: Partial<TextLayerType>) => void
  onLayerDelete: (id: number) => void
  onDankChange: (patch: Partial<DankStrip>) => void
  editorRef: React.RefObject<HTMLDivElement>
  cropMode: boolean
  cropRegion: CropRegion | null
  onCropCommit: (region: CropRegion) => void
}

type CropDragType = 'new' | 'body' | 'tl' | 'tr' | 'bl' | 'br'

const HANDLE_HIT = 14 // px hit area around each corner handle

export default function MemeEditor({
  imageUrl, textLayers, dankStrip, selectedId,
  onSelect, onLayerChange, onLayerMove, onLayerMoveCommit, onLayerDelete, onDankChange,
  editorRef, cropMode, cropRegion, onCropCommit,
}: MemeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [liveCrop, setLiveCropState] = useState<CropRegion | null>(null)
  const liveCropRef = useRef<CropRegion | null>(null)
  function setLiveCrop(val: CropRegion | null) { liveCropRef.current = val; setLiveCropState(val) }
  const [containerWidth, setContainerWidth] = useState(0)
  const dragRef = useRef<{
    type: CropDragType
    startX: number; startY: number
    origRegion: CropRegion
  } | null>(null)

  useEffect(() => { if (!cropMode) setLiveCrop(null) }, [cropMode])

  // ResizeObserver: unaffected by CSS transform — always reports layout size.
  // Stored as data attributes so captureCanvas can read them when transform is active.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setContainerWidth(width)
      el.dataset.trueWidth = String(width)
      el.dataset.trueHeight = String(height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // CSS transform: zoom into crop region for the live preview when crop is applied
  const cropTransform = (!cropMode && cropRegion && containerWidth > 0) ? (() => {
    const scale = containerWidth / cropRegion.width
    return { scale, tx: -cropRegion.x, ty: -cropRegion.y, visibleH: cropRegion.height * scale }
  })() : null

  function getCoords(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
    const rect = containerRef.current!.getBoundingClientRect()
    const clientX = 'touches' in e
      ? (e as TouchEvent).touches[0]?.clientX ?? (e as TouchEvent).changedTouches[0]?.clientX
      : (e as MouseEvent).clientX
    const clientY = 'touches' in e
      ? (e as TouchEvent).touches[0]?.clientY ?? (e as TouchEvent).changedTouches[0]?.clientY
      : (e as MouseEvent).clientY
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    }
  }

  /** Determine what the user is clicking: a corner handle, the body, or empty space (draw new) */
  function getDragType(x: number, y: number, region: CropRegion): CropDragType {
    const { x: rx, y: ry, width: rw, height: rh } = region
    if (Math.abs(x - rx) < HANDLE_HIT && Math.abs(y - ry) < HANDLE_HIT) return 'tl'
    if (Math.abs(x - (rx + rw)) < HANDLE_HIT && Math.abs(y - ry) < HANDLE_HIT) return 'tr'
    if (Math.abs(x - rx) < HANDLE_HIT && Math.abs(y - (ry + rh)) < HANDLE_HIT) return 'bl'
    if (Math.abs(x - (rx + rw)) < HANDLE_HIT && Math.abs(y - (ry + rh)) < HANDLE_HIT) return 'br'
    if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return 'body'
    return 'new'
  }

  function onCropPointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (!cropMode) return
    e.preventDefault()
    const { x, y } = getCoords(e)
    const existingRegion = cropRegion ?? { x: 0, y: 0, width: 0, height: 0 }
    const type = cropRegion ? getDragType(x, y, cropRegion) : 'new'
    dragRef.current = { type, startX: x, startY: y, origRegion: existingRegion }
    if (type === 'new') setLiveCrop({ x, y, width: 0, height: 0 })
    else setLiveCrop(cropRegion)
    window.addEventListener('mousemove', onCropPointerMove)
    window.addEventListener('mouseup', onCropPointerUp)
    window.addEventListener('touchmove', onCropPointerMove, { passive: false })
    window.addEventListener('touchend', onCropPointerUp)
  }

  function onCropPointerMove(e: MouseEvent | TouchEvent) {
    const d = dragRef.current
    if (!d) return
    if ('touches' in e) e.preventDefault()
    const { x, y } = getCoords(e)
    const dx = x - d.startX
    const dy = y - d.startY
    const o = d.origRegion
    const cw = containerRef.current!.offsetWidth
    const ch = containerRef.current!.offsetHeight

    let next: CropRegion
    if (d.type === 'new') {
      next = {
        x: Math.min(d.startX, x), y: Math.min(d.startY, y),
        width: Math.abs(x - d.startX), height: Math.abs(y - d.startY),
      }
    } else if (d.type === 'body') {
      next = {
        x: Math.max(0, Math.min(o.x + dx, cw - o.width)),
        y: Math.max(0, Math.min(o.y + dy, ch - o.height)),
        width: o.width, height: o.height,
      }
    } else {
      // Corner resize: recalculate rect from the fixed opposite corner
      const fixedX = d.type === 'tl' || d.type === 'bl' ? o.x + o.width : o.x
      const fixedY = d.type === 'tl' || d.type === 'tr' ? o.y + o.height : o.y
      const newX = Math.max(0, Math.min(x, cw))
      const newY = Math.max(0, Math.min(y, ch))
      next = {
        x: Math.min(fixedX, newX), y: Math.min(fixedY, newY),
        width: Math.abs(newX - fixedX), height: Math.abs(newY - fixedY),
      }
    }
    setLiveCrop(next)
    dragRef.current = { ...d, origRegion: d.type === 'body' ? next : o }
    if (d.type === 'body') dragRef.current = { ...d, startX: x, startY: y, origRegion: next }
  }

  function onCropPointerUp() {
    window.removeEventListener('mousemove', onCropPointerMove)
    window.removeEventListener('mouseup', onCropPointerUp)
    window.removeEventListener('touchmove', onCropPointerMove)
    window.removeEventListener('touchend', onCropPointerUp)
    const live = liveCropRef.current  // ref always has the latest value, no stale closure
    setLiveCrop(null)
    dragRef.current = null
    if (live && live.width > 10 && live.height > 10) onCropCommit(live)
  }

  useEffect(() => () => {
    window.removeEventListener('mousemove', onCropPointerMove)
    window.removeEventListener('mouseup', onCropPointerUp)
    window.removeEventListener('touchmove', onCropPointerMove)
    window.removeEventListener('touchend', onCropPointerUp)
  }, [])

  function deselectAll() {
    if (!cropMode) onSelect(null)
  }

  // Cursor for crop mode based on what's under the pointer
  function getCropCursor(): string {
    if (!cropMode) return 'default'
    return 'crosshair'
  }

  const displayCrop = cropMode ? (liveCrop ?? cropRegion) : null

  return (
    <div ref={editorRef} style={{ display: 'block', width: '100%', maxWidth: '100%', userSelect: 'none' }}>
      {dankStrip && (
        <div style={{ background: '#ffffff', borderBottom: '2px solid #000', padding: '8px 12px', minHeight: 48, display: 'flex', alignItems: 'center' }}>
          <textarea
            value={dankStrip.text}
            onChange={e => {
              onDankChange({ text: e.target.value })
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            dir="auto" placeholder="כתוב משהו דאנקי..." rows={1}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 22, fontWeight: 'bold', color: '#000', background: 'transparent', textAlign: 'center', lineHeight: 1.3 }}
          />
        </div>
      )}

      {/* Outer wrapper: clips to crop height and hosts the watermark outside the transform */}
      <div
        data-crop-outer
        style={{ position: 'relative', overflow: 'hidden', height: cropTransform ? cropTransform.visibleH : 'auto', transition: 'height 0.2s ease' }}
      >
        {/* Inner container: receives crop transform for live preview */}
        <div
          ref={containerRef}
          data-meme-container
          style={{
            position: 'relative', display: 'block', lineHeight: 0,
            cursor: getCropCursor(),
            transformOrigin: 'top left',
            transform: cropTransform
              ? `scale(${cropTransform.scale}) translate(${cropTransform.tx}px, ${cropTransform.ty}px)`
              : undefined,
          }}
          onClick={deselectAll}
          onMouseDown={onCropPointerDown}
          onTouchStart={onCropPointerDown}
        >
          {imageUrl
            ? <img src={imageUrl} alt="meme template" crossOrigin="anonymous" draggable={false} onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} style={{ width: '100%', maxWidth: '100%', display: 'block', userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties} />
            : <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#ffffff', display: 'block' }} />
          }

          {!cropMode && textLayers.map(layer => (
            <TextLayer
              key={layer.id} layer={layer}
              isSelected={selectedId === layer.id}
              onSelect={() => onSelect(layer.id)}
              onChange={patch => onLayerChange(layer.id, patch)}
              onMove={patch => onLayerMove(layer.id, patch)}
              onMoveCommit={patch => onLayerMoveCommit(layer.id, patch)}
              onDelete={() => onLayerDelete(layer.id)}
              containerRef={containerRef}
            />
          ))}

          {/* Crop UI overlay — shown in crop mode */}
          {cropMode && (
            <>
              {/* Dim everything outside the selection */}
              {displayCrop && displayCrop.width > 0 && (
                <div data-html2canvas-ignore="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 19 }}>
                  {/* top */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: displayCrop.y, background: 'rgba(0,0,0,0.5)' }} />
                  {/* bottom */}
                  <div style={{ position: 'absolute', top: displayCrop.y + displayCrop.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} />
                  {/* left */}
                  <div style={{ position: 'absolute', top: displayCrop.y, left: 0, width: displayCrop.x, height: displayCrop.height, background: 'rgba(0,0,0,0.5)' }} />
                  {/* right */}
                  <div style={{ position: 'absolute', top: displayCrop.y, left: displayCrop.x + displayCrop.width, right: 0, height: displayCrop.height, background: 'rgba(0,0,0,0.5)' }} />
                </div>
              )}

              {/* Dim whole image when no selection yet */}
              {(!displayCrop || displayCrop.width === 0) && (
                <div data-html2canvas-ignore="true" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', pointerEvents: 'none', zIndex: 19 }} />
              )}

              {/* Crop rectangle border */}
              {displayCrop && displayCrop.width > 0 && (
                <div
                  data-html2canvas-ignore="true"
                  style={{
                    position: 'absolute',
                    left: displayCrop.x, top: displayCrop.y,
                    width: displayCrop.width, height: displayCrop.height,
                    border: '2px solid rgba(255,255,255,0.95)',
                    pointerEvents: 'none', zIndex: 20,
                    boxSizing: 'border-box',
                  }}
                />
              )}

              {/* Corner handles */}
              {displayCrop && displayCrop.width > 0 && [
                { left: displayCrop.x - 5, top: displayCrop.y - 5, cursor: 'nw-resize' },
                { left: displayCrop.x + displayCrop.width - 7, top: displayCrop.y - 5, cursor: 'ne-resize' },
                { left: displayCrop.x - 5, top: displayCrop.y + displayCrop.height - 7, cursor: 'sw-resize' },
                { left: displayCrop.x + displayCrop.width - 7, top: displayCrop.y + displayCrop.height - 7, cursor: 'se-resize' },
              ].map((pos, i) => (
                <div
                  key={i}
                  data-html2canvas-ignore="true"
                  style={{
                    position: 'absolute', width: 12, height: 12,
                    background: 'white', border: '2px solid rgba(0,0,0,0.5)',
                    borderRadius: 2, zIndex: 21, pointerEvents: 'none', ...pos,
                  }}
                />
              ))}

              {/* Hint */}
              {!displayCrop && (
                <div data-html2canvas-ignore="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, pointerEvents: 'none' }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 8 }}>גרור לבחירת אזור</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Watermark outside the transform — always at visible bottom-left */}
        <div
          data-html2canvas-ignore="true"
          style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: 'Heebo, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.6)', pointerEvents: 'none', letterSpacing: '0.01em', direction: 'ltr', unicodeBidi: 'embed' }}
        >
          @memeHummus
        </div>
      </div>
    </div>
  )
}
