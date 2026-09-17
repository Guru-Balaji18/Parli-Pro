// A gavel on a bright tile.
export default function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="bm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b86ff" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="44" height="42" rx="13" fill="#2a4fd1" />
      <rect x="2" y="2" width="44" height="41" rx="13" fill="url(#bm-grad)" />
      <g transform="rotate(-40 24 22)">
        <rect x="15" y="11" width="18" height="9" rx="3.5" fill="#ffc83d" />
        <rect x="13" y="12.5" width="3" height="6" rx="1.2" fill="#fff" />
        <rect x="32" y="12.5" width="3" height="6" rx="1.2" fill="#fff" />
        <rect x="22.5" y="19" width="3" height="15" rx="1.5" fill="#fff" />
      </g>
      <rect x="11" y="34" width="17" height="4.5" rx="2.25" fill="#ffc83d" />
    </svg>
  )
}
