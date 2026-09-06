import { useId } from "react";
export function RelicIcon({ kind = "book", className = "" }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      className={`relic-icon ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x2=".7" y2="1">
          <stop stopColor="#fff1b7" />
          <stop offset="1" stopColor="#be853c" />
        </linearGradient>
      </defs>
      <g
        stroke="#594331"
        strokeWidth="2.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {kind === "home" ? (
          <>
            <path d="M10 31L32 10L54 31V34H49V55H16V34H10Z" fill="#d7b174" />
            <path d="M6 31L32 7L58 31L53 37L32 19L11 37Z" fill="#5b7770" />
            <path d="M26 54V38Q32 30 38 38V54" fill="#6c4b3c" />
            <path d="M19 29H26V35H19Z" fill="#ffde8b" />
            <path d="M39 27H45V33H39Z" fill="#ffde8b" />
            <path d="M13 56H51" stroke="#e7c68d" strokeWidth="4" />
          </>
        ) : kind === "map" ? (
          <>
            <path
              d="M7 16L23 10L41 17L57 11V50L41 57L23 49L7 55Z"
              fill={`url(#${id})`}
            />
            <path d="M23 10V49M41 17V57" stroke="#b59159" />
            <path
              d="M15 42C18 28 26 40 30 32S41 27 48 23"
              fill="none"
              stroke="#8d6250"
              strokeDasharray="3 4"
            />
            <circle cx="48" cy="23" r="5" fill="#d2874d" />
            <path d="M13 22L16 18L20 21" fill="none" />
          </>
        ) : kind === "bag" ? (
          <>
            <path
              d="M12 25Q12 17 22 17H42Q52 17 52 25V52Q51 57 45 57H19Q13 57 12 52Z"
              fill="#9b653e"
            />
            <path d="M24 20V14Q32 5 40 14V20" fill="none" strokeWidth="5" />
            <path d="M10 24Q31 18 54 24L50 38Q32 45 14 38Z" fill="#c48d52" />
            <path d="M17 43V51M47 43V51" stroke="#e8bb77" />
            <rect
              x="27"
              y="33"
              width="11"
              height="13"
              rx="3"
              fill={`url(#${id})`}
            />
            <path d="M32 37V41" />
          </>
        ) : kind === "coat" ? (
          <>
            <path
              d="M24 13L14 20L6 34L17 41L23 34L20 56H44L41 34L47 41L58 34L50 20L40 13L32 21Z"
              fill="#88a38b"
            />
            <path d="M24 13L23 28L32 22L41 28L40 13" fill="#f9e3af" />
            <path d="M32 25V54M25 40H19M39 40H45" stroke="#476054" />
            <circle cx="32" cy="32" r="2.5" fill="#efbf6f" />
            <path d="M25 55H40" stroke="#f1cd8d" strokeWidth="3" />
          </>
        ) : kind === "star" ? (
          <path
            d="M32 7L39 24L57 26L44 39L47 57L32 48L17 57L20 39L7 26L25 24Z"
            fill={`url(#${id})`}
          />
        ) : (
          <>
            <path d="M14 11L47 7L54 14V55L20 59L11 52V17Z" fill="#453952" />
            <path d="M18 16L49 12V50L18 55Z" fill="#e8d4a3" />
            <path d="M12 12L44 7L47 12V49L15 55L11 51V17Z" fill="#71607e" />
            <path d="M16 17L40 13V43L16 48Z" fill="none" stroke="#d7b574" />
            <path
              d="M28 22L31 28L38 29L33 34L34 41L28 38L22 41L23 34L18 29L25 28Z"
              fill={`url(#${id})`}
            />
            <path d="M49 15L57 7L58 19L36 47L31 49L32 43Z" fill="#f4e2b7" />
            <path d="M50 18L34 43" fill="none" stroke="#b59870" />
          </>
        )}
      </g>
    </svg>
  );
}
