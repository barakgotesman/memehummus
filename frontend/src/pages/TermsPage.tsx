import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const sections = [
  {
    title: 'ברוכים הבאים ל-Meme Hummus',
    content:
      'השימוש באתר זה מהווה הסכמה לתנאים המפורטים להלן. אם אינך מסכים לתנאים, אנא הפסק את השימוש באתר.',
  },
  {
    title: 'שימוש מותר',
    content:
      'האתר מיועד לשימוש אישי ולא מסחרי בלבד. אין להשתמש בתוכן האתר לצורכי הפצה מסחרית, פרסום, או כל מטרה אחרת ללא אישור מפורש.',
  },
  {
    title: 'תוכן שנוצר על ידי המשתמש',
    content:
      'משתמשים המציעים תבניות מאשרים כי הם בעלי הזכויות לתמונה או שהיא חופשית לשימוש. האתר שומר לעצמו את הזכות לסרב לפרסם או למחוק כל תוכן לפי שיקול דעתו.',
  },
  {
    title: 'הגבלת אחריות',
    content:
      'האתר מסופק "כפי שהוא" ללא כל אחריות מפורשת או משתמעת. איננו אחראים לכל נזק שייגרם כתוצאה משימוש באתר.',
  },
  {
    title: 'שינויים בתנאים',
    content:
      'אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. המשך השימוש באתר לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים.',
  },
  {
    title: 'יצירת קשר',
    content:
      'לכל שאלה בנוגע לתנאי השימוש ניתן לפנות אלינו בדוא"ל: contact@memehummus.com',
  },
]

export default function TermsPage() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6 md:py-14 pb-24 md:pb-14">
        <div className="text-center mb-10">
          <span className="text-4xl">📋</span>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">תנאי שימוש</h1>
          <p className="mt-2 text-on-surface-variant text-sm">עדכון אחרון: אפריל 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="bg-surface-variant/30 rounded-2xl border border-outline-variant/50 p-6">
              <h2 className="text-lg font-bold text-on-surface mb-2">{section.title}</h2>
              <p className="text-on-surface-variant leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
