import { useState, useRef, useCallback, useEffect } from 'react'

export default function DraggableGestureButton({ active, gesture, onStart, onStop }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 72 })
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 })
  const moved = useRef(false)
  const btnRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    dragging.current = true
    moved.current = false
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      bx: pos.x,
      by: pos.y,
    }
    e.preventDefault()
  }, [pos])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true

    setPos({
      x: Math.min(Math.max(dragStart.current.bx + dx, 0), window.innerWidth - 120),
      y: Math.min(Math.max(dragStart.current.by + dy, 0), window.innerHeight - 48),
    })
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
  }, [])

  // touch support
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    dragging.current = true
    moved.current = false
    dragStart.current = { mx: t.clientX, my: t.clientY, bx: pos.x, by: pos.y }
  }, [pos])

  const onTouchMove = useCallback((e) => {
    if (!dragging.current) return
    const t = e.touches[0]
    const dx = t.clientX - dragStart.current.mx
    const dy = t.clientY - dragStart.current.my
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    setPos({
      x: Math.min(Math.max(dragStart.current.bx + dx, 0), window.innerWidth - 120),
      y: Math.min(Math.max(dragStart.current.by + dy, 0), window.innerHeight - 48),
    })
    e.preventDefault()
  }, [])

  const onTouchEnd = useCallback(() => {
    dragging.current = false
  }, [])

  const handleClick = useCallback(() => {
    if (moved.current) return  // was a drag, not a click
    active ? onStop() : onStart()
  }, [active, onStart, onStop])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <button
      ref={btnRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        padding: '10px 18px',
        borderRadius: '999px',
        border: '1px solid #ccc',
        background: active ? '#1D9E75' : '#fff',
        color: active ? '#fff' : '#333',
        cursor: dragging.current ? 'grabbing' : 'grab',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {active ? `✋ ${gesture}` : '🖐 Air Control'}
    </button>
  )
}