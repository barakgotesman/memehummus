import { useState, FormEvent } from 'react'
import { api } from '@/lib/api'

export function useSuggestion() {
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function setImage(file: File, previewUrl: string) {
    setImageFile(file)
    setPreview(previewUrl)
  }

  function clearImage() {
    setImageFile(null)
    setPreview(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!imageFile) { setError('יש לצרף תמונה'); return }
    setError(null)
    setSubmitting(true)
    try {
      const { uploadUrl, path } = await api.suggestions.getUploadUrl(imageFile.name)
      await api.suggestions.uploadFile(imageFile, uploadUrl)
      await api.suggestions.submit({ email, image_path: path, description })
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    fields: { email, description },
    setEmail,
    setDescription,
    image: { file: imageFile, preview },
    setImage,
    clearImage,
    submitting,
    error,
    done,
    submit,
  }
}
