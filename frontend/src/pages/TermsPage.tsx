import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const sections = [
  {
    title: 'ברוכים הבאים ל-Meme Hummus',
    content:
      'Meme Hummus הוא אתר הומוריסטי העוסק בתרבות הממים האינטרנטית. המטרה שלנו היא לספק פלטפורמה כיפית ויצירתית ליצירה ושיתוף ממים בעברית. כל התכנים באתר נועדו לבידור בלבד. השימוש באתר מהווה הסכמה לתנאים המפורטים להלן. אם אינך מסכים לתנאים — לא חובה להישאר, אבל תפספס ממים טובים.',
  },
  {
    title: 'גיל מינימלי',
    content:
      'השימוש באתר מותר לבני 13 ומעלה. משתמשים מתחת לגיל 13 אינם רשאים להשתמש בשירות.',
  },
  {
    title: 'התנהגות תקינה',
    content:
      'אנחנו כאן בשביל כיף — לא בשביל שנאה. חל איסור מוחלט על פרסום תכנים גזעניים, מעוררי שנאה, מטרידים, או כאלה שמטרתם לתקוף אדם או קבוצה בצורה פוגענית ולא הומוריסטית. ממים שמטרתם הבלעדית היא להשפיל או לפגוע - לא יעלו לאתר. ספאם, קישורים זדוניים, ותכנים לא רלוונטיים אסורים אף הם.',
  },
  {
    title: 'תוכן מיני',
    content:
      'אין להעלות תכנים פורנוגרפיים או בעלי אופי מיני מובהק. זה אתר ממים — לא אתר אחר. תכנים כאלה לא רצויים כאן .',
  },
  {
    title: 'העלאת תמונות ותבניות',
    content:
      'בעת הצעת תבנית לאתר, אתה מאשר שהתמונה אינה מפרה זכויות יוצרים של גורם אחר, או שהיא חופשית לשימוש ציבורי. תכנים שיועלו לאתר כפופים לכללים האמורים ועשויים להיות בשימוש משתמשים אחרים לצורך יצירת ממים.',
  },
  {
    title: 'שימוש בשירות',
    content:
      'אין לנסות לפרוץ, לשבש, או לגשת לאתר בדרכים שאינן מורשות. אין להעתיק, לשנות, להפיץ, למכור או להשתמש בחלקי האתר לצרכים מסחריים ללא אישור מפורש.',
  },
  {
    title: 'התוכן שלך',
    content:
      'אתה שומר על בעלות התוכן שאתה יוצר. בעצם השימוש באתר אתה מעניק ל-Meme Hummus רישיון שימוש בתוכן לצורך הפעלת השירות — לא יותר מזה.',
  },
  {
    title: 'הגבלת אחריות',
    content:
      'האתר מסופק "כפי שהוא". איננו אחראים לנזקים ישירים או עקיפים שייגרמו כתוצאה משימוש באתר, לרבות אובדן נתונים, הכנסות, או כל נזק אחר. השימוש באתר הוא על אחריותך בלבד.',
  },
  {
    title: 'שינויים בתנאים',
    content:
      'אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה מעת לעת. שינויים מהותיים יפורסמו באתר. המשך השימוש לאחר פרסום השינויים מהווה הסכמה לתנאים המעודכנים.',
  },
  {
    title: 'יצירת קשר',
    content:
      'לכל שאלה, פנייה, או דיווח על תוכן בעייתי — ניתן לפנות אלינו דרך טופס יצירת הקשר באתר.',
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
