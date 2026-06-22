// 3D Pikmin-Bloom 風格圖示 (Higgsfield 生成)
// TODO: 確認後下載到 src/assets/icons/ 並改為本地 import
const IMAGE_ICONS = {
  'tab-today':    'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123812_17165c82-7ccd-44d3-a1c6-f8232555221c.jpeg',
  'tab-map':      'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123814_9bfe8b29-15fc-4dfb-aa70-62ed9e48827c.jpeg',
  'tab-quest':    'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_121107_5d1debb4-2849-48f6-95e6-7749ba838bec.png',
  'tab-supply':   'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123816_7de8cc9c-0fc3-49a2-b01c-2dc5ddc191b0.jpeg',
  'tab-guild':    'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_124036_ea3a4703-a477-404c-a3cd-37f38f35f5c0.png',
  'coin-gold':    'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123918_e2e88447-8993-4537-a3a9-3e634b76ade9.jpeg',
  'coin-purple':  'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123921_458dd6cd-4f07-4a5c-a74c-82b535057670.png',
  'ticket-normal':'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_123924_6e1a5658-22d3-460c-9723-615b028bf6dd.png',
  'ticket-gold':  'https://d8j0ntlcm91z4.cloudfront.net/user_3FPA182DAJfdZN8nc5LUVbmXafz/hf_20260622_124037_319f8d9f-7956-4cf0-9735-09d19b8f837c.png',
}

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
  today: 'battle',
  purple: 'purple-star',
  ticket: 'normal-ticket',
  'gold-ticket': 'gold-ticket',
  goldTicket: 'gold-ticket',
  home: 'guild',
  bag: 'shop',
  boss: 'battle',
  // 3D 圖示別名
  'yellow-star-3d': 'coin-gold',
  'purple-star-3d': 'coin-purple',
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
    <svg className={`game-icon game-icon--${resolved} ${className}`} viewBox="0 0 64 64" role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {PATHS[resolved] ?? PATHS.unknown}
    </svg>
  )
}
