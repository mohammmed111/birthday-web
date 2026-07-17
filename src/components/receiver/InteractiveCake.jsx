import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { startBlowDetection, stopBlowDetection } from '../../utils/audioDetect.js'
import Button from '../shared/Button.jsx'

const NUM_CANDLES = 5

export default function InteractiveCake({ name, onAllExtinguished }) {
  const [candles, setCandles] = useState(Array(NUM_CANDLES).fill(true))
  const [micState, setMicState] = useState('idle')
  const [volume, setVolume] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const [allOut, setAllOut] = useState(false)
  const [smokeVisible, setSmokeVisible] = useState(Array(NUM_CANDLES).fill(false))
  const fallbackTimerRef = useRef(null)

  const anyLit = candles.some(Boolean)

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
    setSmokeVisible(prev => { const n = [...prev]; n[index] = true; return n })
    setTimeout(() => setSmokeVisible(prev => { const n = [...prev]; n[index] = false; return n }), 2000)
    setCandles(prev => { const n = [...prev]; n[index] = false; return n })
    playPop()
  }

  const handleBlow = useCallback(() => {
    setCandles(prev => {
      const litIndices = prev.map((lit, i) => lit ? i : -1).filter(i => i >= 0)
      if (litIndices.length === 0) return prev
      const target = litIndices[Math.floor(Math.random() * litIndices.length)]
      const next = [...prev]
      next[target] = false
      setSmokeVisible(s => { const n = [...s]; n[target] = true; return n })
      setTimeout(() => setSmokeVisible(s => { const n = [...s]; n[target] = false; return n }), 2000)
      playPop()
      setTimeout(() => { if (next.some(Boolean)) startDetection() }, 600)
      return next
    })
  }, [])

  function startDetection() {
    setMicState('active')
    startBlowDetection({
      onBlow: handleBlow,
      onError: (err) => {
        setMicState(err.name === 'NotAllowedError' ? 'denied' : 'unavailable')
        setShowFallback(true)
      },
      onVolume: (v) => setVolume(v),
    })
  }

  function requestMic() {
    setMicState('requesting')
    startDetection()
  }

  function extinguishAll() {
    stopBlowDetection()
    const indices = candles.map((lit, i) => lit ? i : -1).filter(i => i >= 0)
    indices.forEach((idx, delay) => {
      setTimeout(() => extinguishCandle(idx), delay * 260)
    })
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
        <h2 className="font-headline text-3xl md:text-4xl text-tertiary">
          <span className="text-secondary">{name}</span> 🎂
        </h2>
        <p className="mt-2 text-tertiary/60 font-body text-sm">
          {micState === 'active'
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
        <CakeSVG candles={candles} smokeVisible={smokeVisible} volume={volume} micActive={micState === 'active'} />
      </motion.div>

      {/* Volume meter */}
      <AnimatePresence>
        {micState === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 w-48 space-y-2"
          >
            <p className="text-xs text-tertiary/50 font-label">قوة النفخ</p>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#020B19' }}>
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${Math.min(volume * 100, 100)}%`,
                  background: 'linear-gradient(to right, #E8B54D, #ECD193)',
                }}
              />
            </div>
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
            <div className="gradient-border rounded-2xl p-4 text-sm text-tertiary/70 font-label">
              <p className="text-secondary font-semibold mb-1">🎤 كيف يعمل؟</p>
              <p>سنستخدم الميكروفون فقط للكشف عن صوت نفخك — لا يُسجَّل أي شيء.</p>
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

        {micState === 'active' && (
          <p className="text-secondary text-sm font-label">
            ✅ الميكروفون نشط — انفخ على الشموع!
          </p>
        )}

        <AnimatePresence>
          {(showFallback || micState === 'denied' || micState === 'unavailable') && anyLit && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Button variant="outlined" size="md" className="w-full" onClick={extinguishAll}
                aria-label="اضغط لإطفاء الشموع" icon={<span>💨</span>}>
                اضغط لإطفاء الشموع
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Cake SVG — Sapphire & Gold ───────────────────────────────────── */
function CakeSVG({ candles, smokeVisible, volume, micActive }) {
  const candlePositions = [56, 104, 152, 200, 248]

  return (
    <div className="relative">
      <svg viewBox="0 0 320 280" width="320" height="280"
        xmlns="http://www.w3.org/2000/svg" aria-label="كيك عيد الميلاد" className="drop-shadow-2xl">
        <defs>
          {/* Cake layer gradients — deep sapphire */}
          <linearGradient id="layer1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#093170" />
            <stop offset="100%" stopColor="#0F52BA" />
          </linearGradient>
          <linearGradient id="layer2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#06214A" />
            <stop offset="100%" stopColor="#0F52BA" />
          </linearGradient>
          <linearGradient id="layer3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0F52BA" />
            <stop offset="100%" stopColor="#031025" />
          </linearGradient>
          {/* Frosting — cool ivory */}
          <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F7FAFC" />
            <stop offset="100%" stopColor="#EBF2F8" />
          </linearGradient>
          {/* Flame */}
          <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="40%"  stopColor="#F9F0DB" />
            <stop offset="80%"  stopColor="#E8B54D" />
            <stop offset="100%" stopColor="#BA913E" />
          </linearGradient>
          {/* Candle glow */}
          <radialGradient id="glowGrad" cx="50%" cy="70%">
            <stop offset="0%"   stopColor="#F9F0DB" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8B54D" stopOpacity="0" />
          </radialGradient>
          {/* Gold trim gradient */}
          <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#BA913E" />
            <stop offset="50%"  stopColor="#F9F0DB" />
            <stop offset="100%" stopColor="#BA913E" />
          </linearGradient>
        </defs>

        {/* Plate shadow */}
        <ellipse cx="160" cy="262" rx="140" ry="10" fill="#E8B54D" opacity="0.2" />

        {/* ─── Layer 3 (bottom) ─── */}
        <rect x="30" y="210" width="260" height="50" rx="8" fill="url(#layer3)" />
        <rect x="30" y="210" width="260" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.8" />
        <rect x="30" y="257" width="260" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.5" />
        {[60,90,120,150,180,210,240].map(x => (
          <circle key={x} cx={x} cy="233" r="3" fill="#E8B54D" opacity="0.35" />
        ))}

        {/* Frosting 3 */}
        <path d="M 30 210 Q 50 195 70 208 Q 90 195 110 208 Q 130 195 150 208 Q 170 195 190 208 Q 210 195 230 208 Q 250 195 270 208 Q 290 195 290 210 L 30 210 Z"
          fill="url(#frostingGrad)" />

        {/* ─── Layer 2 ─── */}
        <rect x="50" y="160" width="220" height="54" rx="8" fill="url(#layer2)" />
        <rect x="50" y="160" width="220" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.7" />
        <rect x="50" y="210" width="220" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.5" />
        {[80,120,160,200,240].map(x => (
          <g key={x}>
            <circle cx={x} cy="183" r="5" fill="#E8B54D" opacity="0.45" />
            <circle cx={x} cy="183" r="2.5" fill="#051937" opacity="0.5" />
          </g>
        ))}

        {/* Frosting 2 */}
        <path d="M 50 162 Q 70 148 90 160 Q 110 148 130 160 Q 150 148 170 160 Q 190 148 210 160 Q 230 148 250 160 Q 270 148 270 162 L 50 162 Z"
          fill="url(#frostingGrad)" />

        {/* ─── Layer 1 (top) ─── */}
        <rect x="75" y="118" width="170" height="46" rx="8" fill="url(#layer1)" />
        <rect x="75" y="118" width="170" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.8" />
        <rect x="75" y="160" width="170" height="3" rx="1.5" fill="url(#goldTrim)" opacity="0.5" />

        {/* Frosting 1 */}
        <path d="M 75 120 Q 92 106 109 118 Q 126 106 143 118 Q 160 106 177 118 Q 194 106 211 118 Q 228 106 245 120 L 75 120 Z"
          fill="url(#frostingGrad)" />

        {/* Happy Birthday text */}
        <text x="160" y="143" textAnchor="middle" fontSize="9" fontFamily="serif" fill="#F7FAFC" opacity="0.7">
          Happy Birthday
        </text>

        {/* ─── Candles ─── */}
        {candlePositions.map((x, i) => (
          <CandleSVG key={i} x={x} lit={candles[i]} smokeVisible={smokeVisible[i]}
            volume={volume} micActive={micActive} />
        ))}
      </svg>
    </div>
  )
}

function CandleSVG({ x, lit, smokeVisible, volume, micActive }) {
  const candleY = 78

  return (
    <g>
      {/* Candle body — bright gold */}
      <rect x={x - 5} y={candleY} width="10" height="40" rx="3" fill="#E8B54D" opacity="0.9" />
      {/* Wax drip */}
      <path d={`M ${x - 5} ${candleY + 5} Q ${x - 3} ${candleY + 9} ${x - 5} ${candleY + 13}`}
        fill="#F7FAFC" opacity="0.45" />

      {/* Wick */}
      <line x1={x} y1={candleY} x2={x} y2={candleY - 6} stroke="#051937" strokeWidth="1.5" />

      {/* Glow */}
      {lit && (
        <ellipse cx={x} cy={candleY - 18} rx="13" ry="15" fill="url(#glowGrad)" className="candle-glow" />
      )}

      {/* Flame */}
      {lit && (
        <g
          className="candle-glow"
          style={{
            transformOrigin: `${x}px ${candleY - 6}px`,
            animation: micActive && volume > 0.3
              ? 'flicker 0.3s ease-in-out infinite'
              : 'flicker 1.5s ease-in-out infinite',
          }}
        >
          {/* Outer flame */}
          <path
            d={`M ${x} ${candleY - 28} C ${x-7} ${candleY-20} ${x-6} ${candleY-10} ${x} ${candleY-6} C ${x+6} ${candleY-10} ${x+7} ${candleY-20} ${x} ${candleY-28} Z`}
            fill="url(#flameGrad)" opacity="0.95"
          />
          {/* Inner core — ivory white */}
          <path
            d={`M ${x} ${candleY - 22} C ${x-3} ${candleY-16} ${x-3} ${candleY-10} ${x} ${candleY-8} C ${x+3} ${candleY-10} ${x+3} ${candleY-16} ${x} ${candleY-22} Z`}
            fill="#FFFFFF" opacity="0.92"
          />
        </g>
      )}

      {/* Smoke */}
      {smokeVisible && !lit && (
        <g style={{ animation: 'smokeRise 2s ease-out forwards' }}>
          <path d={`M ${x} ${candleY-8} Q ${x+4} ${candleY-16} ${x} ${candleY-24} Q ${x-4} ${candleY-32} ${x} ${candleY-40}`}
            stroke="#F7FAFC" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}
