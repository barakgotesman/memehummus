import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const sections = [
  {
    title: 'תמונות וממים שאתה יוצר',
    content:
      'ממים שיוצרים באתר אינם נשמרים אצלנו בשרת — הם נוצרים ומיוצאים ישירות אצלך בדפדפן. תבניות שאתה מציע לאתר הופכות לציבוריות לאחר אישור ועשויות להיות בשימוש משתמשים אחרים ליצירת ממים.',
  },
  {
    title: 'מידע שאנו אוספים',
    content:
      'כשאתה נכנס לאתר דרך חשבון Google, אנו שומרים את שמך, כתובת הדוא"ל ותמונת הפרופיל שלך לצורך זיהוי בלבד. בנוסף, אנו עשויים לשמור נתוני שימוש בסיסיים ואנונימיים — כמו מספר הורדות לתבנית — לצורך שיפור השירות. איננו אוספים מידע רגיש ואיננו מוכרים מידע לצדדים שלישיים.',
  },
  {
    title: 'עוגיות (Cookies)',
    content:
      'האתר משתמש בעוגיות session לצורך שמירת מצב ההתחברות והעדפות תצוגה (כמו מצב כהה). עוגיות אלה נמחקות בעת סגירת הדפדפן או ניקוי הנתונים. ניתן לנהל עוגיות דרך הגדרות הדפדפן שלך — ביטולן עלול להשפיע על חוויית השימוש, בעיקר על ההתחברות.',
  },
  {
    title: 'שירותים חיצוניים',
    content:
      'האתר משתמש ב-Firebase של Google לצורך התחברות עם חשבון Google. שירות זה כפוף למדיניות הפרטיות של Google. בנוסף, תמונות תבניות מאוחסנות ב-Cloudinary לצורך הגשה מהירה. אנו אינם משתמשים בפרסומות.',
  },
  {
    title: 'אבטחת מידע',
    content:
      'אנו נוקטים באמצעים סבירים לאבטחת המידע שברשותנו. עם זאת, אין באפשרותנו להבטיח אבטחה מוחלטת — שידור מידע דרך האינטרנט כרוך תמיד בסיכון מסוים.',
  },
  {
    title: 'שינויים במדיניות',
    content:
      'מדיניות זו עשויה להתעדכן מעת לעת. שינויים מהותיים יפורסמו באתר ותאריך "עדכון אחרון" יתעדכן בהתאם. המשך השימוש לאחר פרסום השינויים מהווה הסכמה למדיניות המעודכנת.',
  },
  {
    title: 'יצירת קשר',
    content:
      'לשאלות בנוגע למדיניות הפרטיות או לבקשות הסרת מידע — ניתן לפנות אלינו דרך טופס יצירת הקשר באתר.',
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
