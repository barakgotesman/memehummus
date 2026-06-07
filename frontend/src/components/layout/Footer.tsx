export default function Footer() {
  return (
    <footer className="mt-20 border-t border-outline-variant/40 bg-background pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-right">
          <p className="text-lg font-extrabold text-on-surface">
            Meme <span className="text-primary-container">Hummus</span>
          </p>
          <p className="text-xs text-on-surface-variant">© 2026 Meme Hummus. תשמרו על חריף.</p>
          <div className="flex gap-4 text-xs font-semibold text-on-surface-variant">
            <a href="/privacy" className="hover:text-on-surface transition-colors">מדיניות פרטיות</a>
            <a href="/terms" className="hover:text-on-surface transition-colors">תנאים</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
