import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, getTitle, formatMoney } from '../gameLogic'
import { getPaperDollAssets } from '../paperDoll'
import GameIcon from '../components/GameIcon'
import Avatar from '../components/Avatar'
import PaperDollFigure from '../components/PaperDollFigure'
import HomeSceneEffects from '../components/HomeSceneEffects'
import { setScreenChrome } from '../screenChrome'
import { buildMissions } from '../progression'
import { useReducedMotion } from 'framer-motion'
import StorybookActor from '../components/StorybookActor'
import { STORYBOOK_ART, getStorybookArt } from '../storybookAssets'
import { isStorybook, STORYBOOK_OWL_ID } from '../storybookCatalog'

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
  ledger: {
    color: '#1f2649',
    background: 'linear-gradient(180deg, #172047 0%, #283058 54%, #f1d1b7 100%)',
  },
  plain: {
    color: '#e8e0f7',
    background: 'linear-gradient(180deg, #e5ddf5 0%, #efe9f8 58%, #fdf8f0 100%)',
  },
  plaza: {
    color: '#4a3f78',
    background: 'linear-gradient(180deg, #3d3468 0%, #5a4f8e 58%, #f3d9c0 100%)',
  },
}

function IdentityHUD({ profile, navigate }) {
  const title = profile ? getTitle(profile.level) : null
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const playerName = profile?.playerName?.trim() || '新手勇者'
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const expPct = expToNext > 0 ? Math.min(100, Math.round((expInLevel / expToNext) * 100)) : 100
  const gender = profile?.avatarGender ?? 'girl'
  const frame = profile?.equipped?.frame ?? 'soft_gold'
  const portraitAssets = getPaperDollAssets(profile?.equipped?.appearance)
  return (
    <div className="academy-identity-hud">
      <div className="academy-status-board">
        <button className="academy-identity-chip" onClick={() => navigate('missions', { tab: 'journey' })} aria-label="查看冒險者成長">
          <Avatar gender={gender} variant="portrait" frame={frame} src={isStorybook(profile) ? getStorybookArt(profile).still : portraitAssets.staticImage} layers={isStorybook(profile) ? [] : portraitAssets.layers} className={`academy-hud-avatar ${isStorybook(profile) ? 'storybook-portrait' : ''}`} />
          <span className="academy-identity-chip__copy">
            <strong>{playerName}</strong>
            <small>Lv.{profile?.level ?? 1}・{equippedTitle ?? title?.name ?? '菜鳥冒險者'}</small>
          </span>
        </button>
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
          <button onClick={() => navigate('shop')} className="academy-mini-currency academy-mini-currency--gold" title="黃星：每日與任務獎勵"><GameIcon name="coin-gold" /><b>{profile?.stars?.yellow ?? 0}</b></button>
          <button onClick={() => navigate('shop')} className="academy-mini-currency academy-mini-currency--purple" title="紫星：稀有兌換素材"><GameIcon name="coin-purple" /><b>{profile?.stars?.purple ?? 0}</b></button>
          <button onClick={() => navigate('shop')} className="academy-mini-currency academy-mini-currency--pink" title="一般券：一般補給抽獎"><GameIcon name="ticket-normal" /><b>{profile?.tickets?.normal ?? 0}</b></button>
          <button onClick={() => navigate('shop')} className="academy-mini-currency academy-mini-currency--gold" title="金券：限定補給抽獎"><GameIcon name="ticket-gold" /><b>{profile?.tickets?.gold ?? 0}</b></button>
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
  const missions = buildMissions(state)
  const systemReduced = useReducedMotion()
  const reduced = systemReduced || profile?.preferences?.reduceMotion
  const todayBudget = state.dayRecord?.budget ?? profile?.dailyBudget ?? 1000
  const ready = [...missions.daily, ...missions.weekly, ...missions.journey, ...missions.achievements, ...missions.activities, missions.chest].filter(m => !m.planned && m.progress >= m.target && !profile?.claimedMissions?.[m.key]).length
  const [characterCue, setCharacterCue] = useState(null)
  const paperDollAssets = getPaperDollAssets(profile?.equipped?.appearance)
  const storybook = isStorybook(profile)
  const bg = storybook ? STORYBOOK_ART.courtyard : paperDollAssets.bg
  const bgTheme = storybook ? 'storybook' : paperDollAssets.bgTheme
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
    const startTimer = window.setTimeout(() => setCharacterCue(state.homeEffectPulse), 0)
    const cueTimer = window.setTimeout(() => setCharacterCue(null), 900)
    const clearTimer = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_HOME_SUCCESS_EFFECT' })
    }, 1550)
    return () => {
      window.clearTimeout(startTimer)
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
      {storybook && !reduced && <div className="storybook-motes" aria-hidden="true">{[0,1,2,3,4].map(i => <i key={i} style={{ '--i': i }} />)}</div>}
      {!storybook && !reduced && <HomeSceneEffects theme={bgTheme ?? 'academy'} equipped={profile?.equipped} successPulse={state.homeEffectPulse} layer="back" />}
      {/* 角色核心動畫與帽子、臉部、背部、寵物共用同一張標準畫布 */}
      {storybook ? <StorybookActor outfit={profile?.equipped?.storybookOutfit} className="storybook-home-actor" reduced={reduced} interactive successPulse={state.homeEffectPulse} companion={profile?.equipped?.storybookCompanion === STORYBOOK_OWL_ID} message={state.homeEffectPulse ? '記好了！你的每一頁，我都會好好珍藏。' : missions.chest.progress === 3 ? '今天的三件小事完成了，一起去看看獎勵吧。' : '一筆真實的紀錄，就是今天的小小冒險。'} /> : <PaperDollFigure assets={paperDollAssets} animated={!reduced} className={characterClass} />}
      {!storybook && !reduced && <HomeSceneEffects theme={bgTheme ?? 'academy'} equipped={profile?.equipped} successPulse={state.homeEffectPulse} layer="front" />}
      {/* UI 層（z-10，疊在角色上） */}
      <div className="academy-safe-top relative z-10 px-4">
        <IdentityHUD profile={profile} navigate={navigate} />
      </div>

      <div className="academy-home-content relative z-10 flex flex-1 flex-col px-4 pt-2">
        <HeroShowcase hasVideo={storybook} onWardrobeClick={() => navigate('profile', { tab: 'wardrobe' })} />
      </div>

      <section className="home-adventure" aria-label="今日冒險摘要">
        <div className="home-adventure__budget"><span>今日消費 <b className={state.totalSpent > todayBudget ? 'is-over' : ''}>NT${formatMoney(state.totalSpent)}</b></span><span>今日可用預算 <b>{formatMoney(todayBudget)}</b></span></div>
        <button onClick={() => navigate('missions')}><GameIcon name="tab-quest" /><span><strong>{ready ? `${ready} 份冒險獎勵等你收下` : missions.chest.progress === 3 ? '今天的手帳，已經寫好了' : '今天也寫下一頁冒險'}</strong></span><em>{missions.chest.progress}/3 完成 →</em></button>
      </section>

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
