import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startBlowDetection, stopBlowDetection } from '../../utils/audioDetect.js'
import Button from '../shared/Button.jsx'

const FLICKER_ANIMATIONS = ['flicker', 'flicker-2', 'flicker-3']

export default function InteractiveCake({ name, age, onAllExtinguished }) {
  const digits = useMemo(() => age !== undefined && age !== null ? String(age).split('') : [], [age])
  const hasAge = digits.length > 0
  const numCandles = hasAge ? digits.length : 3

  const [candles, setCandles] = useState(Array(numCandles).fill(true))
  const [micState, setMicState] = useState('idle') // idle | requesting | calibrating | active | denied | unavailable
  const [volume, setVolume] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const [allOut, setAllOut] = useState(false)
  const [smokeVisible, setSmokeVisible] = useState(Array(numCandles).fill(false))
  const fallbackTimerRef = useRef(null)

  const anyLit = candles.some(Boolean)

  // Random per-candle animation config (stable across renders)
  const candleAnimConfig = useMemo(() =>
    Array.from({ length: numCandles }, () => ({
      animation: FLICKER_ANIMATIONS[Math.floor(Math.random() * FLICKER_ANIMATIONS.length)],
      duration: 1.2 + Math.random() * 1.0,
      delay: Math.random() * 0.8,
    }))
  , [numCandles])

  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => setShowFallback(true), 6000)
    return () => clearTimeout(fallbackTimerRef.current)
  }, [])

  useEffect(() => {
    if (!anyLit && !allOut) {
      setAllOut(true)
      stopBlowDetection()
      playBell()
      setTimeout(() => onAllExtinguished(), 2000)
    }
  }, [candles, anyLit, allOut, onAllExtinguished])

  function extinguishCandle(index) {
    setCandles(prev => {
      if (!prev[index]) return prev
      const next = [...prev]
      next[index] = false
      return next
    })
    setSmokeVisible(prev => { const n = [...prev]; n[index] = true; return n })
    setTimeout(() => setSmokeVisible(prev => { const n = [...prev]; n[index] = false; return n }), 2000)
    playPop()
  }

  // Called by audioDetect when a candle should go out
  const handleCandleOut = useCallback((index) => {
    extinguishCandle(index)
  }, [])

  function startDetection() {
    setMicState('calibrating')
    startBlowDetection({
      candleCount: numCandles,
      onCandleOut: handleCandleOut,
      onVolume: (v) => setVolume(v),
      onEnergy: (e) => setEnergy(e),
      onCalibrationDone: () => setMicState('active'),
      onError: (err) => {
        setMicState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable')
        setShowFallback(true)
      },
    })
  }

  function requestMic() {
    setMicState('requesting')
    startDetection()
  }

  // Fallback: one candle per click
  function extinguishOneManually() {
    const litIndex = candles.findIndex(Boolean)
    if (litIndex >= 0) {
      extinguishCandle(litIndex)
    }
  }

  function playPop() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(700, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.28, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.start(); osc.stop(ctx.currentTime + 0.18)
    } catch {}
  }

  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const freqs = [523, 659, 784, 1047]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = f
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
        gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + i * 0.15 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1.3)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 1.3)
      })
    } catch {}
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <p className="text-secondary/70 text-sm font-label tracking-widest mb-1">كل عام وأنت بخير</p>
        <h2 className="font-headline text-3xl md:text-4xl text-textMain">
          <span className="text-secondary">{name}</span> 🎂
        </h2>
        <p className="mt-2 text-textMain/60 font-body text-sm">
          {micState === 'calibrating'
            ? '🔊 جاري معايرة الصوت... انتظر لحظة'
            : micState === 'active'
            ? '🎤 انفخ في الميكروفون لإطفاء الشموع!'
            : micState === 'denied'
            ? '🔇 تم رفض إذن الميكروفون'
            : 'استعد لإطفاء الشموع...'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.34,1.56,0.64,1] }}
      >
        <CakeSVG
          candles={candles}
          smokeVisible={smokeVisible}
          volume={volume}
          micActive={micState === 'active'}
          candleAnimConfig={candleAnimConfig}
          digits={digits}
          hasAge={hasAge}
        />
      </motion.div>

      {/* Volume / Energy meter */}
      <AnimatePresence>
        {(micState === 'active' || micState === 'calibrating') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 w-56 space-y-2"
          >
            <p className="text-xs text-textMain/50 font-label">
              {micState === 'calibrating' ? 'معايرة...' : 'قوة النفخ'}
            </p>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-background)' }}>
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.min(volume * 100, 100)}%`,
                  background: 'linear-gradient(to right, var(--color-secondary), var(--color-text-main))',
                }}
              />
            </div>
            {micState === 'active' && (
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-background)' }}>
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${Math.min(energy * 100, 100)}%`,
                    background: 'linear-gradient(to right, var(--color-secondary), var(--color-secondary), var(--color-text-main))',
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-8 space-y-3 w-full max-w-xs">
        {micState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="rounded-2xl p-4 text-sm text-textMain/70 font-label border border-secondary/20 bg-surface/50">
              <p className="text-secondary font-semibold mb-1">🎤 كيف يعمل؟</p>
              <p>انفخ في الميكروفون — كلما كانت نفختك أقوى، زاد عدد الشموع المنطفئة!</p>
            </div>
            <Button variant="primary" size="md" className="w-full" onClick={requestMic}
              aria-label="السماح بالميكروفون لإطفاء الشموع" icon={<span>🎤</span>}>
              انفخ الشموع بالميكروفون
            </Button>
          </motion.div>
        )}

        {micState === 'requesting' && (
          <p className="text-secondary/70 text-sm font-label animate-pulse">
            جاري طلب إذن الميكروفون...
          </p>
        )}

        {micState === 'calibrating' && (
          <p className="text-secondary/70 text-sm font-label animate-pulse">
            🔊 جاري قياس مستوى الصوت المحيط...
          </p>
        )}

        {micState === 'active' && (
          <p className="text-secondary text-sm font-label">
            ✅ الميكروفون نشط — انفخ على الشموع!
          </p>
        )}

        <AnimatePresence>
          {(showFallback || micState === 'denied' || micState === 'unavailable') && anyLit && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Button variant="outlined" size="md" className="w-full" onClick={extinguishOneManually}
                aria-label="اضغط لإطفاء شمعة" icon={<span>💨</span>}>
                اضغط لإطفاء شمعة
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Luxury Cake SVG — Ivory & Gold with ornate decorations ──── */
function CakeSVG({ candles, smokeVisible, volume, micActive, candleAnimConfig, digits, hasAge }) {
  const getCandlePositions = (count) => {
    if (count === 1) return [160]
    if (count === 2) return [135, 185]
    if (count === 3) return [110, 160, 210]
    if (count === 4) return [100, 140, 180, 220]
    return [72, 116, 160, 204, 248]
  }
  const candlePositions = getCandlePositions(candles.length)

  return (
    <div className="relative">
      <svg viewBox="0 0 320 300" width="320" height="300"
        xmlns="http://www.w3.org/2000/svg" aria-label="كيك عيد الميلاد" className="drop-shadow-2xl">
        <defs>
          {/* Cake layer gradients - Ivory */}
          <linearGradient id="layer1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FBF3E7" />
            <stop offset="100%" stopColor="#F5E8D4" />
          </linearGradient>
          <linearGradient id="layer2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FBF3E7" />
            <stop offset="100%" stopColor="#EADBB" />
          </linearGradient>
          <linearGradient id="layer3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FBF3E7" />
            <stop offset="100%" stopColor="#DFCEAD" />
          </linearGradient>
          {/* Frosting gradient */}
          <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FBF3E7" />
          </linearGradient>
          {/* Flame gradients */}
          <linearGradient id="flameOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="35%"  stopColor="#FFE97D" />
            <stop offset="70%"  stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <radialGradient id="flameGlow" cx="50%" cy="50%">
            <stop offset="0%"   stopColor="var(--color-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
          {/* Gold trim gradient */}
          <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#D4AF37" />
            <stop offset="50%"  stopColor="#FFF0A8" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          {/* Gold plate gradient */}
          <linearGradient id="goldPlate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#D4AF37" />
            <stop offset="50%"  stopColor="#FFF0A8" />
            <stop offset="100%" stopColor="#C6912E" />
          </linearGradient>
        </defs>

        {/* ─── Gold Plate / Base ─── */}
        <ellipse cx="160" cy="268" rx="148" ry="14" fill="url(#goldPlate)" />
        <ellipse cx="160" cy="268" rx="148" ry="14" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
        <ellipse cx="160" cy="268" rx="135" ry="10" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        {/* Plate shine */}
        <ellipse cx="120" cy="266" rx="40" ry="4" fill="#FFFFFF" opacity="0.15" />

        {/* ─── Layer 3 (bottom) ─── */}
        <rect x="28" y="218" width="264" height="52" rx="8" fill="url(#layer3)" />
        {/* Gold trim top */}
        <rect x="28" y="218" width="264" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.85" />
        {/* Gold trim bottom */}
        <rect x="28" y="267" width="264" height="2.5" rx="1.2" fill="url(#goldTrim)" opacity="0.5" />
        {/* Pearl beads along top border */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 38 + i * (244 / 21)
          return <circle key={`p3t-${i}`} cx={x} cy="221" r="1.8" fill="var(--color-accent)" opacity="0.55" />
        })}
        {/* Pearl beads along bottom border */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 38 + i * (244 / 21)
          return <circle key={`p3b-${i}`} cx={x} cy="267" r="1.5" fill="var(--color-accent)" opacity="0.35" />
        })}
        {/* Gold swag/drape decoration */}
        <path d="M 40 230 Q 70 248 100 230 Q 130 248 160 230 Q 190 248 220 230 Q 250 248 280 230"
          fill="none" stroke="var(--color-accent)" strokeWidth="1.2" opacity="0.4" />
        <path d="M 40 232 Q 70 250 100 232 Q 130 250 160 232 Q 190 250 220 232 Q 250 250 280 232"
          fill="none" stroke="var(--color-accent)" strokeWidth="0.6" opacity="0.2" />
        {/* Drape tassel dots */}
        {[70, 130, 190, 250].map(x => (
          <circle key={`t3-${x}`} cx={x} cy="249" r="2" fill="var(--color-accent)" opacity="0.45" />
        ))}

        {/* Frosting 3 */}
        <path d="M 28 218 Q 45 200 62 216 Q 79 200 96 216 Q 113 200 130 216 Q 147 200 164 216 Q 181 200 198 216 Q 215 200 232 216 Q 249 200 266 216 Q 283 200 292 218 L 28 218 Z"
          fill="url(#frostingGrad)" />

        {/* ─── Layer 2 (middle) ─── */}
        <rect x="48" y="168" width="224" height="54" rx="8" fill="url(#layer2)" />
        <rect x="48" y="168" width="224" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.8" />
        <rect x="48" y="218" width="224" height="2.5" rx="1.2" fill="url(#goldTrim)" opacity="0.5" />
        {/* Pearl beads */}
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 56 + i * (208 / 17)
          return <circle key={`p2-${i}`} cx={x} cy="171" r="1.8" fill="var(--color-accent)" opacity="0.5" />
        })}
        {/* Gem-like center decorations */}
        {[88, 128, 160, 192, 232].map(x => (
          <g key={`gem2-${x}`}>
            <circle cx={x} cy="192" r="5" fill="#D4AF37" opacity="0.5" />
            <circle cx={x} cy="192" r="3" fill="#FBF3E7" opacity="0.5" />
            <circle cx={x} cy="191" r="1.5" fill="#FFFFFF" opacity="0.5" />
          </g>
        ))}
        {/* Gold swag */}
        <path d="M 60 182 Q 88 198 116 182 Q 144 198 172 182 Q 200 198 228 182 Q 256 198 260 182"
          fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.35" />

        {/* Frosting 2 */}
        <path d="M 48 170 Q 64 154 80 168 Q 96 154 112 168 Q 128 154 144 168 Q 160 154 176 168 Q 192 154 208 168 Q 224 154 240 168 Q 256 154 272 170 L 48 170 Z"
          fill="url(#frostingGrad)" />

        {/* ─── Layer 1 (top) ─── */}
        <rect x="73" y="126" width="174" height="46" rx="8" fill="url(#layer1)" />
        <rect x="73" y="126" width="174" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.85" />
        <rect x="73" y="168" width="174" height="2.5" rx="1.2" fill="url(#goldTrim)" opacity="0.5" />
        {/* Pearl beads */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 80 + i * (160 / 13)
          return <circle key={`p1-${i}`} cx={x} cy="129" r="1.6" fill="var(--color-accent)" opacity="0.55" />
        })}

        {/* Frosting 1 */}
        <path d="M 73 128 Q 89 112 105 126 Q 121 112 137 126 Q 153 112 169 126 Q 185 112 201 126 Q 217 112 233 126 Q 247 112 247 128 L 73 128 Z"
          fill="url(#frostingGrad)" />

        {/* Happy Birthday text */}
        <text x="160" y="152" textAnchor="middle" fontSize="9" fontFamily="'Amiri', serif" fill="#D4AF37" opacity="0.8">
          Happy Birthday
        </text>

        {/* ─── Candles ─── */}
        {candlePositions.map((x, i) => (
          <CandleSVG
            key={i}
            x={x}
            lit={candles[i]}
            smokeVisible={smokeVisible[i]}
            volume={volume}
            micActive={micActive}
            animConfig={candleAnimConfig[i]}
            digit={hasAge ? digits[i] : null}
            isNumber={hasAge}
          />
        ))}
      </svg>
    </div>
  )
}

