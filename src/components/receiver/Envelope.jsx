import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Envelope component — luxurious sealed envelope in Royal Sapphire & Gold.
 * Features a wax seal that "breaks" on click, pulsing gold glow, and twinkling stars.
 */
export default function Envelope({ name, onOpen, onStartAudio }) {
  const [phase, setPhase] = useState('idle')   // idle | seal-breaking | opening | done

  function handleClick() {
    if (phase !== 'idle') return

    // Start seal break animation
    setPhase('seal-breaking')

    // Play audio via parent (user gesture context)
    if (onStartAudio) {
      onStartAudio()
    }

    // Seal break → flap opens → transition
    setTimeout(() => setPhase('opening'), 600)
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => onOpen(), 400)
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">

      {/* Twinkling stars — slower & softer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  `${Math.random() * 2.5 + 0.8}px`,
              height: `${Math.random() * 2.5 + 0.8}px`,
              top:  `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: Math.random() > 0.5 ? '#E8B54D' : '#F7FAFC',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `twinkle ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10"
      >
        <p className="text-secondary/70 text-sm font-label mb-2 tracking-widest uppercase">
          رسالة خاصة إليك
        </p>
        <h1 className="font-headline text-3xl md:text-4xl text-tertiary">
          عزيزي/عزيزتي{' '}
          <span className="text-secondary relative" style={{ fontFamily: '"Amiri", serif' }}>
            {name}
            <span className="absolute -bottom-1 start-0 end-0 h-px bg-gradient-to-e from-secondary/0 via-secondary to-secondary/0" />
          </span>
        </h1>
        <p className="mt-3 text-tertiary/60 font-body text-base">
          وصلك رسالة خاصة بمناسبة يومك المميز 🌟
        </p>
      </motion.div>

      {/* Envelope */}
      <motion.div
        className="envelope-scene cursor-pointer select-none relative"
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={phase === 'idle' ? { scale: 1.04, y: -4 } : {}}
        whileTap={phase === 'idle' ? { scale: 0.97 } : {}}
        aria-label="افتح الظرف لرؤية المفاجأة"
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      >
        {/* Pulsing glow behind envelope */}
        <div
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(232, 181, 77, 0.25) 0%, rgba(232, 181, 77, 0.08) 40%, transparent 70%)',
            animation: phase === 'idle' ? 'pulseGlowEnvelope 3s ease-in-out infinite' : 'none',
            opacity: phase === 'idle' ? 1 : 0,
            transition: 'opacity 0.6s',
          }}
          aria-hidden="true"
        />
        <EnvelopeSVG phase={phase} />
      </motion.div>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-tertiary/50 font-label text-sm"
          >
            👆 انقر على الظرف لفتحه
          </motion.p>
        )}
        {(phase === 'seal-breaking' || phase === 'opening') && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-secondary font-label text-sm animate-pulse"
          >
            ✨ جاري الفتح...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Envelope SVG — Royal Sapphire & Champagne Gold ───────────────── */
function EnvelopeSVG({ phase }) {
  const isOpen = phase === 'opening' || phase === 'done'
  const sealBreaking = phase === 'seal-breaking' || isOpen

  return (
    <div className="relative w-80 h-56 md:w-96 md:h-64">
      <svg
        viewBox="0 0 384 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 8px 30px rgba(5, 25, 55, 0.6))' }}
        aria-hidden="true"
      >
        <defs>
          {/* Deep sapphire body gradient */}
          <linearGradient id="envBody" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%"   stopColor="#0A2647" />
            <stop offset="100%" stopColor="#051937" />
          </linearGradient>
          {/* Flap gradient */}
          <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0F3D6B" />
            <stop offset="100%" stopColor="#0A2647" />
          </linearGradient>
          {/* Gold gradient */}
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#BA913E" />
            <stop offset="30%"  stopColor="#E8B54D" />
            <stop offset="60%"  stopColor="#F9F0DB" />
            <stop offset="100%" stopColor="#E8B54D" />
          </linearGradient>
          {/* Wax seal gradient */}
          <radialGradient id="sealGrad" cx="50%" cy="45%">
            <stop offset="0%"   stopColor="#F9F0DB" />
            <stop offset="40%"  stopColor="#E8B54D" />
            <stop offset="100%" stopColor="#BA913E" />
          </radialGradient>
          {/* Seal shadow */}
          <filter id="sealShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E8B54D" floodOpacity="0.5" />
          </filter>
          {/* Glow filter */}
          <filter id="envGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Envelope body ── */}
        <rect x="4" y="50" width="376" height="202" rx="10" ry="10" fill="url(#envBody)" />

        {/* Gold border — full perimeter */}
        <rect x="4" y="50" width="376" height="202" rx="10" ry="10"
          fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.9" />

        {/* Inner subtle pattern — diagonal lines for texture */}
        <line x1="20" y1="70" x2="364" y2="70" stroke="#E8B54D" strokeWidth="0.3" opacity="0.15" />
        <line x1="20" y1="235" x2="364" y2="235" stroke="#E8B54D" strokeWidth="0.3" opacity="0.15" />

        {/* Side folds with depth */}
        <path d="M 4 252 L 192 155 L 380 252 Z" fill="#0A2647" opacity="0.6" />
        <path d="M 4 50 L 192 155 L 4 252 Z"   fill="#071E3A" opacity="0.3" />
        <path d="M 380 50 L 192 155 L 380 252 Z" fill="#041228" opacity="0.4" />

        {/* Gold accent lines on folds */}
        <path d="M 4 252 L 192 155" stroke="#E8B54D" strokeWidth="0.5" opacity="0.2" />
        <path d="M 380 252 L 192 155" stroke="#E8B54D" strokeWidth="0.5" opacity="0.2" />

        {/* ── Flap ── */}
        <g style={{
          transformOrigin: '192px 50px',
          transform: isOpen ? 'rotateX(-160deg)' : 'rotateX(0deg)',
          transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <path d="M 4 50 L 192 140 L 380 50 Z" fill="url(#envFlap)" />
          <path d="M 4 50 L 192 140 L 380 50 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.7" />
          {/* Inner flap highlight */}
          <path d="M 40 56 L 192 125 L 344 56" fill="none" stroke="#E8B54D" strokeWidth="0.4" opacity="0.2" />
        </g>

        {/* ── Wax seal ── */}
        <g
          style={{
            transformOrigin: '192px 140px',
            animation: sealBreaking ? 'sealBreak 0.6s ease-out forwards' : 'none',
          }}
        >
          {!isOpen && (
            <>
              {/* Outer glow ring */}
              <circle cx="192" cy="140" r="32" fill="#E8B54D" opacity="0.15" filter="url(#envGlow)" />
              {/* Main seal body */}
              <circle cx="192" cy="140" r="26" fill="url(#sealGrad)" filter="url(#sealShadow)" />
              {/* Scalloped edge effect — small bumps around perimeter */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2
                const bx = 192 + Math.cos(angle) * 26
                const by = 140 + Math.sin(angle) * 26
                return <circle key={i} cx={bx} cy={by} r="2.5" fill="#E8B54D" opacity="0.7" />
              })}
              {/* Inner ring */}
              <circle cx="192" cy="140" r="20" fill="none" stroke="#BA913E" strokeWidth="1" opacity="0.7" />
              {/* Inner decorative ring */}
              <circle cx="192" cy="140" r="16" fill="none" stroke="#BA913E" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 3" />
              {/* Center symbol */}
              <text x="192" y="146" textAnchor="middle" fontSize="18" fill="#051937" fontWeight="bold" opacity="0.85">✦</text>
            </>
          )}
        </g>

        {/* Bottom gold pearl dots */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 15 + i * (354 / 17)
          return <circle key={i} cx={x} cy="250" r="1" fill="#E8B54D" opacity="0.35" />
        })}

        {/* Top edge gold dots */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 30 + i * (324 / 11)
          return <circle key={i} cx={x} cy="52" r="0.8" fill="#E8B54D" opacity="0.25" />
        })}
      </svg>
    </div>
  )
}
