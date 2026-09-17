// Simple rounded line icons, drawn on a 24px grid.
const PATHS = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="8" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="2" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="2" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="2" />
    </>
  ),
  practice: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z" />,
  exam: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="3" />
      <path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  review: (
    <>
      <path d="M20 12a8 8 0 1 1-2.35-5.65" />
      <path d="M20 4v5h-5" />
    </>
  ),
  flagged: <path d="M12 3.2l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17.1 6.5 20l1.1-6.1-4.4-4.3 6.1-.8L12 3.2Z" />,
  duel: (
    <>
      <path d="M4 4l9.5 9.5M4 4h4M4 4v4" />
      <path d="M20 4l-9.5 9.5M20 4h-4M20 4v4" />
      <path d="M7 14.5 9.5 17M14.5 17 17 14.5M5.5 18.5l2-2M18.5 18.5l-2-2" />
    </>
  ),
  team: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.5M17 6h2.5a2.5 2.5 0 0 1-2.6 3.5M12 14v3M8.5 20.5h7M9.5 17.5h5v3h-5z" />
    </>
  ),
  vocab: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5M9 7.5h7M9 11h5" />
    </>
  ),
  reference: (
    <>
      <path d="m14 4 6 6M11.5 6.5l6 6M13 5l-5.5 5.5 6 6L19 11" />
      <path d="m9.5 13.5-6 6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
    </>
  ),
  admin: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />,
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16.5 5.5 12 10 7.5M5.5 12H15" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  bolt: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z" />,
}

export default function Icon({ name, className = '', strokeWidth = 2.2 }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
