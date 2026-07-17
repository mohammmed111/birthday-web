import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Envelope component — luxurious sealed envelope in Royal Sapphire & Gold.
 */
export default function Envelope({ name, onOpen, audioUrl }) {
  const [phase, setPhase] = useState('idle')
  const audioRef = useRef(null)

  function handleClick() {
    if (phase !== 'idle') return
    setPhase('opening')
    if (audioUrl && audioRef.current) {
      audioRef.current.volume = 0.7
      audioRef.current.play().catch(() => {})
    }
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => onOpen(), 400)
    }, 1800)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} loop preload="none" aria-hidden="true" />
      )}

      {/* Twinkling stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top:  `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: Math.random() > 0.5 ? '#E8B54D' : '#F7FAFC',
              opacity: Math.random() * 0.5 + 0.15,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
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
          <span className="text-secondary relative">
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
        className="envelope-scene cursor-pointer select-none"
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
        {phase === 'opening' && (
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

/* ─── Envelope SVG — Sapphire & Champagne Gold ─────────────────────── */
function EnvelopeSVG({ phase }) {
  const isOpen = phase === 'opening' || phase === 'done'

  return (
    <div className="relative w-80 h-56 md:w-96 md:h-64">
      <svg
        viewBox="0 0 384 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="envBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#0C4295" />
            <stop offset="100%" stopColor="#031025" />
          </linearGradient>
          <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3386ED" />
            <stop offset="100%" stopColor="#0F52BA" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#BA913E" />
            <stop offset="30%"  stopColor="#E8B54D" />
            <stop offset="60%"  stopColor="#F9F0DB" />
            <stop offset="100%" stopColor="#E8B54D" />
          </linearGradient>
          <filter id="envGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Envelope body */}
        <rect x="4" y="50" width="376" height="202" rx="12" ry="12" fill="url(#envBody)" />
        <rect x="4" y="50" width="376" height="202" rx="12" ry="12"
          fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.85" />

        {/* Side folds */}
        <path d="M 4 252 L 192 160 L 380 252 Z" fill="#0F52BA" opacity="0.5" />
        <path d="M 4 50 L 192 160 L 4 252 Z"   fill="#093170" opacity="0.25" />
        <path d="M 380 50 L 192 160 L 380 252 Z" fill="#031025" opacity="0.35" />

        {/* Flap */}
        <g style={{
          transformOrigin: '192px 50px',
          transform: isOpen ? 'rotateX(-160deg)' : 'rotateX(0deg)',
          transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <path d="M 4 50 L 192 145 L 380 50 Z" fill="url(#envFlap)" />
          <path d="M 4 50 L 192 145 L 380 50 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.65" />
        </g>

        {/* Wax seal */}
        {!isOpen && (
          <g>
            <circle cx="192" cy="140" r="28" fill="#E8B54D" opacity="0.25" filter="url(#envGlow)" />
            <circle cx="192" cy="140" r="24" fill="url(#goldGrad)" />
            <circle cx="192" cy="140" r="20" fill="none" stroke="#BA913E" strokeWidth="1.2" />
            <text x="192" y="146" textAnchor="middle" fontSize="16" fill="#051937" fontWeight="bold">✦</text>
          </g>
        )}

        {/* Bottom gold dots */}
        {[30,60,90,120,150,180,210,240,270,300,330,354].map((x, i) => (
          <circle key={i} cx={x} cy="252" r="1.2" fill="#E8B54D" opacity="0.4" />
        ))}
      </svg>

      {/* Ambient glow behind envelope */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(232, 181, 77, 0.18) 0%, transparent 70%)',
          opacity: isOpen ? 0 : 1,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
