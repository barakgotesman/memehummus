import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useCallback, useEffect } from 'react'
import { ArrowRight, Download, Plus, Flame, Trash2, Copy, Share2, Bold, Italic, Underline, Undo2, Redo2, Crop, ImageUp, SquareDashedBottom } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import { api } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import MemeEditor from '@/components/generator/MemeEditor'
import SimilarTemplates from '@/components/generator/SimilarTemplates'
import GeneratorInfoSection from '@/components/generator/GeneratorInfoSection'
import FontFamilyPicker from '@/components/generator/FontFamilyPicker'
import type { Template, TextLayer, DankStrip, CropRegion } from '@/types'

let nextId = 1

const DEFAULT_FONT = "'Secular One', sans-serif"

function makeLayer(x = 40, y = 40, color = '#ffffff'): TextLayer {
  return { id: nextId++, text: '', x, y, width: 200, fontSize: 26, color, fontFamily: DEFAULT_FONT, bold: false, italic: false, underline: false }
}

type CopyStatus = 'idle' | 'copying' | 'copied'

export default function GeneratorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)
  // null = picker not yet shown (only relevant when id is undefined)
  // 'picking' = showing the two-option picker
  // 'ready' = user made a choice, show editor
  const [createMode, setCreateMode] = useState<'picking' | 'ready'>(id ? 'ready' : 'picking')
  const uploadInputRef = useRef<HTMLInputElement>(null)
  // Tracks object URLs created from file uploads so we can revoke on cleanup
  const uploadedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (id) {
      setCreateMode('ready')
      api.getTemplate(id)
        .then(setTemplate)
        .catch(() => setTemplate(null))
        .finally(() => setLoadingTemplate(false))
    } else {
      setLoadingTemplate(false)
    }
    return () => {
      if (uploadedUrlRef.current) {
        URL.revokeObjectURL(uploadedUrlRef.current)
        uploadedUrlRef.current = null
      }
    }
  }, [id])

  function handleChooseBlank() {
    setTemplate({ id: 'blank', name: 'ריק', imageUrl: null as unknown as string, file_path: '', tags: [], download_count: 0 })
    setCreateMode('ready')
  }

  function handleChooseUpload() {
    uploadInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadedUrlRef.current) URL.revokeObjectURL(uploadedUrlRef.current)
    const url = URL.createObjectURL(file)
    uploadedUrlRef.current = url
    setTemplate({ id: 'upload', name: file.name, imageUrl: url, file_path: '', tags: [], download_count: 0 })
    setCreateMode('ready')
  }

  const { current: textLayers, set: setTextLayers, setSilent: moveTextLayers, undo, redo, canUndo, canRedo, reset: resetLayers } = useHistory<TextLayer[]>([])
  const [dankStrip, setDankStrip] = useState<DankStrip | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Reset canvas when navigating to a different template
  useEffect(() => {
    resetLayers([])
    setDankStrip(null)
    setSelectedId(null)
    setCropRegion(null)
    setCropMode(false)
  }, [id])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo])
  const [downloading, setDownloading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [sharing, setSharing] = useState(false)
  const [cropMode, setCropMode] = useState(false)
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const addText = useCallback(() => {
    const containerEl = editorRef.current?.querySelector('[data-meme-container]') as HTMLElement | null
    const containerW = parseFloat(containerEl?.dataset.trueWidth ?? '0') || containerEl?.offsetWidth || 400
    const containerH = parseFloat(containerEl?.dataset.trueHeight ?? '0') || containerEl?.offsetHeight || 400

    // When crop is active the container is visually scaled up — scale fontSize down to compensate
    // so text added after cropping appears the same visual size as on the full image.
    const cropScale = cropRegion ? containerW / cropRegion.width : 1
    const baseFontSize = Math.round(36 / cropScale)

    const slots = [0.1, 0.35, 0.6, 0.85]
    // Y position relative to full image, mapped through crop region
    const cropOffsetY = cropRegion?.y ?? 0
    const cropH = cropRegion?.height ?? containerH
    const y = Math.round(cropOffsetY + cropH * slots[textLayers.length % slots.length])

    const defaultColor = '#ffffff'
    const layer = { ...makeLayer(cropRegion?.x ?? 40, y, defaultColor), fontSize: baseFontSize }
    setTextLayers(prev => [...prev, layer])
    setSelectedId(layer.id)
  }, [textLayers.length, template?.imageUrl, cropRegion])

  // Style changes (font, color, size, bold/italic/underline) commit to history
  const updateLayer = useCallback((id: number, patch: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  // Position/size changes during drag are silent — only the final drop commits
  const moveLayer = useCallback((id: number, patch: Partial<TextLayer>) => {
    moveTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  const commitLayerMove = useCallback((id: number, patch: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  const deleteLayer = useCallback((id: number) => {
    setTextLayers(prev => prev.filter(l => l.id !== id))
    setSelectedId(null)
  }, [])

  const toggleDank = useCallback(() => {
    setDankStrip(prev => prev ? null : { text: '' })
  }, [])

  /**
   * Wraps text to fit within maxWidth pixels on the given canvas context.
   * Respects explicit newlines in the text and word-wraps long lines.
   */
  function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const result: string[] = []
    for (const para of text.split('\n')) {
      if (!para) { result.push(''); continue }
      const words = para.split(' ')
      let line = ''
      for (const word of words) {
        const candidate = line ? line + ' ' + word : word
        if (line && ctx.measureText(candidate).width > maxWidth) {
          result.push(line)
          line = word
        } else {
          line = candidate
        }
      }
      if (line) result.push(line)
    }
    return result.length ? result : ['']
  }

  async function captureCanvas() {
    setSelectedId(null)
    await new Promise(r => setTimeout(r, 80))
    await document.fonts.ready

    const editorEl = editorRef.current!
    // data-meme-container marks the image's positioning context (not the dank strip)
    const containerEl = editorEl.querySelector('[data-meme-container]') as HTMLElement | null
    const imgEl = editorEl.querySelector('img[alt="meme template"]') as HTMLImageElement | null

    // Natural image dimensions (export resolution)
    const naturalW = imgEl?.naturalWidth ?? 800
    const naturalH = imgEl?.naturalHeight ?? 600

    // Use true (pre-transform) container dimensions stored by ResizeObserver in data attributes.
    // getBoundingClientRect() would return scaled dimensions when a crop transform is active.
    const trueW = parseFloat(containerEl?.dataset.trueWidth ?? '0') || (containerEl ?? editorEl).getBoundingClientRect().width
    const trueH = parseFloat(containerEl?.dataset.trueHeight ?? '0') || (containerEl ?? editorEl).getBoundingClientRect().height
    const scaleX = naturalW / trueW
    const scaleY = naturalH / trueH

    // Pre-calculate dank strip height using a throw-away canvas so we never resize
    // the real canvas after creation (resizing resets the entire context).
    const dankFontSize = Math.round(22 * scaleY)
    const dankLineH = Math.round(dankFontSize * 1.3)
    let dankLines: string[] = []
    let imageOffsetY = 0
    if (dankStrip) {
      const probe = document.createElement('canvas').getContext('2d')!
      probe.font = `bold ${dankFontSize}px Impact, Arial Black, sans-serif`
      dankLines = wrapTextLines(probe, dankStrip.text, naturalW - Math.round(24 * scaleX))
      imageOffsetY = dankLines.length * dankLineH + Math.round(16 * scaleY)
    }

    const canvas = document.createElement('canvas')
    canvas.width = naturalW
    canvas.height = naturalH + imageOffsetY
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw dank strip
    if (dankStrip && imageOffsetY > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, naturalW, imageOffsetY)
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, imageOffsetY)
      ctx.lineTo(naturalW, imageOffsetY)
      ctx.stroke()

      ctx.save()
      ctx.font = `bold ${dankFontSize}px Impact, Arial Black, sans-serif`
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.direction = 'ltr'
      const startY = Math.round((imageOffsetY - dankLines.length * dankLineH) / 2)
      dankLines.forEach((line, i) => {
        ctx.fillText(line, naturalW / 2, startY + i * dankLineH)
      })
      ctx.restore()
    }

    // Draw image
    if (imgEl) {
      ctx.drawImage(imgEl, 0, imageOffsetY, naturalW, naturalH)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, imageOffsetY, naturalW, naturalH)
    }

    // Draw each text layer at proportionally scaled coordinates
    for (const layer of textLayers) {
      if (!layer.text.trim()) continue

      const cx = Math.round(layer.x * scaleX)
      const cy = Math.round(layer.y * scaleY) + imageOffsetY
      const cw = Math.round(layer.width * scaleX)
      const fontSize = Math.round(layer.fontSize * scaleY)
      const lineH = Math.round(fontSize * 1.4)

      ctx.save()

      let fontStr = ''
      if (layer.bold) fontStr += 'bold '
      if (layer.italic) fontStr += 'italic '
      fontStr += `${fontSize}px ${layer.fontFamily}`
      ctx.font = fontStr
      // Physical left-to-right coords — Hebrew glyphs render via Unicode bidi automatically
      ctx.direction = 'ltr'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      const lines = wrapTextLines(ctx, layer.text, cw)
      const centerX = cx + cw / 2

      lines.forEach((line, i) => {
        const ty = cy + i * lineH

        // Black outline via stroke (4 directions)
        const outlineW = Math.max(1, Math.round(fontSize * 0.08))
        ctx.strokeStyle = '#000'
        ctx.lineWidth = outlineW * 2
        ctx.lineJoin = 'round'
        ctx.strokeText(line, centerX, ty)

        ctx.fillStyle = layer.color
        ctx.fillText(line, centerX, ty)

        // Underline: drawn manually since canvas has no text-decoration
        if (layer.underline) {
          const tw = ctx.measureText(line).width
          const uy = ty + fontSize + Math.round(fontSize * 0.08)
          ctx.strokeStyle = layer.color
          ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.06))
          ctx.beginPath()
          ctx.moveTo(centerX - tw / 2, uy)
          ctx.lineTo(centerX + tw / 2, uy)
          ctx.stroke()
        }
      })

      ctx.restore()
    }

    /**
     * Draws the @memeHummus watermark on a given canvas context.
     * Called after cropping so the watermark always lands at the final bottom-left.
     */
    function drawWatermark(targetCtx: CanvasRenderingContext2D, targetH: number) {
      targetCtx.save()
      targetCtx.font = `bold ${Math.round(13 * scaleY)}px Arial, sans-serif`
      targetCtx.fillStyle = 'rgba(255,255,255,0.75)'
      targetCtx.shadowColor = 'rgba(0,0,0,0.6)'
      targetCtx.shadowBlur = 3
      targetCtx.shadowOffsetX = 0
      targetCtx.shadowOffsetY = 1
      targetCtx.direction = 'ltr'
      targetCtx.textAlign = 'left'
      targetCtx.textBaseline = 'bottom'
      targetCtx.fillText('@memeHummus', 10, targetH - 6)
      targetCtx.restore()
    }

    // Apply crop: copy only the selected region into a new canvas, then add watermark.
    // When a dank strip is also present (imageOffsetY > 0), scale it to the crop width
    // and include it above the cropped image so the strip isn't lost in the export.
    if (cropRegion) {
      const cropX = Math.round(cropRegion.x * scaleX)
      const cropY = Math.round(cropRegion.y * scaleY) + imageOffsetY
      const cropW = Math.round(cropRegion.width * scaleX)
      const cropH = Math.round(cropRegion.height * scaleY)
      const cropped = document.createElement('canvas')
      cropped.width = cropW
      const croppedCtx = cropped.getContext('2d')!

      if (imageOffsetY > 0) {
        // Scale the dank strip height proportionally to match the new crop width
        const dankScaledH = Math.round(imageOffsetY * cropW / naturalW)
        cropped.height = dankScaledH + cropH
        croppedCtx.drawImage(canvas, 0, 0, naturalW, imageOffsetY, 0, 0, cropW, dankScaledH)
        croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, dankScaledH, cropW, cropH)
        drawWatermark(croppedCtx, cropped.height)
      } else {
        cropped.height = cropH
        croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
        drawWatermark(croppedCtx, cropH)
      }

      return cropped
    }

    drawWatermark(ctx, canvas.height)

    return canvas
  }

  async function handleDownload() {
    if (!editorRef.current || !template) return
    setDownloading(true)
    try {
      const canvas = await captureCanvas()
      const link = document.createElement('a')
      link.download = `meme-hummus-${template.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      const result = await api.recordDownload(template.id).catch(() => null)
      if (result?.counted) {
        setTemplate(prev => prev ? { ...prev, download_count: (prev.download_count ?? 0) + 1 } : prev)
      }
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setDownloading(false)
    }
  }

  async function handleCopyImage() {
    if (!editorRef.current) return
    setCopyStatus('copying')
    try {
      const canvas = await captureCanvas()
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (e) {
      console.error('Copy failed', e)
      setCopyStatus('idle')
    }
  }

  async function handleNativeShare() {
    if (!editorRef.current || !template) return
    setSharing(true)
    try {
      const canvas = await captureCanvas()
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
      if (!blob) return
      const file = new File([blob], `meme-hummus-${template.id}.png`, { type: 'image/png' })
      await navigator.share({ files: [file], title: template.name || 'מֵם' })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error('Share failed', e)
    } finally {
      setSharing(false)
    }
  }

  async function handleWhatsApp() {
    if (!editorRef.current || !template) return
    setSharing(true)
    try {
      const canvas = await captureCanvas()
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
      if (!blob) return
      const file = new File([blob], `meme-hummus-${template.id}.png`, { type: 'image/png' })

      // On mobile the Web Share API sends the file directly to WhatsApp.
      // On desktop it's not supported for files, so download + open wa.me instead.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        const link = document.createElement('a')
        link.download = `meme-hummus-${template.id}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        window.open('https://wa.me/', '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error('WhatsApp share failed', e)
    } finally {
      setSharing(false)
    }
  }

  if (loadingTemplate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">טוען תבנית…</p>
      </div>
    )
  }

  if (createMode === 'picking') {
    return (
      <div className="flex min-h-screen flex-col bg-background" dir="rtl">
        <Navbar />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-6 sm:gap-8 sm:px-6 sm:py-12">
          {/* Hidden file input */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Hummus meme mascot */}
          <svg width="220" height="136" className="sm:w-[340px] sm:h-[210px]" viewBox="-50 0 340 195" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <style>{`
                @keyframes swingLeft {
                  0%,100% { transform: rotate(-30deg); }
                  50%      { transform: rotate(10deg);  }
                }
                @keyframes swingRight {
                  0%,100% { transform: rotate(30deg);  }
                  50%      { transform: rotate(-10deg); }
                }
                .pita-left-anim {
                  transform-box: fill-box;
                  transform-origin: 50% 100%;
                  animation: swingLeft 1.6s ease-in-out infinite;
                }
                .pita-right-anim {
                  transform-box: fill-box;
                  transform-origin: 50% 100%;
                  animation: swingRight 1.6s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* ── PITA LEFT ── */}
            <g transform="translate(2, 58)">
              <g className="pita-left-anim">
                <ellipse cx="38" cy="42" rx="28" ry="8" fill="#D4B84A"/>
                <ellipse cx="38" cy="36" rx="28" ry="34" fill="#F5E07A"/>
                <ellipse cx="38" cy="36" rx="28" ry="34" fill="none" stroke="#C9A030" strokeWidth="1.8"/>
                <ellipse cx="30" cy="28" rx="5" ry="3.5" fill="#D4A830" opacity="0.5" transform="rotate(-15 30 28)"/>
                <ellipse cx="46" cy="44" rx="4" ry="3" fill="#D4A830" opacity="0.4" transform="rotate(10 46 44)"/>
                <ellipse cx="38" cy="18" rx="3.5" ry="2.5" fill="#C9A030" opacity="0.4"/>
                <path d="M22 10 Q38 4 54 10" stroke="#C9A030" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <ellipse cx="38" cy="70" rx="28" ry="8" fill="#E8CC60" stroke="#C9A030" strokeWidth="1.2"/>
              </g>
            </g>

            {/* ── BOWL (center) ── */}
            <ellipse cx="120" cy="150" rx="50" ry="7" fill="#00000012"/>
            <path d="M70 95 Q68 138 120 140 Q172 138 170 95 Z" fill="#EDD9A3"/>
            <ellipse cx="120" cy="95" rx="50" ry="13" fill="#F7EDCA"/>
            <ellipse cx="120" cy="95" rx="50" ry="13" fill="none" stroke="#C9A84C" strokeWidth="2"/>
            {/* hummus surface */}
            <ellipse cx="120" cy="95" rx="44" ry="10" fill="#D4A843"/>

            {/* ── OLIVE OIL pool ── */}
            <ellipse cx="122" cy="95" rx="16" ry="6" fill="#C8960A" opacity="0.75"/>
            {/* oil drizzle lines */}
            <path d="M106 93 Q114 90 122 93 Q130 96 138 93" stroke="#E8B820" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M110 97 Q118 94 126 97" stroke="#E8B820" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8"/>

            {/* ── PAPRIKA dust ── lots of it, spread across surface */}
            <circle cx="97"  cy="92" r="2.8" fill="#D0321B"/>
            <circle cx="102" cy="98" r="2.2" fill="#C0392B"/>
            <circle cx="109" cy="103" r="2.0" fill="#D0321B"/>
            <circle cx="140" cy="91" r="2.5" fill="#C0392B"/>
            <circle cx="135" cy="99" r="2.0" fill="#D0321B"/>
            <circle cx="142" cy="97" r="1.8" fill="#C0392B"/>
            <circle cx="150" cy="94" r="2.2" fill="#D0321B"/>
            <circle cx="94"  cy="97" r="1.8" fill="#C0392B"/>
            {/* paprika smudge/dust cloud */}
            <ellipse cx="98" cy="94" rx="7" ry="3" fill="#C0392B" opacity="0.18"/>
            <ellipse cx="143" cy="95" rx="8" ry="3" fill="#C0392B" opacity="0.18"/>

            {/* ── ONION RINGS on the plate ── */}
            <g transform="translate(88, 83)">
              <ellipse cx="0" cy="0" rx="10" ry="5" fill="none" stroke="#D4A0C0" strokeWidth="2"/>
              <ellipse cx="0" cy="0" rx="6.5" ry="3" fill="none" stroke="#C890B0" strokeWidth="1.5"/>
              <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="none" stroke="#B87090" strokeWidth="1.2"/>
            </g>

            {/* ── SHIFKA lying on the plate ── */}
            <g transform="translate(118, 91) rotate(-8)">
              <line x1="0" y1="2" x2="4" y2="1" stroke="#3a6400" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 0 Q10 -2 22 -1 Q30 0 34 2 Q30 4 22 5 Q10 6 3 4 Z" fill="#5DB800"/>
              <path d="M3 0 Q10 -2 22 -1 Q30 0 34 2 Q30 4 22 5 Q10 6 3 4 Z" fill="none" stroke="#3d8a00" strokeWidth="0.8"/>
              <path d="M5 1 Q16 -1 28 1" stroke="#8ed640" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
              <path d="M34 2 Q37 1 38 3" stroke="#4a9a00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </g>

            {/* parsley */}
            <circle cx="130" cy="103" r="1.8" fill="#27AE60"/>
            <circle cx="105" cy="90"  r="1.5" fill="#27AE60"/>

            {/* meme face on the bowl front */}
            <circle cx="108" cy="120" r="7" fill="white"/>
            <circle cx="132" cy="120" r="7" fill="white"/>
            <circle cx="110" cy="120" r="4" fill="#222"/>
            <circle cx="134" cy="120" r="4" fill="#222"/>
            <circle cx="111.5" cy="118.5" r="1.5" fill="white"/>
            <circle cx="135.5" cy="118.5" r="1.5" fill="white"/>
            <path d="M112 127 Q120 134 128 127" stroke="#222" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

            {/* ── PITA RIGHT ── */}
            <g transform="translate(160, 58)">
              <g className="pita-right-anim">
                <ellipse cx="38" cy="42" rx="28" ry="8" fill="#D4B84A"/>
                <ellipse cx="38" cy="36" rx="28" ry="34" fill="#F5E07A"/>
                <ellipse cx="38" cy="36" rx="28" ry="34" fill="none" stroke="#C9A030" strokeWidth="1.8"/>
                <ellipse cx="26" cy="30" rx="5" ry="3.5" fill="#D4A830" opacity="0.5" transform="rotate(15 26 30)"/>
                <ellipse cx="44" cy="46" rx="4" ry="3" fill="#D4A830" opacity="0.4" transform="rotate(-10 44 46)"/>
                <ellipse cx="38" cy="18" rx="3.5" ry="2.5" fill="#C9A030" opacity="0.4"/>
                <path d="M22 10 Q38 4 54 10" stroke="#C9A030" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <ellipse cx="38" cy="70" rx="28" ry="8" fill="#E8CC60" stroke="#C9A030" strokeWidth="1.2"/>
              </g>
            </g>

            <text x="155" y="30" fontSize="13" textAnchor="middle">✨</text>
            <text x="120" y="22" fontSize="15" textAnchor="middle">😂</text>
          </svg>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">יצירת מֵם</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-on-surface-variant">בחר כיצד להתחיל</p>
          </div>

          <div className="flex w-full flex-row gap-3">
            <button
              onClick={handleChooseUpload}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary-container/30 px-3 py-5 sm:gap-4 sm:px-6 sm:py-10 text-on-primary-container transition-colors hover:bg-primary-container/50"
            >
              <ImageUp className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
              <div className="text-center">
                <p className="text-sm sm:text-base font-bold">העלה תמונה</p>
                <p className="mt-0.5 text-xs text-on-surface-variant hidden sm:block">מהגלריה או מהמחשב</p>
              </div>
            </button>

            <button
              onClick={handleChooseBlank}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-outline-variant bg-surface-container px-3 py-5 sm:gap-4 sm:px-6 sm:py-10 text-on-surface transition-colors hover:bg-surface-high"
            >
              <SquareDashedBottom className="h-7 w-7 sm:h-10 sm:w-10 text-on-surface-variant" />
              <div className="text-center">
                <p className="text-sm sm:text-base font-bold">תבנית ריקה</p>
                <p className="mt-0.5 text-xs text-on-surface-variant hidden sm:block">התחל מבד לבן</p>
              </div>
            </button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">התבנית לא נמצאה</p>
      </div>
    )
  }

  const selectedLayer = textLayers.find(l => l.id === selectedId)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-6 md:px-6">
        {!id ? (
          <button
            onClick={() => setCreateMode('picking')}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            חזור לבחירה
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            חזור לתבניות
          </button>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left column: toolbar + editor + save/share row */}
          <div className="flex w-full flex-col gap-3 lg:w-3/5">
            {/* Compact icon toolbar above the image */}
            <div className="flex items-center gap-2 rounded-xl bg-surface-container p-3">
              <button
                onClick={addText}
                title="הוסף טקסט"
                className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-primary py-2.5 text-on-primary hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-bold">טקסט</span>
              </button>

              <button
                onClick={toggleDank}
                title="פס דאנק"
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2.5 transition-colors ${
                  dankStrip
                    ? 'bg-secondary text-on-secondary hover:bg-secondary/90'
                    : 'bg-surface-high text-on-surface hover:bg-surface-highest'
                }`}
              >
                <Flame className="h-5 w-5" />
                <span className="text-[10px] font-bold">דאנק</span>
              </button>

              {/* Crop button — always enters crop mode; separate clear button appears when crop is applied */}
              <div className="flex flex-1 flex-col gap-1">
                <button
                  onClick={() => { setCropMode(true) }}
                  title={cropMode ? 'בחר אזור לחיתוך' : cropRegion ? 'חתוך מחדש' : 'חתוך תמונה'}
                  className={`flex w-full flex-col items-center gap-1 rounded-lg py-2.5 transition-colors ${
                    cropMode
                      ? 'bg-tertiary text-on-tertiary hover:bg-tertiary/90'
                      : cropRegion
                        ? 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80'
                        : 'bg-surface-high text-on-surface hover:bg-surface-highest'
                  }`}
                >
                  <Crop className="h-5 w-5" />
                  <span className="text-[10px] font-bold">{cropMode ? 'בחר' : cropRegion ? 'חתוך מחדש' : 'חתוך'}</span>
                </button>
                {cropRegion && !cropMode && (
                  <button
                    onClick={() => { setCropRegion(null); setCropMode(false) }}
                    title="נקה חיתוך"
                    className="w-full rounded-md bg-surface-high py-0.5 text-[10px] font-bold text-error hover:bg-surface-highest transition-colors"
                  >
                    נקה
                  </button>
                )}
              </div>

              <button
                onClick={undo}
                disabled={!canUndo()}
                title="בטל (Ctrl+Z)"
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-outline-variant bg-surface-high py-2.5 text-on-surface transition-colors hover:bg-surface-highest disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Undo2 className="h-5 w-5" />
                <span className="text-[10px] font-bold">בטל</span>
              </button>

              <button
                onClick={redo}
                disabled={!canRedo()}
                title="חזור (Ctrl+Y)"
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-outline-variant bg-surface-high py-2.5 text-on-surface transition-colors hover:bg-surface-highest disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Redo2 className="h-5 w-5" />
                <span className="text-[10px] font-bold">חזור</span>
              </button>
            </div>

            <div className="shadow-card">
              <MemeEditor
                imageUrl={template.imageUrl}
                textLayers={textLayers}
                dankStrip={dankStrip}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onLayerChange={updateLayer}
                onLayerMove={moveLayer}
                onLayerMoveCommit={commitLayerMove}
                onLayerDelete={deleteLayer}
                onDankChange={patch => setDankStrip(prev => prev ? { ...prev, ...patch } : prev)}
                editorRef={editorRef}
                cropMode={cropMode}
                cropRegion={cropRegion}
                onCropCommit={region => { setCropRegion(region); setCropMode(false) }}
              />
            </div>

            {/* Save & share row below the image */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                title="הורד מֵם"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-60"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{downloading ? 'מוריד...' : 'הורד'}</span>
              </button>

              <button
                onClick={handleCopyImage}
                disabled={copyStatus !== 'idle'}
                title="העתק תמונה"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-high py-3 text-sm font-bold text-on-surface hover:bg-surface-highest transition-colors disabled:opacity-60"
              >
                <Copy className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">
                  {copyStatus === 'copying' ? 'מעתיק...' : copyStatus === 'copied' ? '✓ הועתק' : 'העתק'}
                </span>
              </button>

              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  disabled={sharing}
                  title="שתף"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-high py-3 text-sm font-bold text-on-surface hover:bg-surface-highest transition-colors disabled:opacity-60"
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">שתף</span>
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                disabled={sharing}
                title="שתף בוואטסאפ"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#25D366', color: '#fff' }}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden sm:inline">וואטסאפ</span>
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-2/5">

            {selectedLayer && (
              <div className="rounded-xl bg-surface-container p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">עריכת טקסט</h2>
                    <span className="text-xs text-on-surface-variant">
                      טקסט {textLayers.findIndex(l => l.id === selectedId) + 1}
                      {selectedLayer.text ? ` — "${selectedLayer.text.slice(0, 18)}${selectedLayer.text.length > 18 ? '...' : ''}"` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteLayer(selectedId!)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-error hover:bg-surface-high transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    מחק
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Font family */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-on-surface-variant">גופן</span>
                    <FontFamilyPicker
                      value={selectedLayer.fontFamily}
                      onChange={v => updateLayer(selectedId!, { fontFamily: v })}
                    />
                  </div>

                  {/* B / I / U toggles + color */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">סגנון</span>
                    <div className="flex gap-1">
                      {[
                        { key: 'bold' as const, Icon: Bold, label: 'מודגש' },
                        { key: 'italic' as const, Icon: Italic, label: 'נטוי' },
                        { key: 'underline' as const, Icon: Underline, label: 'קו תחתון' },
                      ].map(({ key, Icon, label }) => (
                        <button
                          key={key}
                          title={label}
                          onClick={() => updateLayer(selectedId!, { [key]: !selectedLayer[key] })}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            selectedLayer[key]
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-outline-variant bg-surface-high text-on-surface hover:bg-surface-highest'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>

                    <label className="ms-auto flex cursor-pointer items-center gap-1.5" title="צבע טקסט">
                      <span className="text-xs font-semibold text-on-surface-variant">צבע</span>
                      <div
                        className="h-8 w-8 rounded-lg border-2 border-outline-variant"
                        style={{ backgroundColor: selectedLayer.color }}
                      >
                        <input
                          type="color"
                          value={selectedLayer.color}
                          onChange={e => updateLayer(selectedId!, { color: e.target.value })}
                          className="h-full w-full cursor-pointer opacity-0"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Font size slider — values are in visual pixels (accounting for crop scale) */}
                  {(() => {
                    const containerEl = editorRef.current?.querySelector('[data-meme-container]') as HTMLElement | null
                    const containerW = parseFloat(containerEl?.dataset.trueWidth ?? '0') || 400
                    const cropScale = cropRegion ? containerW / cropRegion.width : 1
                    const visualSize = Math.round(selectedLayer.fontSize * cropScale)
                    const visualMin = Math.round(14 * cropScale)
                    const visualMax = Math.round(80 * cropScale)
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-on-surface-variant">גודל</span>
                          <span className="text-xs tabular-nums text-on-surface-variant">{visualSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={visualMin}
                          max={visualMax}
                          value={visualSize}
                          onChange={e => updateLayer(selectedId!, { fontSize: Math.round(Number(e.target.value) / cropScale) })}
                          className="accent-primary w-full"
                        />
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {textLayers.length > 0 && (
              <div className="rounded-xl bg-surface-container p-4">
                <h2 className="mb-2 text-sm font-bold text-on-surface">שכבות טקסט</h2>
                <div className="flex flex-col gap-1">
                  {textLayers.map((layer, i) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedId(layer.id)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                        selectedId === layer.id
                          ? 'bg-primary-container text-on-primary-container font-bold'
                          : 'bg-surface-high text-on-surface hover:bg-surface-highest'
                      }`}
                    >
                      <span>טקסט {i + 1}</span>
                      <span className="max-w-[120px] truncate opacity-60">{layer.text || 'ריק'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        <GeneratorInfoSection />
        {id && <SimilarTemplates templateId={id} />}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
