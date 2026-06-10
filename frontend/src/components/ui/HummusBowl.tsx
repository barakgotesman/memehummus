interface HummusBowlProps {
  size?: number
  className?: string
}

/**
 * Animated hummus bowl mascot SVG — bowl only, no pitas.
 * Use `size` to scale (default 40).
 */
export default function HummusBowl({ size = 40, className }: HummusBowlProps) {
  // viewBox is 100×80, covers bowl + toppings + face
  return (
    <svg
      width={size}
      height={size}
      viewBox="5 20 90 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
      className={className}
    >
      {/* bowl shadow */}
      <ellipse cx="50" cy="75" rx="36" ry="5" fill="#00000010" />
      {/* bowl body */}
      <path d="M14 38 Q13 64 50 66 Q87 64 86 38 Z" fill="#EDD9A3" />
      {/* bowl rim */}
      <ellipse cx="50" cy="38" rx="36" ry="10" fill="#F7EDCA" />
      <ellipse cx="50" cy="38" rx="36" ry="10" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      {/* hummus surface */}
      <ellipse cx="50" cy="38" rx="31" ry="7.5" fill="#D4A843" />
      {/* olive oil pool */}
      <ellipse cx="51" cy="38" rx="11" ry="4.5" fill="#C8960A" opacity="0.75" />
      <path d="M41 36.5 Q47 34 53 36.5 Q59 39 65 36.5" stroke="#E8B820" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* paprika dots */}
      <circle cx="34" cy="36" r="2"   fill="#D0321B" />
      <circle cx="38" cy="41" r="1.6" fill="#C0392B" />
      <circle cx="63" cy="35" r="1.8" fill="#D0321B" />
      <circle cx="67" cy="40" r="1.5" fill="#C0392B" />
      <ellipse cx="35" cy="37.5" rx="5" ry="2" fill="#C0392B" opacity="0.18" />
      <ellipse cx="66" cy="37.5" rx="5" ry="2" fill="#C0392B" opacity="0.18" />
      {/* onion rings */}
      <g transform="translate(35, 33)">
        <ellipse cx="0" cy="0" rx="7" ry="3.5" fill="none" stroke="#D4A0C0" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="none" stroke="#C890B0" strokeWidth="1.2" />
        <ellipse cx="0" cy="0" rx="2" ry="1" fill="none" stroke="#B87090" strokeWidth="1" />
      </g>
      {/* shifka — flat in bowl */}
      <g transform="translate(50, 37) rotate(-8)">
        <line x1="-1" y1="1.5" x2="2.5" y2="0.5" stroke="#3a6400" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 0 Q7 -1.5 16 -0.5 Q21 0 24 1.5 Q21 3 16 3.5 Q7 4 2 2.5 Z" fill="#5DB800" />
        <path d="M2 0 Q7 -1.5 16 -0.5 Q21 0 24 1.5 Q21 3 16 3.5 Q7 4 2 2.5 Z" fill="none" stroke="#3d8a00" strokeWidth="0.6" />
        <path d="M3.5 0.5 Q11 -0.8 20 0.5" stroke="#8ed640" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        <path d="M24 1.5 Q26 0.8 27 2" stroke="#4a9a00" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </g>
      {/* parsley */}
      <circle cx="58" cy="41" r="1.3" fill="#27AE60" />
      <circle cx="40" cy="33" r="1.1" fill="#27AE60" />
      {/* face on bowl front */}
      <circle cx="43" cy="53" r="5.5" fill="white" />
      <circle cx="57" cy="53" r="5.5" fill="white" />
      <circle cx="44.5" cy="53" r="3" fill="#222" />
      <circle cx="58.5" cy="53" r="3" fill="#222" />
      <circle cx="45.5" cy="51.8" r="1.1" fill="white" />
      <circle cx="59.5" cy="51.8" r="1.1" fill="white" />
      <path d="M45 58.5 Q50 63 55 58.5" stroke="#222" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
