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
      hint: '目標：守住預算，擊殺今日怪物。',
      action: '下一步',
    },
    {
      title: '今日：主要戰鬥',
      text: '底部「今日」是主入口。點「開始記帳攻擊」就能輸入分類、備註與金額。',
      hint: '記帳金額會轉成傷害，預算剩越多越容易打倒怪物。',
      action: '下一步',
    },
    {
      title: '地圖：看本月路線',
      text: '地圖會把每天的結果變成路線節點，擊殺、未滅、未記帳和首領都會分開顯示。',
      hint: '節點可點開，看當天怪物、花費、評級與獎勵。',
      action: '下一步',
    },
    {
      title: '任務：每日與成就',
      text: '每日任務每天重置，長期成就會累積。完成後記得進任務頁領獎。',
      hint: '任務獎勵會給經驗、黃色星星或紫色星星。',
      action: '下一步',
    },
    {
      title: '補給：四種貨幣',
      text: '黃色星星和紫色星星可直購收集品；一般扭蛋券抽一般池，金色扭蛋券抽限定池。',
      hint: '金色扭蛋券主要來自公會月度挑戰。',
      action: '下一步',
    },
    {
      title: '公會：家庭財務基地',
      text: '公會不是聊天公會，第一版是你的財務基地：收入、固定支出、儲蓄和共用基金都在這裡。',
      hint: '月度挑戰完成後可拿金色扭蛋券。',
      action: '下一步',
    },
    {
      title: '頭像：資料與設定',
      text: '點左上角頭像可以改玩家名稱、男/女主角、每日預算、自訂分類，也能查看稱號和收藏。',
      hint: '找不到設定時，先點頭像。',
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
        <div className="academy-onboarding__badge">{step + 1}/{pages.length}</div>
        <div className="academy-onboarding__title">{page.title}</div>
        <div className="academy-onboarding__text">{page.text}</div>
        <div className="academy-onboarding__hint">{page.hint}</div>
        <div className="academy-onboarding__dots">
          {pages.map((_, i) => <span key={i} className={i === step ? 'is-active' : ''} />)}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button className="academy-onboarding__ghost" onClick={() => setStep(v => v - 1)}>
              上一步
            </button>
          )}
          {step < pages.length - 1 && (
            <button className="academy-onboarding__ghost" onClick={finish}>
              略過
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
