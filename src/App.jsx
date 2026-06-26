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
import Avatar from './components/Avatar'

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

function StarterRegistrationCard({ profile, user, dispatch }) {
  const [nameInput, setNameInput] = useState(['窮鬼勇者', '新手勇者'].includes(profile?.playerName) ? '' : (profile?.playerName ?? ''))
  const [gender, setGender] = useState(profile?.avatarGender ?? 'girl')

  async function finish() {
    const playerName = nameInput.trim().slice(0, 12) || '新手勇者'
    const data = {
      playerName,
      avatarGender: gender,
      nameConfirmed: true,
      onboardingDone: true,
    }
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
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="academy-onboarding__badge">冒險者登錄</div>
        <div className="academy-onboarding__title">寫下你的名字</div>
        <div className="academy-onboarding__text">
          這個名字會顯示在主畫面與遠征紀錄裡。先選一位主角，之後也可以到設定更換。
        </div>

        <input
          className="academy-name-input"
          value={nameInput}
          maxLength={12}
          onChange={e => setNameInput(e.target.value)}
          placeholder="例如：小小勇者"
        />

        <div className="academy-starter-gender">
          {[
            { key: 'girl', label: '女主角' },
            { key: 'boy', label: '男主角' },
          ].map(option => (
            <button
              key={option.key}
              className={gender === option.key ? 'is-active' : ''}
              onClick={() => setGender(option.key)}
            >
              <Avatar
                gender={option.key}
                variant="full"
                outfit={profile?.equipped?.outfit ?? 'academy'}
                frame={profile?.equipped?.frame ?? 'soft_gold'}
                accessory={profile?.equipped?.accessory ?? 'star_pin'}
                className="academy-starter-avatar"
              />
              <b>{option.label}</b>
            </button>
          ))}
        </div>

        <button className="academy-small-button w-full" onClick={finish}>
          開始記帳冒險
        </button>
      </motion.div>
    </motion.div>
  )
}

function OnboardingOverlay() {
  const { state, dispatch } = useApp()
  const { profile, user } = state

  if (!profile || profile.nameConfirmed) return null

  return <StarterRegistrationCard profile={profile} user={user} dispatch={dispatch} />
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
