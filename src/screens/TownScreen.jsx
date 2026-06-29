import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, getTitle } from '../gameLogic'
import { getOutfitAssets } from '../outfitAssets'
import GameIcon from '../components/GameIcon'
import Avatar from '../components/Avatar'
import ChromaKeyCanvas from '../components/ChromaKeyCanvas'
import SpriteCharacter from '../components/SpriteCharacter'
import HomeSceneEffects from '../components/HomeSceneEffects'
import { setScreenChrome } from '../screenChrome'

const HOME_THEME_COLORS = {
  academy: {
    color: '#f8d9c8',
    background: 'linear-gradient(180deg, #f4cdb9 0%, #f8d9c8 58%, #fff2e8 100%)',
  },
  summer: {
    color: '#d7f0f5',
    background: 'linear-gradient(180deg, #c7eef8 0%, #d7f0f5 58%, #f0fbff 100%)',
  },
  sakura: {
    color: '#f2d1c2',
    background: 'linear-gradient(180deg, #f0cdbd 0%, #f4d9cf 56%, #efd7ef 100%)',
  },
  qixi: {
    color: '#232a56',
    background: 'linear-gradient(180deg, #171f4a 0%, #232a56 58%, #596397 100%)',
  },
  rainy: {
    color: '#25325f',
    background: 'linear-gradient(180deg, #18244e 0%, #25325f 58%, #56678f 100%)',
  },
}

function IdentityHUD({ profile }) {
  const title = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName = profile?.playerName?.trim() || '新手勇者'
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const expPct = expToNext > 0 ? Math.min(100, Math.round((expInLevel / expToNext) * 100)) : 100
  const gender = profile?.avatarGender ?? 'girl'
  const frame = profile?.equipped?.frame ?? 'soft_gold'
  const portraitImage = getOutfitAssets(profile?.equipped?.outfit ?? 'academy', gender).image
  return (
    <div className="academy-identity-hud">
      <div className="academy-status-board">
        <div className="academy-identity-chip">
          <Avatar gender={gender} variant="portrait" frame={frame} src={portraitImage} className="academy-hud-avatar" />
          <span className="academy-identity-chip__copy">
            <strong>{playerName}</strong>
            <small>Lv.{profile?.level ?? 1}・{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</small>
          </span>
        </div>
        <div className="academy-exp-track" aria-label={`經驗 ${expInLevel}/${expToNext}`}>
          <div className="academy-exp-track__meta">
            <span>EXP</span>
            <b>{expInLevel}/{expToNext}</b>
          </div>
          <div className="academy-exp-track__bar">
            <i style={{ width: `${expPct}%` }} />
          </div>
        </div>
        <div className="academy-currency-rail" aria-label="收藏資源">
          <button className="academy-mini-currency academy-mini-currency--gold" title="黃星：每日與任務獎勵"><GameIcon name="coin-gold" /><b>{profile?.stars?.yellow ?? 0}</b></button>
          <button className="academy-mini-currency academy-mini-currency--purple" title="紫星：稀有兌換素材"><GameIcon name="coin-purple" /><b>{profile?.stars?.purple ?? 0}</b></button>
          <button className="academy-mini-currency academy-mini-currency--pink" title="一般券：一般補給抽獎"><GameIcon name="ticket-normal" /><b>{profile?.tickets?.normal ?? 0}</b></button>
          <button className="academy-mini-currency academy-mini-currency--gold" title="金券：限定補給抽獎"><GameIcon name="ticket-gold" /><b>{profile?.tickets?.gold ?? 0}</b></button>
        </div>
      </div>
    </div>
  )
}

function HeroShowcase({ hasVideo, onWardrobeClick }) {
  return (
    <section className={`academy-home-hero${hasVideo ? ' has-video' : ''}`}>
      <div className="academy-home-hero__shine" />
      <button className="academy-wardrobe-fab" onClick={onWardrobeClick}>
        <GameIcon name="wardrobe" />
        <b>造型</b>
      </button>
    </section>
  )
}

export default function TownScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile } = state
  const [characterCue, setCharacterCue] = useState(null)
  const gender   = profile?.avatarGender ?? 'girl'
  const outfitId = profile?.equipped?.outfit ?? 'academy'
  const { bg, frames, blink, image, video, bgTheme } = getOutfitAssets(outfitId, gender)
  const hasGroundEffect = Boolean(profile?.equipped?.groundEffect)
  const characterClass = [
    'academy-screen-character',
    'academy-screen-character--tap',
    hasGroundEffect ? 'academy-screen-character--grounded' : '',
    characterCue ? 'academy-screen-character--celebrate' : '',
  ].filter(Boolean).join(' ')

  useEffect(() => {
    return setScreenChrome(HOME_THEME_COLORS[bgTheme] ?? HOME_THEME_COLORS.academy)
  }, [bgTheme])

  useEffect(() => {
    if (!state.homeEffectPulse) return
    setCharacterCue(state.homeEffectPulse)
    const cueTimer = window.setTimeout(() => setCharacterCue(null), 900)
    const clearTimer = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_HOME_SUCCESS_EFFECT' })
    }, 1550)
    return () => {
      window.clearTimeout(cueTimer)
      window.clearTimeout(clearTimer)
    }
  }, [dispatch, state.homeEffectPulse])

  useEffect(() => {
    if (!state.pendingHomeSuccessEffect) return
    const timer = window.setTimeout(() => {
      dispatch({ type: 'CONSUME_HOME_SUCCESS_EFFECT', id: state.pendingHomeSuccessEffect })
    }, 320)
    return () => window.clearTimeout(timer)
  }, [dispatch, state.pendingHomeSuccessEffect])

  return (
    <div className={`academy-screen academy-screen--${bgTheme ?? 'academy'}`}>
      {/* 全螢幕背景 */}
      <img src={bg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />
      <HomeSceneEffects theme={bgTheme ?? 'academy'} equipped={profile?.equipped} successPulse={state.homeEffectPulse} layer="back" />
      {/* 角色：綠幕影片優先，無影片用多幀動畫，最後靜態圖 */}
      {video ? (
        <ChromaKeyCanvas
          src={video}
          keyColor={[0, 255, 0]}
          threshold={130}
          className={characterClass}
        />
      ) : frames?.length > 0 ? (
        <SpriteCharacter
          frames={frames}
          blink={blink ?? []}
          fps={4}
          blinkInterval={3500}
          className={characterClass}
        />
      ) : image ? (
        <motion.img
          key={image}
          src={image}
          alt=""
          draggable="false"
          className={characterClass}
          initial={{ opacity: 0, x: '-50%', y: 24, scale: 0.92 }}
          animate={{ opacity: 1, x: '-50%', y: characterCue ? -8 : 0, scale: characterCue ? 1.035 : 1 }}
          transition={{
            opacity: { duration: 0.5 },
            scale:   { duration: characterCue ? 0.18 : 0.45 },
            y: { duration: characterCue ? 0.18 : 0.45, ease: 'easeOut' },
          }}
        />
      ) : null}
      <HomeSceneEffects theme={bgTheme ?? 'academy'} equipped={profile?.equipped} successPulse={state.homeEffectPulse} layer="front" />
      {/* UI 層（z-10，疊在角色上） */}
      <div className="academy-safe-top relative z-10 px-4">
        <IdentityHUD profile={profile} />
      </div>

      <div className="academy-home-content relative z-10 flex flex-1 flex-col px-4 pt-2">
        <HeroShowcase onWardrobeClick={() => navigate('profile', { tab: 'wardrobe' })} />
      </div>

      <BottomNav current="town" navigate={navigate} />
    </div>
  )
}

