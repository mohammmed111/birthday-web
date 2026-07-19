import React, { useEffect, useState } from 'react'

let toastTimeout = null

/**
 * Toast notification component
 * Usage: <Toast message="..." icon="✓" visible={true} onHide={() => {}} />
 */
export default function Toast({ message, icon = '✓', visible, onHide, duration = 3000 }) {
  const [phase, setPhase] = useState('hidden') // hidden | enter | visible | exit

  useEffect(() => {
    if (visible) {
      setPhase('enter')
      const t1 = setTimeout(() => setPhase('visible'), 50)
      const t2 = setTimeout(() => setPhase('exit'), duration)
      const t3 = setTimeout(() => {
        setPhase('hidden')
        if (onHide) onHide()
      }, duration + 350)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    } else {
      setPhase('hidden')
    }
  }, [visible, duration, onHide])

  if (phase === 'hidden') return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed bottom-6 inset-x-0 mx-auto w-fit z-50',
        'flex items-center gap-3',
        'px-5 py-3 rounded-2xl',
        'bg-surface/90 border border-secondary/40',
        'text-textMain font-label text-sm font-medium',
        'backdrop-blur-md shadow-2xl shadow-background/60',
        phase === 'enter' || phase === 'visible' ? 'toast-enter' : 'toast-exit',
      ].join(' ')}
    >
      <span className="text-secondary text-base font-bold flex-shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  )
}
