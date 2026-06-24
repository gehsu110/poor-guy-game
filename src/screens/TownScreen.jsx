import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, formatMoney, getTitle } from '../gameLogic'
import { getOutfitAssets } from '../outfitAssets'
import GameIcon from '../components/GameIcon'
import ChromaKeyCanvas from '../components/ChromaKeyCanvas'
import SpriteCharacter from '../components/SpriteCharacter'
import summerRing from '../assets/academy-art/summer-set/swim-ring.webp'
import summerBall from '../assets/academy-art/summer-set/beach-ball.webp'
import summerBag from '../assets/academy-art/summer-set/shell-bag.webp'

function TopHUD({ todayBudget, spent }) {
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  return (
    <div className="academy-hud">
      <div className="academy-hud__labels mb-1 flex justify-between text-[10px] font-black">
        <span>今日預算</span>
        <span>剩餘 <b className={remaining < 0 ? 'is-danger' : 'is-safe'}>NT${formatMoney(Math.max(0, remaining))}</b></span>
      </div>
      <div className="academy-budget-track h-2.5 overflow-hidden rounded-full">
        <motion.div
          className={`academy-budget-fill h-full rounded-full ${remaining < 0 ? 'is-danger' : ''}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.45 }}
        />
      </div>
    </div>
  )
}

// 角色資訊卡（不含角色圖，角色已移到 screen 層）
function HeroShowcase({ profile, onProfileClick, hasVideo }) {
  const title         = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName    = profile?.playerName?.trim() || '窮鬼勇者'

  return (
    <section className={`academy-home-hero${hasVideo ? ' has-video' : ''}`}>
      <div className="academy-home-hero__shine" />

      <button className="academy-home-hero__style-button" onClick={onProfileClick} aria-label="前往成長頁">
        <GameIcon name="shop" />
        <span>成長</span>
      </button>

      <div className="academy-home-player-info">
        <div className="academy-home-player-info__left">
          <div className="academy-home-player-info__name">{playerName}</div>
          <div className="academy-home-player-info__title">Lv.{profile?.level ?? 1}・{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</div>
        </div>
        <div className="academy-home-player-info__currency">
          <span className="academy-pill academy-pill--gold"><GameIcon name="coin-gold" />{profile?.stars?.yellow ?? 0}</span>
          <span className="academy-pill academy-pill--purple"><GameIcon name="coin-purple" />{profile?.stars?.purple ?? 0}</span>
          <span className="academy-pill academy-pill--pink"><GameIcon name="ticket-normal" />{profile?.tickets?.normal ?? 0}</span>
          <span className="academy-pill academy-pill--gold"><GameIcon name="ticket-gold" />{profile?.tickets?.gold ?? 0}</span>
        </div>
      </div>
    </section>
  )
}

function AttackEntry({ spent, budget, onClick }) {
  const remaining = budget - spent
  return (
    <motion.button
      className="academy-attack-panel"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between text-xs font-black">
        <span className="academy-value-primary">今日消費 NT${formatMoney(spent)}</span>
        <span className={remaining < 0 ? 'is-danger' : 'is-safe'}>
          {remaining < 0 ? `超支 NT$${formatMoney(-remaining)}` : `剩餘 NT$${formatMoney(remaining)}`}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {['分類', '備註', '金額', '攻擊'].map((step, i) => (
          <div key={step} className={`academy-step ${i === 3 ? 'academy-step--attack' : ''}`}>
            <span>{i + 1}</span>
            <b>{step}</b>
          </div>
        ))}
      </div>
      <div className="academy-primary-cta mt-3 px-4 py-3 text-center text-sm font-black">
        開始記帳攻擊
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
      {bgTheme === 'summer' && (
        <div className="summer-outfit-props" aria-hidden="true">
          <motion.img src={summerRing} alt="" draggable="false" className="summer-prop summer-prop--ring" animate={{ y: [0, -7, 0], rotate: [-3, 2, -3] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.img src={summerBall} alt="" draggable="false" className="summer-prop summer-prop--ball" animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.img src={summerBag} alt="" draggable="false" className="summer-prop summer-prop--bag" animate={{ y: [0, -5, 0], rotate: [2, -2, 2] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      )}

      {/* UI 層（z-10，疊在角色上） */}
      <div className="relative z-10 px-4 pt-4">
        <TopHUD todayBudget={budget} spent={totalSpent} />
      </div>

      <div className="academy-home-content relative z-10 flex flex-1 flex-col px-4 pb-24 pt-2">
        <HeroShowcase profile={profile} onProfileClick={() => navigate('profile')} />
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
