import { useState } from 'react'
import { Flame } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import MemeGrid from '@/components/memes/MemeGrid'
import FAB from '@/components/ui/FAB'
import { useTemplates } from '@/hooks/useTemplates'

const PERIODS = [
  { value: 'week', label: 'השבוע' },
  { value: 'all', label: 'כל הזמן' },
]

export default function TrendsPage() {
  const [period, setPeriod] = useState('week')
  const { templates, loading, error } = useTemplates(null, { trending: true, period })

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-6 pb-24 md:pb-8">
        <div className="py-6 flex items-center gap-3">
          <Flame className="h-7 w-7 text-primary-container" />
          <h1 className="text-2xl font-extrabold text-on-surface">טרנדים</h1>
        </div>

        <div className="mb-6 flex gap-2">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                period === value
                  ? 'bg-primary-container text-on-surface shadow-sm'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <MemeGrid
          templates={templates}
          loading={loading}
          error={error}
          emptyMessage="אין עדיין הורדות לתקופה זו"
        />
      </main>

      <Footer />
      <BottomNav />
      <FAB />
    </div>
  )
}
