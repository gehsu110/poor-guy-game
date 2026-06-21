import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, formatMoney, getTitle } from '../gameLogic'
import { getOutfitAssets } from '../outfitAssets'
import GameIcon from '../components/GameIcon'

function TopHUD({ todayBudget, spent }) {
  const remaining = todayBudget - spent
  const pct = todayBudget > 0 ? Math.min(spent / todayBudget, 1) : 0

  return (
    <div className="academy-hud">
      <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
        <span>今日預算</span>
        <span>剩餘 <b className={remaining < 0 ? 'text-[#FF6D98]' : 'text-[#24B7B0]'}>NT${formatMoney(Math.max(0, remaining))}</b></span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#EDE7F7]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#52DED4] via-[#FFD166] to-[#FF7FA3]"
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.45 }}
        />
      </div>
    </div>
  )
}

function HeroShowcase({ profile, onProfileClick }) {
  const gender    = profile?.avatarGender ?? 'girl'
  const outfitId  = profile?.equipped?.outfit ?? 'academy'
  const { image, video } = getOutfitAssets(outfitId, gender)

  const title         = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName    = profile?.playerName?.trim() || '窮鬼勇者'

  const videoRef   = useRef(null)
  const muteTimer  = useRef(null)

  // 點角色：暫時解除靜音播放音效，3 秒後自動靜音
  const handleCharacterTap = useCallback(() => {
    if (!videoRef.current) return
    clearTimeout(muteTimer.current)
    videoRef.current.muted = false
    muteTimer.current = setTimeout(() => {
      if (videoRef.current) videoRef.current.muted = true
    }, 3000)
  }, [])

  return (
    <section className="academy-home-hero">
      <div className="academy-home-hero__shine" />

      {/* 角色：有影片用影片，否則靜態圖 + 上下動畫 */}
      {video ? (
        <video
          ref={videoRef}
          key={video}
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="academy-home-hero__character academy-home-hero__character--tap"
          onClick={handleCharacterTap}
        />
      ) : image ? (
        <motion.img
          key={image}
          src={image}
          alt=""
          draggable="false"
          className="academy-home-hero__character academy-home-hero__character--tap"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}

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
          <span className="academy-pill academy-pill--gold"><GameIcon name="yellow-star" />{profile?.stars?.yellow ?? 0}</span>
          <span className="academy-pill academy-pill--purple"><GameIcon name="purple-star" />{profile?.stars?.purple ?? 0}</span>
          <span className="academy-pill academy-pill--pink"><GameIcon name="normal-ticket" />{profile?.tickets?.normal ?? 0}</span>
          <span className="academy-pill academy-pill--gold"><GameIcon name="gold-ticket" />{profile?.tickets?.gold ?? 0}</span>
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
        <span className="text-[#26324A]">今日消費 NT${formatMoney(spent)}</span>
        <span className={remaining < 0 ? 'text-[#FF6D98]' : 'text-[#24B7B0]'}>
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
      <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#8B7CFF] to-[#FF7FA3] px-4 py-3 text-center text-sm font-black text-white shadow-lg">
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
  const { bg }   = getOutfitAssets(outfitId, gender)

  return (
    <div className="academy-screen">
      {/* 全螢幕背景（套裝主題） */}
      <img src={bg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

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
    { key: 'town', label: '今日', icon: 'battle' },
    { key: 'map', label: '地圖', icon: 'map' },
    { key: 'missions', label: '任務', icon: 'mission' },
    { key: 'shop', label: '補給', icon: 'shop' },
    { key: 'quest', label: '公會', icon: 'guild' },
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
