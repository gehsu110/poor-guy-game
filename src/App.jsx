import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './useAppStore'
import { updateProfile } from './firebase'
import TownScreen    from './screens/TownScreen'
import BattleScreen  from './screens/BattleScreen'
import MapScreen     from './screens/MapScreen'
import ShopScreen    from './screens/ShopScreen'
import ProfileScreen from './screens/ProfileScreen'
import QuestScreen   from './screens/QuestScreen'
import MissionScreen from './screens/MissionScreen'
import splashBg from './assets/academy-art/splash-bg.webp'

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
      <img src={splashBg} alt="" draggable="false" />
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

function OnboardingOverlay() {
  const { state, dispatch } = useApp()
  const { profile, user } = state
  const [step, setStep] = useState(0)

  if (!profile || profile.onboardingDone) return null

  const pages = [
    {
      title: '歡迎成為窮鬼勇者',
      text: '每一筆記帳都是一次攻擊。先記下消費，再看今日怪物扣血。',
      action: '下一步',
    },
    {
      title: '先打今日怪物',
      text: '底部「今日」是主入口。點「開始記帳攻擊」就能輸入分類、備註與金額。',
      action: '下一步',
    },
    {
      title: '頭像就是設定入口',
      text: '點左上角頭像可以改名字、主角、每日預算與自訂分類。',
      action: '開始冒險',
    },
  ]
  const page = pages[step]

  async function finish() {
    const data = { onboardingDone: true }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <motion.div
      className="academy-onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="academy-onboarding__card"
        key={step}
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="academy-onboarding__badge">{step + 1}/3</div>
        <div className="academy-onboarding__title">{page.title}</div>
        <div className="academy-onboarding__text">{page.text}</div>
        <div className="academy-onboarding__dots">
          {pages.map((_, i) => <span key={i} className={i === step ? 'is-active' : ''} />)}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button className="academy-onboarding__ghost" onClick={() => setStep(v => v - 1)}>
              上一步
            </button>
          )}
          <button
            className="academy-small-button flex-1"
            onClick={() => step < pages.length - 1 ? setStep(v => v + 1) : finish()}
          >
            {page.action}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AppContent() {
  const { state } = useApp()
  const { loading, screen, notification } = state

  if (loading) return <LoadingScreen />

  const Screen = SCREEN_MAP[screen] ?? TownScreen

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="w-full h-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <OnboardingOverlay />
        {notification && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-20 z-[80] -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[#FFD166]/50 bg-white/95 px-4 py-2 text-sm font-black text-[#D9961E] shadow-xl"
            initial={{ y: -18, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -18, opacity: 0 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
