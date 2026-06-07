import { ImageIcon, Share2, Sliders, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GeneratorInfoSection() {
  const navigate = useNavigate()

  return (
    <section dir="rtl" className="mt-10 rounded-2xl bg-surface-container p-6 text-right">
      <h2 className="mb-6 text-xl font-bold text-on-surface">על יוצר המֵמים</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-bold text-on-surface">מה זה יוצר המֵמים?</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              יוצר המֵמים של מֵם חומוס מאפשר לך לקחת תבנית פופולרית ולהוסיף עליה טקסט משלך תוך שניות. בחר תבנית, הוסף את הכיתוב שלך — והמֵם מוכן לשיתוף.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-bold text-on-surface">בחירת תבנית ושיתוף</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              גלגל בין מאות תבניות בדף הבית, לחץ על תבנית שאוהב ותיכנס ישר לעורך. אחרי שסיימת — הורד את המֵם, העתק אותו ללוח או שתף ישירות לוואטסאפ בלחיצה אחת.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <Sliders className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-bold text-on-surface">אפשרויות עריכה</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              הוסף כמה שכבות טקסט שרוצה וגרור כל אחת למיקום המושלם. שנה גופן, גודל וצבע לכל שכבה בנפרד. הוסף פס דאנק בתחתית לסגנון קלאסי. כל השינויים רואים בזמן אמת.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-bold text-on-surface">יש לך תבנית שאנחנו פספסנו?</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              שלח לנו הצעה ונשקול להוסיף אותה לספרייה.{' '}
              <button
                onClick={() => navigate('/suggest')}
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                שלח הצעה
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
