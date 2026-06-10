import { useRef } from 'react'
import TextLayer from './TextLayer'
import type { TextLayer as TextLayerType, DankStrip } from '@/types'

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
}

export default function MemeEditor({
  imageUrl,
  textLayers,
  dankStrip,
  selectedId,
  onSelect,
  onLayerChange,
  onLayerMove,
  onLayerMoveCommit,
  onLayerDelete,
  onDankChange,
  editorRef,
}: MemeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  function deselectAll(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onSelect(null)
  }

  return (
    <div ref={editorRef} style={{ display: 'inline-block', width: '100%', userSelect: 'none' }}>
      {dankStrip && (
        <div
          style={{
            background: '#ffffff',
            borderBottom: '2px solid #000',
            padding: '8px 12px',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            value={dankStrip.text}
            onChange={e => onDankChange({ text: e.target.value })}
            dir="auto"
            placeholder="כתוב משהו דאנקי..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 22,
              fontWeight: 'bold',
              color: '#000',
              background: 'transparent',
              textAlign: 'center',
            }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        data-meme-container
        style={{ position: 'relative', display: 'block', lineHeight: 0 }}
        onClick={deselectAll}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="meme template"
            crossOrigin="anonymous"
            style={{ width: '100%', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#ffffff', display: 'block' }} />
        )}

        {/* data-html2canvas-ignore: watermark is drawn directly on the canvas in captureCanvas() */}
        <div
          data-html2canvas-ignore="true"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontFamily: 'Heebo, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.75)',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            letterSpacing: '0.01em',
            direction: 'ltr',
            unicodeBidi: 'embed',
          }}
        >
          @memeHummus
        </div>

        {textLayers.map(layer => (
          <TextLayer
            key={layer.id}
            layer={layer}
            isSelected={selectedId === layer.id}
            onSelect={() => onSelect(layer.id)}
            onChange={patch => onLayerChange(layer.id, patch)}
            onMove={patch => onLayerMove(layer.id, patch)}
            onMoveCommit={patch => onLayerMoveCommit(layer.id, patch)}
            onDelete={() => onLayerDelete(layer.id)}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  )
}
