import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './useAppStore'
import TownScreen    from './screens/TownScreen'
import BattleScreen  from './screens/BattleScreen'
import MapScreen     from './screens/MapScreen'
import ShopScreen    from './screens/ShopScreen'
import ProfileScreen from './screens/ProfileScreen'
import QuestScreen   from './screens/QuestScreen'

const SCREEN_MAP = {
  town:    TownScreen,
  battle:  BattleScreen,
  map:     MapScreen,
  shop:    ShopScreen,
  profile: ProfileScreen,
  quest:   QuestScreen,
}

function LoadingScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(135deg, #C8A8E9 0%, #A8D8EA 100%)' }}>
      <motion.div
        className="text-6xl"
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⚔️
      </motion.div>
      <div className="text-white font-black text-xl">記帳勇者</div>
      <motion.div
        className="flex gap-1"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/70"
            style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </motion.div>
    </div>
  )
}

function AppContent() {
  const { state } = useApp()
  const { loading, screen } = state

  if (loading) return <LoadingScreen />

  const Screen = SCREEN_MAP[screen] ?? TownScreen

  return (
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
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
