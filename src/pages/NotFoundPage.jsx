import React from 'react'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-background via-background/95 to-background"
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 bg-secondary/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.34,1.56,0.64,1] }}
        className="relative z-10 max-w-md"
      >
        <div className="gradient-border rounded-3xl p-10 bg-surface backdrop-blur-xl">
          <div className="text-7xl mb-6">🎈</div>
          <h1 className="font-headline text-4xl text-textMain mb-3">
            <span dir="ltr" className="inline-block">404</span> — الصفحة غير موجودة
          </h1>
          <p className="text-textMain/80 font-body mb-8">
            يبدو أنك ضللت الطريق! الصفحة التي تبحث عنها غير موجودة.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 bg-secondary text-background font-semibold px-6 py-3 rounded-2xl hover:opacity-90 transition-all duration-200 font-label shadow-lg shadow-secondary/20"
          >
            <span>🏠</span>
            <span>العودة للرئيسية</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
