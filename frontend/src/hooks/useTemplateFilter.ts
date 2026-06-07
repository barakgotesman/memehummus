import { useState } from 'react'

export function useTemplateFilter() {
  const [activeTag, setActiveTag] = useState('הכל')
  return { activeTag, setActiveTag }
}
