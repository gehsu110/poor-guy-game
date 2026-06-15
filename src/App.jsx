import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './useAppStore'
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
        <div className="academy-splash__title">記帳魔法學院</div>
        <div className="academy-splash__sub">Expense Quest</div>
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
