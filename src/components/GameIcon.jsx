import { useId } from 'react'

export default function GameIcon({ name, className = '', title }) {
  const uid = useId().replace(/:/g, '')
  const grad = `gi-grad-${name}-${uid}`
  const shine = `gi-shine-${name}-${uid}`

  const defs = (
    <defs>
      <linearGradient id={grad} x1="8" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
        <stop className="game-icon__stop-a" offset="0%" />
        <stop className="game-icon__stop-b" offset="100%" />
      </linearGradient>
      <radialGradient id={shine} cx="26%" cy="20%" r="76%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="44%" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
  )

  const starPath = 'M32 10.2l5.5 12 13.1 1.5-9.8 8.8 2.6 13-11.4-6.6-11.4 6.6 2.6-13-9.8-8.8 13.1-1.5L32 10.2z'

  const content = {
    'yellow-star': (
      <>
        <circle className="game-icon__medal" cx="32" cy="32" r="27" />
        <path className="game-icon__main" d={starPath} fill={`url(#${grad})`} />
        <path className="game-icon__spark" d="M46 10l1.8 4.2 4.2 1.8-4.2 1.8L46 22l-1.8-4.2L40 16l4.2-1.8L46 10z" />
        <circle className="game-icon__gloss" cx="24" cy="22" r="13" fill={`url(#${shine})`} />
      </>
    ),
    'purple-star': (
      <>
        <circle className="game-icon__medal" cx="32" cy="32" r="27" />
        <path className="game-icon__main" d={starPath} fill={`url(#${grad})`} />
        <path className="game-icon__spark" d="M17 13l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3 1.3-3z" />
        <circle className="game-icon__gloss" cx="24" cy="22" r="13" fill={`url(#${shine})`} />
      </>
    ),
    'normal-ticket': (
      <>
        <path className="game-icon__ticket-shadow" d="M12 20c0-4 3.2-7.2 7.2-7.2h25.6c4 0 7.2 3.2 7.2 7.2v24c0 4-3.2 7.2-7.2 7.2H19.2c-4 0-7.2-3.2-7.2-7.2 3.8-.8 6.6-4.2 6.6-8s-2.8-7.2-6.6-8V20z" />
        <path className="game-icon__main" fill={`url(#${grad})`} d="M11 18.4c0-4 3.2-7.2 7.2-7.2h27.6c4 0 7.2 3.2 7.2 7.2v27.2c0 4-3.2 7.2-7.2 7.2H18.2c-4 0-7.2-3.2-7.2-7.2 4-.9 7-4.4 7-8.6s-3-7.7-7-8.6v-10z" />
        <path className="game-icon__ticket-cut" d="M42 16v32" />
        <path className="game-icon__ticket-star" d="M28 21.5l3.1 6.2 6.9 1-5 4.8 1.2 6.8-6.2-3.2-6.1 3.2 1.1-6.8-4.9-4.8 6.8-1 3.1-6.2z" />
        <circle className="game-icon__gloss" cx="22" cy="19" r="12" fill={`url(#${shine})`} />
      </>
    ),
    'gold-ticket': (
      <>
        <path className="game-icon__ticket-shadow" d="M12 20c0-4 3.2-7.2 7.2-7.2h25.6c4 0 7.2 3.2 7.2 7.2v24c0 4-3.2 7.2-7.2 7.2H19.2c-4 0-7.2-3.2-7.2-7.2 3.8-.8 6.6-4.2 6.6-8s-2.8-7.2-6.6-8V20z" />
        <path className="game-icon__main" fill={`url(#${grad})`} d="M11 18.4c0-4 3.2-7.2 7.2-7.2h27.6c4 0 7.2 3.2 7.2 7.2v27.2c0 4-3.2 7.2-7.2 7.2H18.2c-4 0-7.2-3.2-7.2-7.2 4-.9 7-4.4 7-8.6s-3-7.7-7-8.6v-10z" />
        <path className="game-icon__ticket-cut" d="M42 16v32" />
        <path className="game-icon__ticket-star" d={starPath} transform="translate(-4 -2) scale(.75)" />
        <path className="game-icon__spark" d="M47 18l1.4 3.2 3.2 1.4-3.2 1.4L47 27.2 45.6 24l-3.2-1.4 3.2-1.4L47 18z" />
      </>
    ),
    map: (
      <>
        <path className="game-icon__paper" d="M11 14l13-5 16 5 13-5v41l-13 5-16-5-13 5V14z" />
        <path className="game-icon__main" fill={`url(#${grad})`} d="M24 9v41M40 14v41" />
        <path className="game-icon__route" d="M17 37c6-9 12-12 18-8 5 3 8 3 13-4" />
        <circle className="game-icon__pin" cx="47" cy="25" r="4" />
        <circle className="game-icon__pin" cx="18" cy="38" r="3" />
      </>
    ),
    mission: (
      <>
        <rect className="game-icon__board" x="14" y="11" width="36" height="43" rx="10" />
        <path className="game-icon__clip" d="M25 12c1.2-4 4-6 7-6s5.8 2 7 6" />
        <path className="game-icon__line" d="M23 26h18M23 35h18M23 44h12" />
        <path className="game-icon__check" d="M44 42l3 3 6-8" />
      </>
    ),
    shop: (
      <>
        <path className="game-icon__bag" d="M17 25h30l-2.5 26H19.5L17 25z" />
        <path className="game-icon__handle" d="M24 25c0-8 3.2-12 8-12s8 4 8 12" />
        <path className="game-icon__main" fill={`url(#${grad})`} d="M22 31h20l-1.4 15H23.4L22 31z" />
        <path className="game-icon__spark" d="M32 33l2 4.3 4.7.6-3.4 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.4-3.2 4.7-.6L32 33z" />
      </>
    ),
    guild: (
      <>
        <path className="game-icon__roof" d="M10 31l22-19 22 19h-7v22H17V31h-7z" />
        <rect className="game-icon__main" x="21" y="29" width="22" height="24" rx="5" fill={`url(#${grad})`} />
        <path className="game-icon__door" d="M29 53V40c0-2 1.4-3.4 3-3.4s3 1.4 3 3.4v13" />
        <path className="game-icon__spark" d="M32 19l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" />
      </>
    ),
    battle: (
      <>
        <path className="game-icon__main" fill={`url(#${grad})`} d="M17 17c6-6 18-6 29 5 8 8 8 17 1 24-7 7-18 7-29-4-9-9-9-17-1-25z" />
        <path className="game-icon__eye" d="M23 31c2-3 5-3 7 0M40 31c-2-3-5-3-7 0" />
        <path className="game-icon__mouth" d="M27 41c3 3 7 3 10 0" />
        <path className="game-icon__spark" d="M48 14l1.8 4 4 1.8-4 1.8-1.8 4-1.8-4-4-1.8 4-1.8 1.8-4z" />
      </>
    ),
    unknown: (
      <>
        <circle className="game-icon__unknown-ring" cx="32" cy="32" r="24" />
        <circle className="game-icon__unknown-dot" cx="32" cy="32" r="6" />
      </>
    ),
  }

  const alias = {
    star: 'yellow-star',
    today: 'yellow-star',
    purple: 'purple-star',
    ticket: 'normal-ticket',
    'gold-ticket': 'gold-ticket',
    goldTicket: 'gold-ticket',
    home: 'guild',
    bag: 'shop',
    boss: 'battle',
  }
  const resolved = alias[name] ?? name

  return (
    <svg className={`game-icon game-icon--${resolved} ${className}`} viewBox="0 0 64 64" role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {defs}
      {content[resolved] ?? content.unknown}
    </svg>
  )
}
