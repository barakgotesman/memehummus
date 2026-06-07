import { useState, useRef } from 'react'

interface ImageUploadZoneProps {
  preview: string | null
  onChange: (file: File, url: string) => void
}

export default function ImageUploadZone({ preview, onChange }: ImageUploadZoneProps) {
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
      className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center min-h-[180px] ${
        dragging ? 'border-primary-container bg-primary-container/10' : 'border-outline-variant bg-background hover:border-primary-container'
      }`}
    >
      {preview ? (
        <img src={preview} alt="תצוגה מקדימה" className="max-h-40 max-w-full rounded-lg object-contain" />
      ) : (
        <div className="text-center p-6 select-none">
          <p className="text-3xl mb-2">📤</p>
          <p className="text-sm font-medium text-on-surface">גרור לכאן או לחץ לבחירת קובץ</p>
          <p className="text-xs text-on-surface-variant mt-1">PNG, JPG עד 5MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  )
}
