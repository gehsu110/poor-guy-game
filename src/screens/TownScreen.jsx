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
import { setScreenChrome } from '../screenChrome'

const HOME_THEME_COLORS = {
  academy: '#f8d9c8',
  summer: '#d7f0f5',
  sakura: '#e8d7ef',
  qixi: '#232a56',
  rainy: '#25325f',
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
  const { state, navigate } = useApp()
  const { profile } = state
  const gender   = profile?.avatarGender ?? 'girl'
  const outfitId = profile?.equipped?.outfit ?? 'academy'
  const { bg, frames, blink, image, video, bgTheme } = getOutfitAssets(outfitId, gender)

  useEffect(() => {
    return setScreenChrome(HOME_THEME_COLORS[bgTheme] ?? HOME_THEME_COLORS.academy)
  }, [bgTheme])

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
      {bgTheme === 'qixi' && (
        <div className="qixi-scene" aria-hidden="true">
          <span className="qixi-galaxy-glow" />
          <span className="qixi-ground-shadow" />
          <i className="qixi-star qixi-star--one" />
          <i className="qixi-star qixi-star--two" />
          <i className="qixi-star qixi-star--three" />
          <i className="qixi-thread qixi-thread--one" />
          <i className="qixi-thread qixi-thread--two" />
        </div>
      )}
      {bgTheme === 'rainy' && (
        <div className="rainy-scene" aria-hidden="true">
          <span className="rainy-lantern-glow" />
          <span className="rainy-ground-shadow" />
          <i className="rainy-drop rainy-drop--one" />
          <i className="rainy-drop rainy-drop--two" />
          <i className="rainy-drop rainy-drop--three" />
          <i className="rainy-drop rainy-drop--four" />
          <i className="rainy-drop rainy-drop--five" />
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
          animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            scale:   { duration: 0.5 },
            y: { duration: 0.5, ease: 'easeOut' },
          }}
        />
      ) : null}
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
