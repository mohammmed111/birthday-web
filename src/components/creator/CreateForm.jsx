import React, { useState, useEffect, useMemo } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase.js'
import { detectAudioType } from '../../utils/audioUtils.js'
import Button from '../shared/Button.jsx'
import Toast from '../shared/Toast.jsx'

const MAX_CHARS = 300
const STORAGE_KEY = 'birthday_draft'

export default function CreateForm({ onLinkCreated }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      if (draft.name) setName(draft.name)
      if (draft.message) setMessage(draft.message)
      if (draft.audioUrl) setAudioUrl(draft.audioUrl)
    } catch {}
  }, [])

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, message, audioUrl }))
    } catch {}
  }, [name, message, audioUrl])

  // Auto-detect audio type
  const detectedAudioType = useMemo(() => detectAudioType(audioUrl), [audioUrl])

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'اسم صاحب/ة العيد مطلوب'
    if (!message.trim()) errs.message = 'الرسالة مطلوبة'
    if (message.length > MAX_CHARS) errs.message = `الرسالة تتجاوز ${MAX_CHARS} حرفاً`
    if (audioUrl && !isValidUrl(audioUrl)) errs.audioUrl = 'رابط الصوت غير صالح'
    return errs
  }

  function isValidUrl(url) {
    try { new URL(url); return true } catch { return false }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const docRef = await addDoc(collection(db, 'birthdays'), {
        name: name.trim(),
        message: message.trim(),
        audioUrl: audioUrl.trim() || null,
        audioType: audioUrl.trim() ? (detectedAudioType || 'direct') : null,
        createdAt: serverTimestamp(),
      })

      const link = `${window.location.origin}/b/${docRef.id}`
      onLinkCreated(link)
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Firestore addDoc error:', err)
      setToast({ visible: true, message: 'حدث خطأ أثناء حفظ البيانات، حاول مجدداً' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
        aria-label="نموذج إنشاء تهنئة عيد ميلاد"
      >
        {/* Name field */}
        <div>
          <label htmlFor="birthday-name" className="block text-sm font-semibold text-secondary mb-2 font-label">
            🎂 اسم صاحب/ة عيد الميلاد
          </label>
          <input
            id="birthday-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="مثال: سارة، محمد، Layla..."
            maxLength={60}
            autoComplete="off"
            className={[
              'w-full px-5 py-3.5 rounded-2xl',
              'bg-primary-950/60 backdrop-blur-sm',
              'border text-tertiary placeholder:text-tertiary/40',
              'font-body text-base',
              'focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200',
              errors.name
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-primary-700/40 focus:border-secondary/60',
            ].join(' ')}
          />
          {errors.name && (
            <p role="alert" className="mt-1.5 text-xs text-red-400 font-label">{errors.name}</p>
          )}
        </div>

        {/* Message field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="birthday-message" className="text-sm font-semibold text-secondary font-label">
              💌 رسالتك المخصصة
            </label>
            <span className={`text-xs font-label tabular-nums ${message.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-tertiary/50'}`}>
              <span dir="ltr" className="inline-block">{message.length} / {MAX_CHARS}</span>
            </span>
          </div>
          <textarea
            id="birthday-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="اكتب رسالتك الجميلة هنا... كل كلمة ستصنع ذكرى لا تُنسى ✨"
            rows={5}
            maxLength={MAX_CHARS + 20}
            className={[
              'w-full px-5 py-3.5 rounded-2xl resize-none',
              'bg-primary-950/60 backdrop-blur-sm',
              'border text-tertiary placeholder:text-tertiary/40',
              'font-body text-base leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200',
              errors.message
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-primary-700/40 focus:border-secondary/60',
            ].join(' ')}
          />
          {errors.message && (
            <p role="alert" className="mt-1.5 text-xs text-red-400 font-label">{errors.message}</p>
          )}
        </div>

        {/* Audio URL field */}
        <div>
          <label htmlFor="birthday-audio" className="block text-sm font-semibold text-secondary mb-2 font-label">
            🎵 رابط موسيقى أو يوتيوب <span className="text-tertiary/50 font-normal">(اختياري)</span>
          </label>
          <input
            id="birthday-audio"
            type="url"
            value={audioUrl}
            onChange={e => setAudioUrl(e.target.value)}
            placeholder="رابط ملف صوتي أو رابط يوتيوب"
            dir="ltr"
            className={[
              'w-full px-5 py-3.5 rounded-2xl',
              'bg-primary-950/60 backdrop-blur-sm',
              'border text-tertiary placeholder:text-tertiary/40',
              'font-label text-sm',
              'focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200',
              errors.audioUrl
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-primary-700/40 focus:border-secondary/60',
            ].join(' ')}
          />
          {errors.audioUrl && (
            <p role="alert" className="mt-1.5 text-xs text-red-400 font-label">{errors.audioUrl}</p>
          )}
          {detectedAudioType === 'youtube' && (
            <div className="mt-2 p-3 rounded-xl bg-primary-900/50 border border-secondary/20">
              <p className="text-xs text-secondary/80 font-label mb-1">🎵 تم اكتشاف رابط يوتيوب</p>
              <p className="text-xs text-tertiary/50 font-label leading-relaxed">
                سيتم تشغيل الصوت فقط من الفيديو، دون عرضه. يعتمد هذا على تضمين يوتيوب الرسمي.
              </p>
            </div>
          )}
          {!detectedAudioType || detectedAudioType === 'direct' ? (
            <p className="mt-2 text-xs text-tertiary/40 font-label">
              رابط مباشر لملف MP3 أو رابط يوتيوب — سيُشغَّل عند فتح الظرف
            </p>
          ) : null}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
          aria-label="إنشاء رابط التهنئة"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          }
        >
          {loading ? 'جاري إنشاء الرابط...' : '✨ إنشاء رابط التهنئة'}
        </Button>
      </form>

      <Toast
        visible={toast.visible}
        message={toast.message}
        icon="⚠️"
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
    </>
  )
}
