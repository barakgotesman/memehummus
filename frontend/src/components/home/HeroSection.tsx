export default function HeroSection() {
  return (
    <section className="py-10 md:py-16 text-center">
      <div className="flex justify-center mb-4">
        <img
          src="/logo.png"
          alt="Meme Hummus"
          className="w-40 h-40 md:w-56 md:h-56 object-contain mix-blend-multiply"
        />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-on-surface md:text-5xl lg:text-6xl">
        שלטו באינטרנט.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base font-medium text-on-surface-variant md:text-lg">
        הארסנל האולטימטיבי ללוחמים דיגיטליים. תבניות טריות, עריכות חריפות, ואפס חיכוך.
        בחרו את הנשק שלכם וכבשו את הטיימליין.
      </p>
    </section>
  )
}
