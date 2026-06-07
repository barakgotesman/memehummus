import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useCallback, useEffect } from 'react'
import { ArrowRight, Download, Plus, Flame, Trash2, Copy, Share2, Bold, Italic, Underline, Undo2, Redo2 } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import html2canvas from 'html2canvas'
import { api } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import MemeEditor from '@/components/generator/MemeEditor'
import SimilarTemplates from '@/components/generator/SimilarTemplates'
import GeneratorInfoSection from '@/components/generator/GeneratorInfoSection'
import FontFamilyPicker from '@/components/generator/FontFamilyPicker'
import type { Template, TextLayer, DankStrip } from '@/types'

let nextId = 1

const DEFAULT_FONT = "'Secular One', sans-serif"

function makeLayer(x = 40, y = 40, color = '#ffffff'): TextLayer {
  return { id: nextId++, text: '', x, y, width: 200, fontSize: 36, color, fontFamily: DEFAULT_FONT, bold: false, italic: false, underline: false }
}

type CopyStatus = 'idle' | 'copying' | 'copied'

export default function GeneratorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)

  useEffect(() => {
    if (!id) {
      setTemplate({ id: 'blank', name: 'ריק', imageUrl: null as unknown as string, file_path: '', tags: [], download_count: 0 })
      setLoadingTemplate(false)
      return
    }
    api.getTemplate(id)
      .then(setTemplate)
      .catch(() => setTemplate(null))
      .finally(() => setLoadingTemplate(false))
  }, [id])

  const { current: textLayers, set: setTextLayers, setSilent: moveTextLayers, undo, redo, canUndo, canRedo } = useHistory<TextLayer[]>([])
  const [dankStrip, setDankStrip] = useState<DankStrip | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [sharing, setSharing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const addText = useCallback(() => {
    // Spread layers vertically so they don't overlap — cycle through 4 rows
    const containerH = editorRef.current?.offsetHeight ?? 400
    const slots = [0.1, 0.35, 0.6, 0.85]
    const y = Math.round(containerH * slots[textLayers.length % slots.length])
    const defaultColor = template?.imageUrl ? '#ffffff' : '#000000'
    const layer = makeLayer(40, y, defaultColor)
    setTextLayers(prev => [...prev, layer])
    setSelectedId(layer.id)
  }, [textLayers.length, template?.imageUrl])

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

  async function captureCanvas() {
    setSelectedId(null)
    await new Promise(r => setTimeout(r, 80))
    return html2canvas(editorRef.current!, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      backgroundColor: null,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    })
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
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: template.name || 'מֵם' })
      } else {
        const link = document.createElement('a')
        link.download = `meme-hummus-${template.id}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setTimeout(() => window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer'), 500)
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          חזור לתבניות
        </button>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full overflow-hidden rounded-xl shadow-card lg:w-3/5">
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
            />
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-2/5">
            <div className="rounded-xl bg-surface-container p-4">
              <h2 className="mb-3 text-sm font-bold text-on-surface">כלים</h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={addText}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  הוסף טקסט
                </button>

                <button
                  onClick={toggleDank}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
                    dankStrip
                      ? 'bg-secondary text-on-secondary hover:bg-secondary/90'
                      : 'bg-surface-high text-on-surface hover:bg-surface-highest'
                  }`}
                >
                  <Flame className="h-4 w-4" />
                  {dankStrip ? 'הסר פס דאנק' : 'פס דאנק'}
                </button>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={undo}
                    disabled={!canUndo()}
                    title="בטל (Ctrl+Z)"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-high px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-highest disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    בטל
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo()}
                    title="בצע שוב (Ctrl+Y)"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-high px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-highest disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                    חזור
                  </button>
                </div>
              </div>
            </div>

            {selectedLayer && (
              <div className="rounded-xl bg-surface-container p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-on-surface">עריכת טקסט</h2>
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

                  {/* Font size slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-on-surface-variant">גודל</span>
                      <span className="text-xs tabular-nums text-on-surface-variant">{selectedLayer.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={14}
                      max={80}
                      value={selectedLayer.fontSize}
                      onChange={e => updateLayer(selectedId!, { fontSize: Number(e.target.value) })}
                      className="accent-primary w-full"
                    />
                  </div>
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

            <div className="rounded-xl bg-surface-container p-4">
              <h2 className="mb-3 text-sm font-bold text-on-surface">שמור ושתף</h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3 text-sm font-bold text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? 'מוריד...' : 'הורד מֵם'}
                </button>

                <button
                  onClick={handleCopyImage}
                  disabled={copyStatus !== 'idle'}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-high py-3 text-sm font-bold text-on-surface hover:bg-surface-highest transition-colors disabled:opacity-60"
                >
                  <Copy className="h-4 w-4" />
                  {copyStatus === 'copying' ? 'מעתיק...' : copyStatus === 'copied' ? '✓ הועתק!' : 'העתק תמונה'}
                </button>

                {typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    disabled={sharing}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-high py-3 text-sm font-bold text-on-surface hover:bg-surface-highest transition-colors disabled:opacity-60"
                  >
                    <Share2 className="h-4 w-4" />
                    {sharing ? 'מכין לשיתוף...' : 'שתף'}
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  disabled={sharing}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#25D366', color: '#fff' }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  שתף בוואטסאפ
                </button>
              </div>
            </div>
          </div>
        </div>
        <GeneratorInfoSection />
        {id && <SimilarTemplates templateId={id} />}
      </main>
    </div>
  )
}
