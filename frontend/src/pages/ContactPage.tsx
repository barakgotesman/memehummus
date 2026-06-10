import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormState>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 md:px-6 md:py-14 pb-24 md:pb-14">
        <div className="text-center mb-10">
          <span className="text-4xl">✉️</span>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">צור קשר</h1>
          <p className="mt-2 text-on-surface-variant text-sm">שאלה? הצעה? מגיע לנו? שלחו.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-surface-variant/30 rounded-2xl border border-outline-variant/50 p-8 text-center space-y-4">
            <span className="text-5xl">🎉</span>
            <h2 className="text-xl font-bold text-on-surface">הודעה נשלחה!</h2>
            <p className="text-on-surface-variant">תודה שפנית אלינו. נחזור אליך בהקדם.</p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
            >
              חזרה לדף הבית
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface-variant/30 rounded-2xl border border-outline-variant/50 p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="contact-name">שם <span className="text-red-500">*</span></label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ישראל ישראלי"
                required
                className="w-full rounded-xl bg-surface-high border border-outline-variant px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary-container transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="contact-email">אימייל <span className="text-red-500">*</span></label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="me@example.com"
                required
                dir="ltr"
                className="w-full rounded-xl bg-surface-high border border-outline-variant px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary-container transition text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="contact-message">הודעה <span className="text-red-500">*</span></label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="כתבו כאן..."
                required
                rows={5}
                className="w-full rounded-xl bg-surface-high border border-outline-variant px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary-container transition resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500 font-medium">שגיאה בשליחה — נסה שוב.</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {status === 'submitting' ? 'שולח...' : 'שליחה'}
            </button>
          </form>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
