import { useRef, useState } from 'react'
import { Input } from '@/components/ui/Input'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import { useSuggestion } from '@/hooks/useSuggestion'

interface ImageDropZoneProps {
  preview: string | null
  onChange: (file: File, url: string) => void
}

function ImageDropZone({ preview, onChange }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    onChange(file, URL.createObjectURL(file))
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center min-h-[220px] ${
        dragging
          ? 'border-primary-container bg-primary-container/10'
          : 'border-outline-variant bg-surface-variant/20 hover:border-primary-container'
      }`}
    >
      {preview ? (
        <img src={preview} alt="תצוגה מקדימה" className="max-h-52 max-w-full rounded-xl object-contain" />
      ) : (
        <div className="text-center p-8 select-none">
          <p className="text-4xl mb-3">📤</p>
          <p className="font-semibold text-on-surface">גרור תמונה לכאן</p>
          <p className="text-sm text-on-surface-variant mt-1">או לחץ לבחירת קובץ</p>
          <p className="text-xs text-on-surface-variant/60 mt-2">PNG, JPG עד 5MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  )
}

export default function SuggestionPage() {
  const {
    fields,
    setEmail,
    setDescription,
    image,
    setImage,
    clearImage,
    submitting,
    error,
    done,
    submit,
  } = useSuggestion()

  if (done) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 pb-20 md:pb-0">
          <div className="text-center max-w-sm">
            <p className="text-6xl mb-4">🎉</p>
            <h1 className="text-2xl font-bold text-on-surface mb-2">תודה רבה!</h1>
            <p className="text-on-surface-variant mb-6">ההצעה שלך התקבלה ונבדוק אותה בקרוב.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-primary-fixed-dim transition-colors"
            >
              חזרה לדף הבית
            </a>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6 md:py-14 pb-24 md:pb-14">
        <div className="text-center mb-8">
          <span className="text-4xl">📤</span>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">הצע תבנית</h1>
          <p className="mt-2 text-on-surface-variant">מצאת תמונה מושלמת למם? שתף אותה איתנו ואולי נוסיף אותה לאתר!</p>
        </div>

        <form onSubmit={submit} className="bg-surface-variant/30 rounded-2xl border border-outline-variant/50 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              תמונה <span className="text-red-500">*</span>
            </label>
            <ImageDropZone preview={image.preview} onChange={setImage} />
            {image.preview && (
              <button
                type="button"
                onClick={clearImage}
                className="mt-2 text-xs text-on-surface-variant hover:text-red-600 underline transition-colors"
              >
                הסר תמונה
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              תיאור <span className="text-on-surface-variant font-normal">(אופציונלי)</span>
            </label>
            <Input
              value={fields.description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="על מה המם? הקשר, רגש, סיטואציה…"
              className="text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              אימייל <span className="text-on-surface-variant font-normal">(אופציונלי — לעדכון אם נוסיף)</span>
            </label>
            <Input
              type="email"
              value={fields.email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="text-left placeholder:text-right"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || !image.file}
            className="w-full py-3 rounded-xl bg-primary-container text-on-surface font-bold text-base hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
          >
            {submitting ? 'שולח…' : 'שלח הצעה'}
          </button>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
