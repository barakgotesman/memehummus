import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const sections = [
  {
    title: 'מידע שאנו אוספים',
    content:
      'אנו עשויים לאסוף מידע שאתה מספק ישירות, כגון כתובת דוא"ל בעת הצעת תבנית, וכן נתוני שימוש אנונימיים כמו דפים שנצפו ומועדפים — לצורך שיפור השירות.',
  },
  {
    title: 'שימוש במידע',
    content:
      'המידע שנאסף משמש אך ורק לצורך תפעול האתר ושיפור חוויית המשתמש. איננו מוכרים או משתפים את פרטיך האישיים עם צדדים שלישיים.',
  },
  {
    title: 'עוגיות (Cookies)',
    content:
      'האתר עשוי להשתמש בעוגיות לצורך שמירת העדפות ושיפור הביצועים. ניתן לבטל עוגיות דרך הגדרות הדפדפן שלך, אך הדבר עלול להשפיע על חלק מהפונקציות.',
  },
  {
    title: 'אבטחת מידע',
    content:
      'אנו נוקטים באמצעים סבירים להגנה על המידע שברשותנו. עם זאת, אין באפשרותנו להבטיח אבטחה מוחלטת של מידע המועבר דרך האינטרנט.',
  },
  {
    title: 'שינויים במדיניות',
    content:
      'מדיניות פרטיות זו עשויה להשתנות מעת לעת. נעדכן את תאריך "עדכון אחרון" בראש הדף בכל שינוי מהותי.',
  },
  {
    title: 'יצירת קשר',
    content:
      'לשאלות בנוגע למדיניות הפרטיות שלנו, פנה אלינו בדוא"ל: privacy@memehummus.com',
  },
]

export default function PrivacyPage() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6 md:py-14 pb-24 md:pb-14">
        <div className="text-center mb-10">
          <span className="text-4xl">🔒</span>
          <h1 className="mt-3 text-3xl font-extrabold text-on-surface">מדיניות פרטיות</h1>
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
