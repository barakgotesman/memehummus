interface StatCardProps {
  label: string
  value: number
  icon: string
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl p-5 border border-outline-variant flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-on-surface-variant mb-1">{label}</p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  )
}
