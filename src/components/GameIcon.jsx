const PATHS = {
  'yellow-star': (
    <>
      <path className="game-icon__plate" d="M32 6l22 12v28L32 58 10 46V18L32 6z" />
      <path className="game-icon__accent" d="M32 17l4.4 8.8 9.8 1.4-7.1 6.9 1.7 9.7L32 39.2l-8.8 4.6 1.7-9.7-7.1-6.9 9.8-1.4L32 17z" />
      <path className="game-icon__line" d="M18 47l28-29" />
    </>
  ),
  'purple-star': (
    <>
      <path className="game-icon__plate" d="M32 6l22 12v28L32 58 10 46V18L32 6z" />
      <path className="game-icon__accent" d="M32 17l4.4 8.8 9.8 1.4-7.1 6.9 1.7 9.7L32 39.2l-8.8 4.6 1.7-9.7-7.1-6.9 9.8-1.4L32 17z" />
      <path className="game-icon__line" d="M22 19h20M20 45h24" />
    </>
  ),
  'normal-ticket': (
    <>
      <path className="game-icon__plate" d="M12 19c0-4 3-7 7-7h26c4 0 7 3 7 7v26c0 4-3 7-7 7H19c-4 0-7-3-7-7 4.1-.8 7.2-4.4 7.2-8.7S16.1 28.4 12 27.6V19z" />
      <path className="game-icon__line" d="M41 16v32" />
      <path className="game-icon__accent" d="M28 22l3 6 6.7 1-4.8 4.7 1.1 6.6-6-3.2-6 3.2 1.1-6.6-4.8-4.7 6.7-1 3-6z" />
    </>
  ),
  'gold-ticket': (
    <>
      <path className="game-icon__plate" d="M12 19c0-4 3-7 7-7h26c4 0 7 3 7 7v26c0 4-3 7-7 7H19c-4 0-7-3-7-7 4.1-.8 7.2-4.4 7.2-8.7S16.1 28.4 12 27.6V19z" />
      <path className="game-icon__line" d="M41 16v32" />
      <path className="game-icon__accent" d="M28 21l4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.4L28 42.4l-8.4 4.5 1.6-9.4-6.8-6.6 9.4-1.4L28 21z" />
    </>
  ),
  battle: (
    <>
      <path className="game-icon__plate" d="M32 7l20 9v16c0 13.4-7.8 21.5-20 26-12.2-4.5-20-12.6-20-26V16l20-9z" />
      <path className="game-icon__line" d="M22 17l25 25M42 17L17 42" />
      <path className="game-icon__accent" d="M20 44l-5 5M44 44l5 5M18 16l-3-3M46 16l3-3" />
    </>
  ),
  map: (
    <>
      <path className="game-icon__plate" d="M13 14l12-5 14 5 12-5v41l-12 5-14-5-12 5V14z" />
      <path className="game-icon__line" d="M25 10v40M39 14v40" />
      <path className="game-icon__accent game-icon__route" d="M18 40c5-10 12-13 19-8 5 3.5 8 2 11-5" />
      <circle className="game-icon__dot" cx="18" cy="40" r="3" />
      <circle className="game-icon__dot" cx="48" cy="27" r="3" />
    </>
  ),
  mission: (
    <>
      <path className="game-icon__plate" d="M19 11h26c4 0 7 3 7 7v31c0 4-3 7-7 7H19c-4 0-7-3-7-7V18c0-4 3-7 7-7z" />
      <path className="game-icon__line" d="M24 27h17M24 37h17M24 47h10" />
      <path className="game-icon__accent" d="M24 12c1-4 4-6 8-6s7 2 8 6M43 45l4 4 8-11" />
    </>
  ),
  shop: (
    <>
      <path className="game-icon__plate" d="M14 28h36l-3 25H17l-3-25z" />
      <path className="game-icon__line" d="M23 28c0-10 4-16 9-16s9 6 9 16M18 36h28" />
      <path className="game-icon__accent" d="M32 35l2.5 5 5.5.8-4 3.9.9 5.4-4.9-2.6-4.9 2.6.9-5.4-4-3.9 5.5-.8L32 35z" />
    </>
  ),
  guild: (
    <>
      <path className="game-icon__plate" d="M32 7l20 9v16c0 13.4-7.8 21.5-20 26-12.2-4.5-20-12.6-20-26V16l20-9z" />
      <path className="game-icon__line" d="M22 30l10-9 10 9v18H22V30z" />
      <path className="game-icon__accent" d="M28 48V36h8v12M25 31h14" />
    </>
  ),
  skull: (
    <>
      <path className="game-icon__plate" d="M32 9c10 0 18 7.5 18 17 0 7.2-4 12.5-9 15v10H23V41c-5-2.5-9-7.8-9-15 0-9.5 8-17 18-17z" />
      <path className="game-icon__line" d="M26 42v8M32 42v8M38 42v8" />
      <path className="game-icon__accent" d="M24 28h7v6h-7zM33 28h7v6h-7zM29 39h6" />
    </>
  ),
  unknown: (
    <>
      <path className="game-icon__plate" d="M32 8l20 10v28L32 56 12 46V18L32 8z" />
      <path className="game-icon__line" d="M22 32h20" />
      <circle className="game-icon__dot" cx="32" cy="32" r="4" />
    </>
  ),
}

const ALIASES = {
  star: 'yellow-star',
  today: 'battle',
  purple: 'purple-star',
  ticket: 'normal-ticket',
  'gold-ticket': 'gold-ticket',
  goldTicket: 'gold-ticket',
  home: 'guild',
  bag: 'shop',
  boss: 'battle',
}

export default function GameIcon({ name, className = '', title }) {
  const resolved = ALIASES[name] ?? name

  return (
    <svg className={`game-icon game-icon--${resolved} ${className}`} viewBox="0 0 64 64" role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {PATHS[resolved] ?? PATHS.unknown}
    </svg>
  )
}
