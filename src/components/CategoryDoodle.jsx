// Hand-drawn stroke-only doodles for each product category. Rendered with
// currentColor so they follow the surrounding text tone.
const DOODLES = {
  Pant: (
    <>
      <path d="M11 6.2 Q16 7 21 6.2 L23.2 25.4 Q20.8 26.2 18.6 25.6 L16 13.8 L13.4 25.6 Q11.2 26.2 8.8 25.4 Z" />
      <path d="M11.3 9.2 Q16 10 20.7 9.2" />
    </>
  ),
  Shirt: (
    <>
      <path d="M11 7 L5.8 10 L7.8 15.4 L10.4 13.8 L10.4 25.6 Q16 26.6 21.6 25.6 L21.6 13.8 L24.2 15.4 L26.2 10 L21 7" />
      <path d="M11 7 L16 11.4 L21 7" />
      <path d="M16 11.4 L16 25.8" />
      <circle cx="17.2" cy="15" r="0.4" fill="currentColor" />
      <circle cx="17.2" cy="18.6" r="0.4" fill="currentColor" />
      <circle cx="17.2" cy="22.2" r="0.4" fill="currentColor" />
    </>
  ),
  'T-Shirt': (
    <>
      <path d="M11.5 6.8 Q16 9.6 20.5 6.8 L26.5 10.2 L23.6 15 L21.2 13.4 L21.4 25.6 Q16 26.6 10.6 25.6 L10.8 13.4 L8.4 15 L5.5 10.2 Z" />
      <path d="M12.4 7.4 Q16 10.6 19.6 7.4" />
    </>
  ),
  Hoodie: (
    <>
      <path d="M11.4 8.6 Q16 4.6 20.6 8.6 L24.6 10.8 L26.6 16.8 L23.2 18 L22.4 15.2 L22.4 25.4 Q16 26.8 9.6 25.4 L9.6 15.2 L8.8 18 L5.4 16.8 L7.4 10.8 Z" />
      <path d="M11.4 8.6 Q16 13.6 20.6 8.6" />
      <path d="M14.4 11.8 L14 15.4" />
      <path d="M17.6 11.8 L18 15.4" />
      <path d="M12.4 20.6 L19.6 20.6 L18.4 25 L13.6 25 Z" />
    </>
  ),
  Shorts: (
    <>
      <path d="M9 6.5 Q16 7.3 23 6.5 L25.2 21.5 Q21.8 22.4 18.4 21.7 L16 13.8 L13.6 21.7 Q10.2 22.4 6.8 21.5 Z" />
      <path d="M9.4 9.6 Q16 10.4 22.6 9.6" />
      <path d="M15.1 10 Q14.9 11.8 14.4 12.8" />
      <path d="M16.9 10 Q17.1 11.8 17.6 12.8" />
    </>
  ),
  'Track Pant': (
    <>
      <path d="M11 6.2 Q16 7 21 6.2 L23.2 25.4 Q20.8 26.2 18.6 25.6 L16 13.8 L13.4 25.6 Q11.2 26.2 8.8 25.4 Z" />
      <path d="M11.3 9.2 Q16 10 20.7 9.2" />
      <path d="M12.4 10.4 Q11.8 17.6 10.8 24.4" />
      <path d="M14 10.4 Q13.5 17.6 12.6 24.4" />
    </>
  ),
  Other: (
    <>
      <path d="M16 12.8 L16 11 Q16 7.4 18.8 7.9" />
      <path d="M16 12.8 L27.8 21.6 Q28.6 23.2 26.8 23.2 L5.2 23.2 Q3.4 23.2 4.2 21.6 Z" />
    </>
  ),
}

export default function CategoryDoodle({ category, size = 26, className = '' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {DOODLES[category] ?? DOODLES.Other}
    </svg>
  )
}
