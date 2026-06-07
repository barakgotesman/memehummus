import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

export function useHistory<T>(initial: T) {
  const [current, setCurrent] = useState<T>(initial)
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])

  // Committed set — pushes to history
  const set = useCallback((value: T | ((prev: T) => T)) => {
    setCurrent(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
      past.current = [...past.current.slice(-(MAX_HISTORY - 1)), prev]
      future.current = []
      return next
    })
  }, [])

  // Silent set — updates state without touching history (use during drag moves)
  const setSilent = useCallback((value: T | ((prev: T) => T)) => {
    setCurrent(prev => typeof value === 'function' ? (value as (p: T) => T)(prev) : value)
  }, [])

  const undo = useCallback(() => {
    if (past.current.length === 0) return
    const previous = past.current[past.current.length - 1]
    past.current = past.current.slice(0, -1)
    setCurrent(prev => {
      future.current = [prev, ...future.current]
      return previous
    })
  }, [])

  const redo = useCallback(() => {
    if (future.current.length === 0) return
    const next = future.current[0]
    future.current = future.current.slice(1)
    setCurrent(prev => {
      past.current = [...past.current, prev]
      return next
    })
  }, [])

  // canUndo/canRedo are derived from refs — stable during render
  const canUndo = () => past.current.length > 0
  const canRedo = () => future.current.length > 0

  return { current, set, setSilent, undo, redo, canUndo, canRedo }
}
