export default function BrandMark({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="13" r="9.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M16 7.5L17.4 10.6L20.8 11L18.3 13.3L19 16.7L16 15L13 16.7L13.7 13.3L11.2 11L14.6 10.6L16 7.5Z"
        fill="currentColor"
      />
      <path
        d="M11 21L9 29L16 26.5L23 29L21 21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
