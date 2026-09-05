import { useGameAudio } from './gameAudio'
import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { AppProvider, useApp } from './useAppStore'
import { updateProfile } from './firebase'
import TownScreen from './screens/TownScreen'
import { RewardReveal } from './components/AdventureUI'
import { parseAmount } from './progression'
import { useRegisterSW } from 'virtual:pwa-register/react'
const BattleScreen = lazy(() => import('./screens/BattleScreen'))
const MapScreen = lazy(() => import('./screens/MapScreen'))
const ShopScreen = lazy(() => import('./screens/ShopScreen'))
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'))
const QuestScreen = lazy(() => import('./screens/QuestScreen'))
const MissionScreen = lazy(() => import('./screens/MissionScreen'))
import { STORYBOOK_ART } from './storybookAssets'

const SCREEN_MAP = {
  town:    TownScreen,
  battle:  BattleScreen,
  map:     MapScreen,
  shop:    ShopScreen,
  profile: ProfileScreen,
  quest:   QuestScreen,
  missions: MissionScreen,
}

function LoadingScreen() {
  return (
    <div className="academy-splash">
      <img src={STORYBOOK_ART.courtyard} alt="" draggable="false" />
      <div className="academy-splash__shade" />
      <div className="academy-splash__brand">
        <div className="academy-splash__mark">
          <span className="academy-icon academy-icon--star" />
        </div>
        <div className="academy-splash__title">窮鬼勇者</div>
        <div className="academy-splash__sub">記帳打怪，守住預算</div>
      </div>
      <motion.div
        className="academy-splash__loading"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span />
        <span />
        <span />
      </motion.div>
    </div>
  )
}

function StarterRegistrationCard({ profile, user, dispatch, refresh }) {
  const [nameInput, setNameInput] = useState(['窮鬼勇者', '新手勇者'].includes(profile?.playerName) ? '' : (profile?.playerName ?? ''))
  const [gender, setGender] = useState(profile?.avatarGender ?? 'girl')
  const [budget, setBudget] = useState(String(profile?.dailyBudget ?? 1000))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function finish() {
    if (saving) return
    const dailyBudget = parseAmount(budget)
    if (!dailyBudget) { setError('請輸入大於 0 的每日預算'); return }
    setSaving(true)
    const playerName = nameInput.trim().slice(0, 12) || '新手勇者'
    const data = {
      playerName,
      dailyBudget,
      avatarGender: gender,
      nameConfirmed: true,
      onboardingDone: true,
    }
    try {
      if (user) await updateProfile(user.uid, data)
      dispatch({ type: 'UPDATE_PROFILE', data })
      await refresh()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <motion.div
      className="academy-onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="academy-onboarding__panel"
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="academy-onboarding__crest">
          <span className="academy-icon academy-icon--star" />
        </div>
        <div className="academy-onboarding__kicker">學院登錄處</div>
        <div className="academy-onboarding__title">建立冒險者資料</div>
        <div className="academy-onboarding__text">
          名字會顯示在主畫面與遠征紀錄。主角外觀是角色版本偏好，之後可在設定更換。
        </div>

        <input
          className="academy-name-input"
          value={nameInput}
          maxLength={12}
          onChange={e => setNameInput(e.target.value)}
          aria-label="冒險者名字"
          placeholder="例如：小小勇者"
        />

        <div className="academy-onboarding__label">主角外觀</div>
        <div className="academy-starter-switch">
          {[
            { key: 'girl', label: '女主角' },
            { key: 'boy', label: '男主角' },
          ].map(option => (
            <button
              key={option.key}
              className={gender === option.key ? 'is-active' : ''}
              onClick={() => setGender(option.key)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <label className="onboarding-budget"><span>每日預算 NT$<small className="block">先選舒服的額度，之後可調整</small></span><input aria-label="每日預算" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} /></label>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <button className="academy-small-button w-full" disabled={saving} onClick={finish}>
          開始記帳冒險
        </button>
      </motion.div>
    </motion.div>
  )
}

function OnboardingOverlay() {
  const { state, dispatch, refresh } = useApp()
  const { profile, user } = state

  if (!profile || profile.nameConfirmed) return null

  return <StarterRegistrationCard profile={profile} user={user} dispatch={dispatch} refresh={refresh} />
}

function AppContent() {
  const { state } = useApp()
  useGameAudio(state.profile?.preferences)
  const { loading, screen, notification } = state
  const systemReduced = useReducedMotion()
  const reduceMotion = !!systemReduced || !!state.profile?.preferences?.reduceMotion
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', reduceMotion); return () => document.documentElement.classList.remove('reduce-motion') }, [reduceMotion])

  if (loading) return <LoadingScreen />
  if (state.error) return <div className="app-recovery"><h1>冒險暫停一下</h1><p>{state.error}</p><button className="journal-primary" onClick={() => location.reload()}>重新連線</button><p>原有存檔仍保留，沒有被清除。</p></div>

  const Screen = SCREEN_MAP[screen] ?? TownScreen

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="w-full h-full"
          initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<LoadingScreen />}><Screen /></Suspense>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <OnboardingOverlay key="onboarding" />
        {notification && (
          <motion.div
            key="notification"
            className="academy-toast"
            role="status" aria-live="polite"
            initial={{ y: -18, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -18, opacity: 0 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      <RewardReveal />
      <UpdateNotice />
    </MotionConfig>
  )
}

function UpdateNotice() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const { state } = useApp()
  if (!needRefresh || state.screen === 'battle' || state.busy) return null
  return <div className="pwa-update" role="status"><span>新版本已準備好</span><button onClick={() => updateServiceWorker(true)}>更新遊戲</button></div>
}
class GameErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="app-recovery"><h1>冒險需要重新整隊</h1><p>畫面載入遇到問題，已保存的資料仍保留。</p><button className="journal-primary" onClick={() => location.reload()}>重新載入</button></div> : this.props.children }
}

export default function App() {
  return (
    <GameErrorBoundary><AppProvider>
      <AppContent />
    </AppProvider></GameErrorBoundary>
  )
}
