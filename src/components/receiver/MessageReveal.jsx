import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Button from '../shared/Button.jsx'

/**
 * MessageReveal — dramatic reveal of the birthday message with confetti
 */
export default function MessageReveal({ name, message }) {
  const [phase, setPhase] = useState('confetti') // confetti | message | done
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    // Fire confetti
    fireConfetti()

    // Transition to message phase
    setTimeout(() => setPhase('message'), 1400)
    setTimeout(() => setPhase('done'), 2800)
  }, [])

  function fireConfetti() {
    const style = getComputedStyle(document.documentElement)
    const p = style.getPropertyValue('--color-primary').trim() || '#0F52BA'
    const s = style.getPropertyValue('--color-secondary').trim() || '#E8B54D'
    const m = style.getPropertyValue('--color-muted').trim() || '#334C76'
    const colors = [p, s, m, '#FFFFFF', '#F5F5F5']
    const origin = { y: 0.6 }

    // Left burst
    confetti({
      particleCount: 60,
      spread: 55,
      angle: 60,
      origin: { x: 0, y: 0.7 },
      colors,
      gravity: 0.8,
      scalar: 1.1,
    })

    // Right burst
    confetti({
      particleCount: 60,
      spread: 55,
      angle: 120,
      origin: { x: 1, y: 0.7 },
      colors,
      gravity: 0.8,
      scalar: 1.1,
    })

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin,
        colors,
        gravity: 1,
        scalar: 0.9,
        shapes: ['star'],
      })
    }, 300)

    // Second wave
    setTimeout(() => {
      confetti({ particleCount: 40, spread: 70, origin: { x: 0.2, y: 0.5 }, colors, gravity: 0.9 })
      confetti({ particleCount: 40, spread: 70, origin: { x: 0.8, y: 0.5 }, colors, gravity: 0.9 })
    }, 700)
  }

  // Split message into words for stagger animation
  const words = message.split(' ')

  const waText = encodeURIComponent('🎂 عيد ميلاد سعيد! شارك الفرحة مع الجميع')
  const waLink = `https://wa.me/?text=${waText}`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
      {/* Stars decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-secondary text-lg select-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              fontSize: `${Math.random() * 10 + 8}px`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-lg"
      >
        {/* Card glow */}
        <div
          className="absolute -inset-4 rounded-3xl blur-xl opacity-30"
          style={{ background: 'radial-gradient(ellipse, var(--color-secondary) 0%, var(--color-primary) 70%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Card */}
        <div className="relative gradient-border rounded-3xl p-8 md:p-10 bg-surface/90 backdrop-blur-lg gold-shimmer">

          {/* Big emoji */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.34,1.56,0.64,1] }}
            className="text-6xl mb-6"
            aria-hidden="true"
          >
            🎂
          </motion.div>

          {/* Recipient name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="text-secondary/70 text-sm font-label tracking-widest mb-1"
          >
            إلى
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="font-headline text-3xl md:text-4xl text-secondary mb-6"
          >
            {name}
          </motion.h2>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="h-px bg-gradient-to-e from-transparent via-secondary to-transparent mb-8"
          />

          {/* Message with word-by-word animation */}
          <motion.div
            className="font-body text-lg md:text-xl leading-loose text-textMain/90"
            dir="auto"
            lang="ar"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.06 }}
                className="inline-block me-1.5"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          {/* Gold divider bottom */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.5 + words.length * 0.06 + 0.5 }}
            className="h-px bg-gradient-to-e from-transparent via-secondary to-transparent mt-8 mb-6"
          />

          {/* Signature */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2 + words.length * 0.06 }}
            className="text-secondary/60 text-sm font-label"
          >
            🌹 بكل المحبة والتقدير
          </motion.p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.5 + words.length * 0.06 }}
        className="mt-8 flex flex-wrap gap-4 justify-center"
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            fireConfetti()
          }}
          aria-label="إعادة إطلاق الاحتفال"
          icon={<span>🎉</span>}
        >
          احتفل مجدداً!
        </Button>

        <Button
          variant="outlined"
          size="md"
          onClick={() => window.open(waLink, '_blank', 'noopener')}
          aria-label="مشاركة الفرحة عبر واتساب"
          className="border-green-500/60 text-green-400 hover:bg-green-500/10"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          }
        >
          شارك الفرحة
        </Button>
      </motion.div>

      {/* Create your own */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        className="mt-8"
      >
        <a
          href="/"
          className="text-xs text-textMain/30 hover:text-secondary/60 transition-colors duration-200 font-label underline underline-offset-4"
        >
          أنشئ تهنئتك الخاصة ✨
        </a>
      </motion.div>
    </div>
  )
}