export function BottomNav({ current, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const tabs = [
    { key: 'town', label: '今日', icon: 'tab-today' },
    { key: 'map', label: '地圖', icon: 'tab-map' },
    { key: 'battle', label: '記帳', icon: 'tab-record', primary: true },
    { key: 'missions', label: '任務', icon: 'tab-quest' },
    { key: 'menu', label: '選單', icon: 'tab-menu', menu: true, activeKeys: ['shop', 'quest'] },
  ]
  const menuItems = [
    { key: 'shop', label: '商店', desc: '道具與兌換', icon: 'tab-supply', target: 'shop' },
    { key: 'quest', label: '公會', desc: '公會帳本', icon: 'tab-guild', target: 'quest' },
    { key: 'report', label: '月報', desc: '月度戰報', icon: 'report', target: 'map', params: { panel: 'report' } },
    { key: 'settings', label: '設定', desc: '提醒與偏好', icon: 'settings', target: 'profile', params: { tab: 'settings' } },
  ]

  function selectMenuItem(item) {
    setMenuOpen(false)
    navigate(item.target, item.params)
  }

  return (
    <>
      <div className="academy-dock">
        {tabs.map(tab => {
          const isActive = current === tab.key || tab.activeKeys?.includes(current)
          return (
            <button
              key={tab.key}
              className={`academy-dock-item ${tab.primary ? 'academy-dock-item--primary' : ''} ${isActive ? 'is-active' : ''}`}
              onClick={() => tab.menu ? setMenuOpen(true) : navigate(tab.key)}
              aria-label={tab.primary ? '記帳攻擊' : tab.label}
            >
              <span><GameIcon name={tab.icon} /></span>
              <b>{tab.label}</b>
            </button>
          )
        })}
      </div>

      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="academy-dock-radial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button className="academy-dock-radial__backdrop" onClick={() => setMenuOpen(false)} aria-label="關閉選單" />
              <div className="academy-dock-radial__stack">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.key}
                    className="academy-dock-radial__item"
                    onClick={() => selectMenuItem(item)}
                    initial={{ y: 18, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 12, opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.18, ease: 'easeOut', delay: index * 0.035 }}
                  >
                    <span><GameIcon name={item.icon} /></span>
                    <b>{item.label}</b>
                    <small>{item.desc}</small>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
