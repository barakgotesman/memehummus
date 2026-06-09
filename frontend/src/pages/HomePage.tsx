import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import HeroSection from '@/components/home/HeroSection'
import CategoryFilter from '@/components/memes/CategoryFilter'
import MemeGrid from '@/components/memes/MemeGrid'
import FAB from '@/components/ui/FAB'
import { useTemplateFilter } from '@/hooks/useTemplateFilter'
import { useTemplates } from '@/hooks/useTemplates'
import { useTags } from '@/hooks/useTags'

export default function HomePage() {
  const { activeTag, setActiveTag } = useTemplateFilter()
  const { templates, loading, loadingMore, error, hasMore, loadMore } = useTemplates(activeTag)
  const { tags } = useTags()

  const categories = ['הכל', ...tags.map((t) => t.name)]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-6">
        <HeroSection />

        <section className="pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-on-surface">מנות טריות</h2>
            <button
              onClick={() => setActiveTag('הכל')}
              className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              ← הכל
            </button>
          </div>

          <div className="mb-5">
            <CategoryFilter
              categories={categories}
              active={activeTag}
              onSelect={setActiveTag}
            />
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl">⚠️</p>
              <p className="mt-4 text-lg font-bold text-on-surface">משהו השתבש</p>
              <p className="mt-1 text-sm text-on-surface-variant">{error}</p>
            </div>
          ) : (
            <MemeGrid templates={templates} loading={loading} />
          )}

          {!loading && !error && templates.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full border-2 border-outline px-8 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-high transition-colors disabled:opacity-60"
                >
                  {loadingMore ? 'טוען...' : 'טען עוד דאנקות'}
                </button>
              )}
              <a
                href="/suggest"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                הצע תבנית חדשה →
              </a>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
      <FAB />
    </div>
  )
}
