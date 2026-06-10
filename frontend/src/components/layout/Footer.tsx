import HummusBowl from '@/components/ui/HummusBowl'

export default function Footer() {
  return (
    <footer className="mt-20 pb-20 md:pb-0 bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container dark:from-[#2a1e0e] dark:via-[#2a1208] dark:to-[#1e1108]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-right">
          <a href="/" className="flex items-center gap-2">
            <HummusBowl size={36} />
            <span className="text-xl font-extrabold tracking-tight text-on-surface">
              Meme <span className="text-primary-container">Hummus</span>
            </span>
          </a>
          <p className="text-xs font-semibold text-on-surface/70 dark:text-foreground/60">© 2026 Meme Hummus. תשמרו על חריף.</p>
          <div className="flex gap-4 text-xs font-semibold text-on-surface/70 dark:text-foreground/60">
            <a href="/contact" className="hover:text-on-surface dark:hover:text-foreground transition-colors">צור קשר</a>
            <a href="/privacy" className="hover:text-on-surface dark:hover:text-foreground transition-colors">מדיניות פרטיות</a>
            <a href="/terms" className="hover:text-on-surface dark:hover:text-foreground transition-colors">תנאים</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
