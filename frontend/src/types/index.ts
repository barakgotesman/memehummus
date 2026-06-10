export interface Tag {
  id: string
  name: string
  count?: number
}

export interface Template {
  id: string
  name: string
  description?: string | null
  status?: string
  imageUrl: string
  file_path: string
  createdAt?: string
  tags: Tag[]
  download_count: number
}

export interface TextLayer {
  id: number
  text: string
  x: number
  y: number
  width: number
  fontSize: number
  color: string
  fontFamily: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface DankStrip {
  text: string
}

export interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface Suggestion {
  id: string
  email?: string | null
  image_path: string
  description?: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