function CandleSVG({ x, lit, smokeVisible, volume, micActive, animConfig, digit, isNumber }) {
  const candleY = 86

  return (
    <g>
      {isNumber ? (
        <>
          <text x={x} y={candleY + 36} fontSize="42" fontWeight="bold" fontFamily="system-ui, sans-serif" fill="#FBF3E7" stroke="#D4AF37" strokeWidth="2.5" textAnchor="middle">
            {digit}
          </text>
          {/* Wick for number candle */}
          <line x1={x} y1={candleY - 4} x2={x} y2={candleY - 10} stroke="#333" strokeWidth="1.5" />
        </>
      ) : (
        <>
          {/* Candle body — bright gold with stripe */}
          <rect x={x - 5} y={candleY} width="10" height="40" rx="3" fill="#D4AF37" opacity="0.9" />
          {/* Candle stripe */}
          <rect x={x - 5} y={candleY + 12} width="10" height="3" rx="1" fill="#D4AF37" opacity="0.4" />
          <rect x={x - 5} y={candleY + 24} width="10" height="3" rx="1" fill="#D4AF37" opacity="0.4" />
          {/* Wax drip */}
          <path d={`M ${x - 4} ${candleY + 3} Q ${x - 6} ${candleY + 10} ${x - 4} ${candleY + 16}`}
            fill="#FFF" opacity="0.4" />

          {/* Wick */}
          <line x1={x} y1={candleY} x2={x} y2={candleY - 6} stroke="#333" strokeWidth="1.5" />
        </>
      )}

      {/* Outer glow halo — golden transparent */}
      {lit && (
        <ellipse cx={x} cy={candleY - 18} rx="12" ry="14" fill="url(#flameGlow)"
          style={{
            animation: `${animConfig.animation} ${animConfig.duration}s ease-in-out infinite`,
            animationDelay: `${animConfig.delay}s`,
          }}
        />
      )}

      {/* Flame — extinguish animation when going out */}
      {lit && (
        <g
          style={{
            transformOrigin: `${x}px ${candleY - 6}px`,
            animation: micActive && volume > 0.3
              ? `${animConfig.animation} 0.3s ease-in-out infinite`
              : `${animConfig.animation} ${animConfig.duration}s ease-in-out infinite`,
            animationDelay: `${animConfig.delay}s`,
          }}
        >
          {/* Outer flame */}
          <path
            d={`M ${x} ${candleY - 28} C ${x-7} ${candleY-20} ${x-6} ${candleY-10} ${x} ${candleY-6} C ${x+6} ${candleY-10} ${x+7} ${candleY-20} ${x} ${candleY-28} Z`}
            fill="url(#flameOuter)" opacity="0.95"
          />
          {/* Inner core — bright white/yellow */}
          <path
            d={`M ${x} ${candleY - 22} C ${x-3} ${candleY-16} ${x-3} ${candleY-10} ${x} ${candleY-8} C ${x+3} ${candleY-10} ${x+3} ${candleY-16} ${x} ${candleY-22} Z`}
            fill="#FFFFFF" opacity="0.95"
          />
        </g>
      )}

      {/* Smoke */}
      {smokeVisible && !lit && (
        <g style={{ animation: 'smokeRise 2s ease-out forwards' }}>
          <path d={`M ${x} ${candleY-8} Q ${x+4} ${candleY-16} ${x} ${candleY-24} Q ${x-4} ${candleY-32} ${x} ${candleY-40}`}
            stroke="#888" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}
