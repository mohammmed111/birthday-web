import React, { useState } from 'react'
import Button from '../shared/Button.jsx'
import Toast from '../shared/Toast.jsx'

export default function LinkResultCard({ link }) {
  const [toast, setToast] = useState({ visible: false, message: '', icon: '✓' })

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setToast({ visible: true, message: 'تم نسخ الرابط! 🎉', icon: '✓' })
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = link
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setToast({ visible: true, message: 'تم نسخ الرابط!', icon: '✓' })
    }
  }

  const waText = encodeURIComponent(`🎂 أُهديك هذه المفاجأة بمناسبة عيد ميلادك! افتح الرابط وعش اللحظة 🎉\n${link}`)
  const waLink = `https://wa.me/?text=${waText}`

  return (
    <>
      <div className="mt-8 space-y-4">
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-e from-transparent to-secondary/30" />
          <span className="text-secondary text-lg">🎁</span>
          <div className="flex-1 h-px bg-gradient-to-s from-transparent to-secondary/30" />
        </div>

        <p className="text-center text-sm text-textMain/70 font-label">
          رابطك الخاص جاهز — شاركه مع من تحب!
        </p>

        {/* Link display */}
        <div className="relative gradient-border rounded-2xl p-4">
          <div className="gold-shimmer rounded-xl bg-surface/80 px-4 py-3 pe-12 overflow-hidden">
            <p
              dir="ltr"
              className="text-sm text-secondary/80 font-label truncate select-all cursor-text"
              aria-label="الرابط المُنشأ"
            >
              {link}
            </p>
          </div>

          {/* Copy icon button */}
          <button
            onClick={copyLink}
            aria-label="نسخ الرابط"
            className="absolute top-1/2 end-6 -translate-y-1/2 w-9 h-9 rounded-xl bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 flex items-center justify-center transition-all duration-200 active:scale-90 text-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={copyLink}
            aria-label="نسخ الرابط"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            }
          >
            نسخ الرابط
          </Button>

          <Button
            variant="outlined"
            size="md"
            onClick={() => window.open(waLink, '_blank', 'noopener')}
            aria-label="مشاركة عبر واتساب"
            className="border-green-500/60 text-green-400 hover:bg-green-500/10"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            }
          >
            واتساب
          </Button>
        </div>

        {/* Preview link */}
        <p className="text-center">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-tertiary/40 hover:text-secondary/70 underline underline-offset-4 font-label transition-colors duration-200"
          >
            👀 معاينة تجربة المُهنَّأ
          </a>
        </p>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        icon={toast.icon}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
    </>
  )
}
