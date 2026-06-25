import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, formatMoney, getTitle } from '../gameLogic'
import { getOutfitAssets } from '../outfitAssets'
import GameIcon from '../components/GameIcon'
import ChromaKeyCanvas from '../components/ChromaKeyCanvas'
import SpriteCharacter from '../components/SpriteCharacter'

function IdentityHUD({ profile, onProfileClick }) {
  const title = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName = profile?.playerName?.trim() || '窮鬼勇者'
  return (
    <div className="academy-identity-hud">
      <div className="academy-status-board">
        <button className="academy-identity-chip" onClick={onProfileClick} aria-label="前往成長頁">
          <span className="academy-identity-chip__copy">
            <strong>{playerName}</strong>
            <small>Lv.{profile?.level ?? 1}・{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</small>
          </span>
          <span className="academy-growth-gate">
            <GameIcon name="shop" />
            <b>成長</b>
          </span>
        </button>
        <div className="academy-currency-rail" aria-label="收藏貨幣">
          <span className="academy-mini-currency academy-mini-currency--gold"><GameIcon name="coin-gold" /><b>{profile?.stars?.yellow ?? 0}</b></span>
          <span className="academy-mini-currency academy-mini-currency--purple"><GameIcon name="coin-purple" /><b>{profile?.stars?.purple ?? 0}</b></span>
          <span className="academy-mini-currency academy-mini-currency--pink"><GameIcon name="ticket-normal" /><b>{profile?.tickets?.normal ?? 0}</b></span>
          <span className="academy-mini-currency academy-mini-currency--gold"><GameIcon name="ticket-gold" /><b>{profile?.tickets?.gold ?? 0}</b></span>
        </div>
      </div>
    </div>
  )
}

function HeroShowcase({ hasVideo }) {
  return (
    <section className={`academy-home-hero${hasVideo ? ' has-video' : ''}`}>
      <div className="academy-home-hero__shine" />
    </section>
  )
}

function AttackEntry({ spent, budget, onClick }) {
  const remaining = budget - spent
  const attackPower = Math.max(0, Math.round(spent / 10))
  return (
    <motion.button
      className="academy-attack-panel"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="academy-attack-summary">
        <div>
          <small>今日消費</small>
          <strong>NT${formatMoney(spent)}</strong>
        </div>
        <div className="academy-attack-summary__power">
          <small>今日攻擊力</small>
          <strong>+{attackPower}</strong>
        </div>
        <div className={remaining < 0 ? 'is-danger' : 'is-safe'}>
          <small>{remaining < 0 ? '今日已超支' : '今日可用預算'}</small>
          <strong>NT${formatMoney(Math.abs(remaining))}</strong>
        </div>
      </div>
      <div className="academy-attack-hint">記下一筆消費，轉化為今日攻擊力</div>
      <div className="academy-primary-cta mt-2 px-4 py-3 text-center text-sm font-black">
        立即記帳
      </div>
    </motion.button>
  )
}

export default function TownScreen() {
  const { state, navigate } = useApp()
  const { profile, totalSpent } = state
  const budget   = profile?.dailyBudget ?? 1000
  const gender   = profile?.avatarGender ?? 'girl'
  const outfitId = profile?.equipped?.outfit ?? 'academy'
  const { bg, frames, blink, image, video, bgTheme } = getOutfitAssets(outfitId, gender)
  return (
    <div className={`academy-screen academy-screen--${bgTheme ?? 'academy'}`}>
      {/* 全螢幕背景 */}
      <img src={bg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />
      {bgTheme === 'summer' && (
        <div className="summer-scene" aria-hidden="true">
          <span className="summer-cloud summer-cloud--one" />
          <span className="summer-cloud summer-cloud--two" />
          <span className="summer-sun-glow" />
          <i className="summer-spark summer-spark--one" />
          <i className="summer-spark summer-spark--two" />
          <i className="summer-spark summer-spark--three" />
        </div>
      )}
      {bgTheme === 'sakura' && (
        <div className="sakura-scene" aria-hidden="true">
          <span className="sakura-moon-glow" />
          <span className="sakura-ground-shadow" />
          <i className="sakura-petal sakura-petal--one" />
          <i className="sakura-petal sakura-petal--two" />
          <i className="sakura-petal sakura-petal--three" />
          <i className="sakura-petal sakura-petal--four" />
        </div>
      )}

      {/* 角色：綠幕影片優先，無影片用多幀動畫，最後靜態圖 */}
      {video ? (
        <ChromaKeyCanvas
          src={video}
          keyColor={[0, 255, 0]}
          threshold={130}
          className="academy-screen-character academy-screen-character--tap"
        />
      ) : frames?.length > 0 ? (
        <SpriteCharacter
          frames={frames}
          blink={blink ?? []}
          fps={4}
          blinkInterval={3500}
          className="academy-screen-character academy-screen-character--tap"
        />
      ) : image ? (
        <motion.img
          key={image}
          src={image}
          alt=""
          draggable="false"
          className="academy-screen-character academy-screen-character--tap"
          initial={{ opacity: 0, x: '-50%', y: 24, scale: 0.92 }}
          animate={{ opacity: 1, x: '-50%', y: [0, -10, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            scale:   { duration: 0.5 },
            y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          }}
        />
      ) : null}
      {/* UI 層（z-10，疊在角色上） */}
      <div className="relative z-10 px-4 pt-4">
        <IdentityHUD profile={profile} onProfileClick={() => navigate('profile')} />
      </div>

      <div className="academy-home-content relative z-10 flex flex-1 flex-col px-4 pb-24 pt-2">
        <HeroShowcase />
        <AttackEntry spent={totalSpent} budget={budget} onClick={() => navigate('battle')} />
      </div>

      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

export function BottomNav({ current, navigate }) {
  const tabs = [
    { key: 'town', label: '今日', icon: 'tab-today' },
    { key: 'map', label: '地圖', icon: 'tab-map' },
    { key: 'missions', label: '任務', icon: 'tab-quest' },
    { key: 'shop', label: '補給', icon: 'tab-supply' },
    { key: 'quest', label: '公會', icon: 'tab-guild' },
  ]

  return (
    <div className="academy-dock">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`academy-dock-item ${current === tab.key ? 'is-active' : ''}`}
          onClick={() => navigate(tab.key)}
        >
          <span><GameIcon name={tab.icon} /></span>
          <b>{tab.label}</b>
        </button>
      ))}
    </div>
  )
}
