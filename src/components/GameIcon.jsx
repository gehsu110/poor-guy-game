// Tab 圖示：手繪 gameicons.net 風格 SVG（fill="currentColor"，CSS 控色）
// 貨幣圖示：3D Pikmin PNG（保留，22px 夠小）
import coinGold   from '../assets/icons/currency/coin-gold.png'
import coinPurple from '../assets/icons/currency/coin-purple.png'
import ticketNormal from '../assets/icons/currency/ticket-normal.png'
import ticketGold from '../assets/icons/currency/ticket-gold.png'

const IMAGE_ICONS = {
  'coin-gold':    coinGold,
  'coin-purple':  coinPurple,
  'ticket-normal':ticketNormal,
  'ticket-gold':  ticketGold,
}

const PATHS = {
  // ── Tab Bar（gameicons.net 平面風格，fill="currentColor"）─────────────
  'tab-today': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 12h32a4 4 0 014 4v38H12V16a4 4 0 014-4zM22 8v9M42 8v9M12 24h40M20 34h10M20 44h24"/>
      <path d="M40 30l2 4 4 .6-3 3 .8 4.2-3.8-2-3.8 2 .8-4.2-3-3 4-.6z" fill="currentColor" stroke="none"/>
    </g>
  ),

  'tab-map': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 16l14-6 18 6 14-6v39l-14 6-18-6-14 6zM23 10v39M41 16v39M16 39c7-9 13-10 20-4 5 4 9 1 13-7"/>
      <circle cx="16" cy="39" r="2.5" fill="currentColor" stroke="none"/><circle cx="49" cy="28" r="2.5" fill="currentColor" stroke="none"/>
    </g>
  ),

  'tab-quest': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h28a5 5 0 015 5v39H13V15a5 5 0 015-5zM22 10V6h20v4M21 24l5 5 10-11M21 38h22M21 47h15"/>
    </g>
  ),

  'tab-supply': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 25h44v29H10zM14 25v-8a7 7 0 017-7h22a7 7 0 017 7v8M10 36h44M27 31h10v12H27z"/>
      <circle cx="32" cy="37" r="2" fill="currentColor" stroke="none"/>
    </g>
  ),

  'tab-guild': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 7l22 10v16c0 13-8 20-22 25C18 53 10 46 10 33V17zM20 31l12-10 12 10v15H20zM27 46V35h10v11"/>
    </g>
  ),

  'tab-record': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10h24l8 8v36H17zM41 10v10h8M24 29h14M24 39h10" />
      <path d="M38 44l8-8 5 5-8 8-7 2z" />
      <path d="M25 49l2.2 4.2 4.8.7-3.5 3.4.8 4.7-4.3-2.3-4.3 2.3.8-4.7-3.5-3.4 4.8-.7z" fill="currentColor" stroke="none" />
    </g>
  ),

  'tab-menu': (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="13" width="15" height="15" rx="4" />
      <rect x="36" y="13" width="15" height="15" rx="4" />
      <rect x="13" y="36" width="15" height="15" rx="4" />
      <rect x="36" y="36" width="15" height="15" rx="4" />
    </g>
  ),

  // ── Currency / tickets（SVG fallback，正常用 IMAGE_ICONS）────────────
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

  // ── Screen Icons ──────────────────────────────────────────────────────
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
  wardrobe: (
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 9c-5 0-8 3-8 7 0 5 4 7 8 7s8-2 8-7c0-4-3-7-8-7z" />
      <path d="M24 18l-11 8 7 10 5-3v20h14V33l5 3 7-10-11-8" />
      <path d="M32 34l2.2 4.3 4.8.7-3.5 3.4.9 4.8-4.4-2.3-4.4 2.3.9-4.8L25 39l4.8-.7z" />
    </g>
  ),
  guild: (
    <>
      <path className="game-icon__plate" d="M32 7l20 9v16c0 13.4-7.8 21.5-20 26-12.2-4.5-20-12.6-20-26V16l20-9z" />
      <path className="game-icon__line" d="M22 30l10-9 10 9v18H22V30z" />
      <path className="game-icon__accent" d="M28 48V36h8v12M25 31h14" />
    </>
  ),
  settings: (
    <>
      <path className="game-icon__plate" d="M32 9l5 6 8-1 3 8 7 4-4 7 3 8-7 4-3 8-8-1-5 6-5-6-8 1-3-8-7-4 3-8-4-7 7-4 3-8 8 1 5-6z" />
      <circle className="game-icon__line" cx="32" cy="32" r="9" />
      <circle className="game-icon__accent" cx="32" cy="32" r="4" />
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

  // ── Category Icons ────────────────────────────────────────────────────
  food: (
    <>
      <path className="game-icon__plate" d="M12 10h40v44H12z" />
      <path className="game-icon__line" d="M22 11v18M17 11v12c0 4 2 6 5 6s5-2 5-6V11M22 29v24M41 11c-5 5-7 12-7 20h9V11h-2zM39 31v22" />
    </>
  ),
  transport: (
    <>
      <path className="game-icon__plate" d="M13 22c0-7 6-12 13-12h12c7 0 13 5 13 12v25H13V22z" />
      <path className="game-icon__line" d="M18 29h28M20 18h24M18 41h28M22 47v7M42 47v7" />
      <circle className="game-icon__accent" cx="22" cy="37" r="3" />
      <circle className="game-icon__accent" cx="42" cy="37" r="3" />
    </>
  ),
  shopping: (
    <>
      <path className="game-icon__plate" d="M13 23h38l-4 31H17l-4-31z" />
      <path className="game-icon__line" d="M23 25c0-10 3-15 9-15s9 5 9 15" />
      <path className="game-icon__accent" d="M26 35h12M32 29v12" />
    </>
  ),
  play: (
    <>
      <path className="game-icon__plate" d="M18 22c3-5 8-8 14-8s11 3 14 8l7 21c2 7-6 12-11 7l-6-6h-8l-6 6c-5 5-13 0-11-7l7-21z" />
      <path className="game-icon__line" d="M24 27v12M18 33h12" />
      <circle className="game-icon__accent" cx="41" cy="29" r="3" />
      <circle className="game-icon__accent" cx="46" cy="36" r="3" />
    </>
  ),
  health: (
    <>
      <path className="game-icon__plate" d="M32 54S12 43 12 27c0-9 11-14 20-5 9-9 20-4 20 5 0 16-20 27-20 27z" />
      <path className="game-icon__accent" d="M28 27h8v7h7v8h-7v7h-8v-7h-7v-8h7v-7z" />
    </>
  ),
  daily: (
    <>
      <path className="game-icon__plate" d="M17 13h30v42H17z" />
      <path className="game-icon__line" d="M23 13V8M41 13V8M17 23h30M23 32h6M35 32h6M23 42h6M35 42h6" />
    </>
  ),
  learn: (
    <>
      <path className="game-icon__plate" d="M10 18l22-9 22 9-22 10-22-10zM18 25v18c9 6 19 6 28 0V25" />
      <path className="game-icon__line" d="M54 18v22" />
      <circle className="game-icon__accent" cx="54" cy="44" r="4" />
    </>
  ),
  other: (
    <>
      <path className="game-icon__plate" d="M32 8l7 8 11-1-1 11 7 8-9 6-2 11-11-3-10 6-5-10-10-4 5-10-3-11 11-2 8-9 8 8z" />
      <circle className="game-icon__accent" cx="32" cy="32" r="6" />
    </>
  ),
}

const ALIASES = {
  star: 'yellow-star',
  purple: 'purple-star',
  ticket: 'normal-ticket',
  goldTicket: 'gold-ticket',
  home: 'guild',
  bag: 'shop',
  boss: 'battle',
}

export default function GameIcon({ name, className = '', title }) {
  const resolved = ALIASES[name] ?? name
  const imgSrc = IMAGE_ICONS[resolved]

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        className={`game-icon game-icon--img game-icon--${resolved} ${className}`}
        alt={title ?? name}
        aria-hidden={title ? undefined : true}
      />
    )
  }

  return (
    <svg
      className={`game-icon game-icon--${resolved} ${className}`}
      viewBox="0 0 64 64"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {PATHS[resolved] ?? PATHS.unknown}
    </svg>
  )
}
