import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CreateForm from '../components/creator/CreateForm.jsx'
import LinkResultCard from '../components/creator/LinkResultCard.jsx'

export default function CreatorPage() {
  const [generatedLink, setGeneratedLink] = useState(null)
  const [previewTheme, setPreviewTheme] = useState('sapphire')

  useEffect(() => {
    document.documentElement.dataset.theme = previewTheme
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [previewTheme])

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500" style={{ background: 'var(--page-bg)' }}>
      {/* Noise texture */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Ambient blobs (Sapphire only) */}
      <div className="theme-blobs fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -end-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }}
        />
        <div
          className="absolute -bottom-40 -start-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)' }}
        />
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-secondary), transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-2 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-1.5 rounded-full mb-6">
              <span className="text-secondary text-sm font-label">✨ تهنئة لا تُنسى</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-textMain leading-tight">
              أنشئ لحظة{' '}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--color-secondary), var(--color-text-main), var(--color-secondary))' }}>
                لا تُنسى
              </span>
            </h1>
            <p className="mt-4 text-textMain/80 font-body text-base md:text-lg max-w-md mx-auto leading-relaxed">
              أنشئ رابط تهنئة عيد ميلاد مخصصاً، وأرسله لمن تحب ليعيش تجربة تفاعلية فريدة 🎂
            </p>
          </motion.div>
        </header>

        {/* Steps indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-6 mb-2"
          aria-label="خطوات إنشاء التهنئة"
        >
          {['اكتب الرسالة', 'احصل على الرابط', 'شارك المفاجأة'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center">
                  <span className="text-secondary text-xs font-bold" dir="ltr">{i + 1}</span>
                </div>
                <span className="text-textMain/80 text-xs font-label hidden sm:block">{step}</span>
              </div>
              {i < 2 && <div className="w-6 h-px bg-secondary/20" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Main card */}
        <main className="flex-1 flex items-start justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-lg"
          >
            <div className="form-card rounded-3xl p-6 md:p-8">
              <AnimatePresence mode="wait">
                {!generatedLink ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CreateForm onLinkCreated={setGeneratedLink} onThemeChange={setPreviewTheme} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Success header */}
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">🎉</div>
                      <h2 className="font-headline text-2xl text-secondary">رابطك جاهز!</h2>
                      <p className="text-tertiary/60 text-sm font-label mt-1">
                        شاركه مع صاحب/ة العيد وفاجئه/ها بتجربة لا تُنسى
                      </p>
                    </div>

                    <LinkResultCard link={generatedLink} />

                    {/* Back button */}
                    <button
                      onClick={() => setGeneratedLink(null)}
                      className="mt-6 w-full text-center text-xs text-tertiary/40 hover:text-secondary/60 transition-colors duration-200 font-label"
                    >
                      ← إنشاء تهنئة جديدة
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center">
          <div className="dev-credit">
            Developed by Mohammed Ahmed &amp; <a href="https://rise-website.www-riseteam.workers.dev" target="_blank" rel="noopener noreferrer">R.I.S.E</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
