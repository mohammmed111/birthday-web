import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { motion, AnimatePresence } from 'framer-motion'
import Envelope from '../components/receiver/Envelope.jsx'
import InteractiveCake from '../components/receiver/InteractiveCake.jsx'
import MessageReveal from '../components/receiver/MessageReveal.jsx'

const stages = ['envelope', 'cake', 'message']

export default function ReceiverPage() {
  const { id } = useParams()
  const [stage, setStage] = useState('envelope')
  const [birthdayData, setBirthdayData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | success | error | notfound

  // Fetch birthday document from Firestore
  useEffect(() => {
    if (!id) {
      setStatus('notfound')
      return
    }

    async function fetchBirthday() {
      try {
        const docRef = doc(db, 'birthdays', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setBirthdayData(docSnap.data())
          setStatus('success')
        } else {
          setStatus('notfound')
        }
      } catch (err) {
        console.error('Firestore getDoc error:', err)
        setStatus('error')
      }
    }

    fetchBirthday()
  }, [id])

  // Shared background
  const bg = (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-primary-950 to-neutral-950" />
      <div className="absolute top-0 start-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 bg-secondary/40" />
      <div className="absolute bottom-0 end-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 bg-primary-900/60" />
      <div className="noise-overlay" />
    </div>
  )

  // ─── Loading State ──────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Pulsing envelope icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl"
          >
            ✉️
          </motion.div>

          {/* Shimmer loading bars */}
          <div className="space-y-3 w-48">
            <div className="h-2.5 rounded-full bg-primary-800/60 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-e from-transparent via-secondary/30 to-transparent animate-shimmer" />
            </div>
            <div className="h-2 rounded-full bg-primary-800/40 overflow-hidden w-3/4 mx-auto">
              <div className="h-full w-full bg-gradient-to-e from-transparent via-secondary/20 to-transparent animate-shimmer" />
            </div>
          </div>

          <p className="text-tertiary/50 text-sm font-label mt-2">
            جاري تحميل مفاجأتك...
          </p>
        </div>
      </div>
    )
  }

  // ─── Error / Not Found State ─────────────────────────────────────────
  if (status === 'error' || status === 'notfound') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        {bg}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="gradient-border rounded-3xl p-10 bg-primary-950/80 backdrop-blur-xl">
            <div className="text-6xl mb-5">
              {status === 'notfound' ? '😔' : '⚠️'}
            </div>
            <h1 className="font-headline text-3xl text-tertiary mb-3">
              {status === 'notfound'
                ? 'هذا الرابط غير صالح'
                : 'حدث خطأ في التحميل'}
            </h1>
            <p className="text-tertiary/60 font-body text-base mb-8 leading-relaxed">
              {status === 'notfound'
                ? 'قد يكون الرابط تالفاً أو مُعدَّلاً. تواصل مع من أرسل لك الرابط للحصول على رابط صحيح.'
                : 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مجدداً.'}
            </p>

            <div className="flex flex-col gap-3">
              {status === 'error' && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 bg-secondary text-neutral-950 font-semibold px-6 py-3 rounded-2xl hover:bg-secondary-400 active:scale-95 transition-all duration-200 font-label"
                >
                  <span>🔄</span>
                  <span>إعادة المحاولة</span>
                </button>
              )}
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-primary-900/50 text-tertiary/80 border border-secondary/30 font-medium px-6 py-3 rounded-2xl hover:bg-primary-800/60 active:scale-95 transition-all duration-200 font-label"
              >
                <span>✨</span>
                <span>أنشئ تهنئتك الخاصة</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Success State — The Experience ──────────────────────────────────
  const { name, message, audioUrl } = birthdayData

  return (
    <div className="min-h-screen relative overflow-hidden">
      {bg}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {stage === 'envelope' && (
            <motion.div
              key="envelope"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Envelope
                name={name}
                audioUrl={audioUrl}
                onOpen={() => setStage('cake')}
              />
            </motion.div>
          )}

          {stage === 'cake' && (
            <motion.div
              key="cake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <InteractiveCake
                name={name}
                onAllExtinguished={() => setStage('message')}
              />
            </motion.div>
          )}

          {stage === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <MessageReveal name={name} message={message} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage progress dots */}
        <div
          className="fixed bottom-4 inset-x-0 flex justify-center gap-2 z-20"
          role="progressbar"
          aria-label="مرحلة التجربة"
          aria-valuenow={stages.indexOf(stage) + 1}
          aria-valuemin={1}
          aria-valuemax={stages.length}
        >
          {stages.map((s, i) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-500 ${
                s === stage
                  ? 'w-6 h-2 bg-secondary'
                  : stages.indexOf(stage) > i
                  ? 'w-2 h-2 bg-secondary/50'
                  : 'w-2 h-2 bg-tertiary/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
