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
    <div className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{ background: 'radial-gradient(ellipse at center, #1A1040 0%, #0D0B1A 100%)' }}>
      {/* 魔法圓陣 */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(240,192,64,0.3)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ border: '1px solid rgba(155,109,255,0.4)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="text-5xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚔️
        </motion.div>
      </div>
      {/* 標題 */}
      <div className="text-center">
        <div
          className="font-black text-2xl"
          style={{
            background: 'linear-gradient(90deg, #A07820, #F0C040, #FFE680, #F0C040, #A07820)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          記帳勇者
        </div>
        <div className="text-xs mt-1" style={{ color: '#4A3F7A' }}>ExpenseQuest</div>
      </div>
      {/* 載入點 */}
      <motion.div
        className="flex gap-2"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full"
            style={{ background: '#9B6DFF', boxShadow: '0 0 6px #9B6DFF' }} />
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
