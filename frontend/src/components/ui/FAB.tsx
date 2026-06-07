import { Crown } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FAB() {
  return (
    <Link
      to="/generate"
      aria-label="התחל ליצור"
      className="fixed bottom-20 start-4 z-40 hidden md:flex items-center gap-2 rounded-full bg-primary-container px-5 py-3 text-sm font-bold text-on-surface shadow-fab hover:bg-primary-fixed-dim transition-colors md:bottom-6 md:start-6"
    >
      <Crown className="h-4 w-4" />
      התחל ליצור
    </Link>
  )
}
