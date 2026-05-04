import React, { useRef, useCallback, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import { Toaster } from "react-hot-toast"
import ProtectedRoute from './Routes/ProtectedRoutes.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminRoute from './Routes/AdminRoute.jsx'
import { useHandGestures } from './hooks/useHandGestures'
import DraggableGestureButton from './components/DraggableGestureButton.jsx'

function App() {
  // null = scroll the whole window, not a specific div
   const [panelOpen, setPanelOpen] = useState(false)  
  const scrollRef = useRef(null)
  const containerRef = useRef(null)

  const handleClickAt = useCallback((nx, ny) => {
  const rect = containerRef.current?.getBoundingClientRect()
  if (!rect) return
  const absX = rect.left + nx * rect.width
  const absY = rect.top + ny * rect.height

  // canvas is on top (zIndex 9998), skip it and find the real element below
  const canvas = canvasRef.current
  if (canvas) canvas.style.display = 'none'
  const el = document.elementFromPoint(absX, absY)
  if (canvas) canvas.style.display = 'block'

  if (!el) return

  // walk up the DOM to find the nearest clickable element
  const clickable = el.closest('button, a, [role="button"], input, select, textarea, label, [onClick]') || el

  if (typeof clickable.click === 'function') {
    clickable.click()
  } else {
    // fallback: dispatch a real pointer event
    clickable.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: absX,
      clientY: absY,
    }))
  }
}, [])

  const handleLeftEdge = useCallback(() => {
    setPanelOpen(true)                                 // ← opens panel via gesture
  }, [])

  const { videoRef, canvasRef, gesture, active, start, stop} = useHandGestures(
    scrollRef,
    handleClickAt,
    { sensitivity: 350 },
    handleLeftEdge                                     // ← NEW: 4th arg
  )

  return (
    <div ref={containerRef} style={{ minHeight: '100vh' }}>
      {/* Hidden video element — MediaPipe reads from it */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay muted playsInline />

  {/* Hand overlay canvas — covers full screen, pointer-events:none so clicks pass through */}
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,
        pointerEvents: 'none',   // ← critical: clicks pass through to UI
        display: active ? 'block' : 'none',
      }}
    />


      <Toaster position="top-right" reverseOrder={false} />

      {/* Floating gesture toggle button */}
      <DraggableGestureButton
        active={active}
        gesture={gesture}
        onStart={start}
        onStop={stop}
      />

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/dashboard' element={<ProtectedRoute><UserDashboard  panelOpen={panelOpen} setPanelOpen={setPanelOpen}/></ProtectedRoute>} />
        <Route path='/admin' element={<AdminRoute><AdminDashboard  panelOpen={panelOpen} setPanelOpen={setPanelOpen}/></AdminRoute>} />
      </Routes>
    </div>
  )
}

export default App