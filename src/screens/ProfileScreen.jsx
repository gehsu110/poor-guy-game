import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, getTitle, TITLES, formatMoney } from '../gameLogic'
import { loginWithGoogle, updateProfile } from '../firebase'
import Avatar from '../components/Avatar'
import PaperDollFigure from '../components/PaperDollFigure'
import { PAPER_DOLL_SLOTS, PAPER_DOLL_ITEMS, getPaperDollAssets, normalizeAppearance, isPartOwned } from '../paperDoll'
import profileBg from '../assets/academy-art/profile-bg.webp'

/** 部件制衣櫃：髮型/服裝/道具/背景 各自獨立選擇，自由混搭（限定搭配保留給未來的限定商品） */

function AppearanceStage({ appearance }) {
  const assets = getPaperDollAssets(appearance)
  const { bg, bgTheme } = assets
  return (
    <div className={`academy-outfit-stage academy-outfit-stage--${bgTheme ?? 'plain'}`}>
      <img src={bg} alt="" className="academy-outfit-stage__bg" draggable="false" />
      <PaperDollFigure assets={assets} className="academy-outfit-stage__avatar" />
    </div>
  )
}

function WardrobePanel({ appearance, collectionIds, onEquipPart }) {
  const current = normalizeAppearance(appearance)
  return (
    <div className="academy-collection">
      <section className="academy-style-hero">
        <AppearanceStage appearance={current} />
        <div className="academy-style-hero__info">
          <span className="academy-style-kicker">九槽混搭衣櫃</span>
          <h2>今天想怎麼冒險？</h2>
          <p>核心服裝維持完整對位，帽子、眼鏡、翅膀與寵物可以自由加上去。</p>
        </div>
      </section>

      {PAPER_DOLL_SLOTS.map(slot => (
        <section key={slot.key} className="academy-shop-section" style={{ marginTop: 12 }}>
          <div className="academy-shop-section__head">
            <div><b>{slot.label}</b></div>
          </div>
          <div className="academy-style-grid">
            {Object.entries(PAPER_DOLL_ITEMS[slot.key]).map(([key, item]) => {
              const owned = isPartOwned(slot.key, key, collectionIds)
              const active = current[slot.key] === key
              const previewAssets = getPaperDollAssets({ ...current, [slot.key]: key })
              return (
                <button
                  key={item.id}
                  className={`academy-style-card ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}`}
                  onClick={() => owned && onEquipPart(slot.key, key)}
                >
                  <div className="academy-outfit-stage academy-outfit-stage--plain academy-style-card__stage">
                    {slot.key === 'background' ? (
                      <img src={previewAssets.bg} alt="" className="academy-outfit-stage__bg" />
                    ) : (
                      <PaperDollFigure assets={previewAssets} className="academy-outfit-stage__avatar" />
                    )}
                  </div>
                  <div className="academy-style-card__body">
                    <div className="academy-style-card__title">
                      <b>{item.name}</b>
                      <span>{item.rarity}</span>
                    </div>
                    <small>{owned ? item.desc : '未解鎖：商店取得'}</small>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function ExpBar({ expInLevel, expToNext }) {
  const pct = expToNext > 0 ? Math.min(expInLevel / expToNext, 1) : 1
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] font-black text-[#8E87A8]">
        <span>經驗</span>
        <span>{expInLevel} / {expToNext}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#ECE7F5]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#F5C518] to-[#52DED4]"
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  )
}

function TitleList({ currentLevel }) {
  return (
    <div className="flex flex-col gap-1.5">
      {TITLES.map((t, i) => {
        const unlocked = currentLevel >= t.minLv
        return (
          <div key={i} className={`academy-list-row ${unlocked ? '' : 'opacity-55'}`}>
            <span className={`academy-icon ${unlocked ? 'academy-icon--star' : 'academy-icon--unknown'}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[#26324A]">{t.name}</div>
              <div className="truncate text-[10px] font-bold text-[#8E87A8]">{t.desc}</div>
            </div>
            <div className="text-[10px] font-black text-[#8E87A8]">等級 {t.minLv}</div>
          </div>
        )
      })}
    </div>
  )
}

function SettingSection({ title, eyebrow, children }) {
  return (
    <section className="academy-settings-section">
      <div className="academy-settings-section__head">
        <span>{eyebrow}</span>
        <b>{title}</b>
      </div>
      <div className="academy-settings-section__body">{children}</div>
    </section>
  )
}

function SettingRow({ label, value, note, action, danger = false }) {
  return (
    <div className={`academy-settings-row ${danger ? 'academy-settings-row--danger' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="academy-settings-row__label">{label}</div>
        {note && <div className="academy-settings-row__note">{note}</div>}
      </div>
      <div className="academy-settings-row__side">
        {value && <span>{value}</span>}
        {action}
      </div>
    </div>
  )
}

function SettingToggle({ checked, onClick, label }) {
  return (
    <button
      type="button"
      className={`academy-setting-toggle ${checked ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  )
}

export default function ProfileScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user, screenParams } = state
  const [tab, setTab] = useState(screenParams?.tab ?? 'stats')
  const [editName, setEditName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.playerName ?? '新手勇者')

  const level = profile?.level ?? 1
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const title = getTitle(level)
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const equipped = profile?.equipped ?? {}
  const collectionIds = new Set((profile?.collection ?? []).map(item => item.id))
  const avatarGender = profile?.avatarGender ?? 'girl'
  const playerName = profile?.playerName?.trim() || '新手勇者'
  const directTab = ['wardrobe', 'settings'].includes(screenParams?.tab) ? screenParams.tab : null
  const pageTitle = directTab === 'wardrobe' ? '造型收藏'
    : directTab === 'settings' ? '設定'
    : '冒險者資料'
  const profilePortraitAssets = getPaperDollAssets(equipped.appearance)

  async function handleGoogleLink() {
    try {
      await loginWithGoogle()
    } catch (e) {
      console.error(e)
    }
  }

  async function savePlayerName() {
    const nextName = nameInput.trim().slice(0, 12)
    if (!nextName) return
    const data = { playerName: nextName }
    dispatch({ type: 'UPDATE_PROFILE', data })
    setEditName(false)
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function replayOnboarding() {
    const data = { onboardingDone: false }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function chooseAvatar(gender) {
    const data = { avatarGender: gender }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function equipPart(slot, key) {
    const data = {
      equipped: {
        ...equipped,
        appearance: { ...normalizeAppearance(equipped.appearance), [slot]: key },
      },
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

  async function updatePreference(key, value) {
    const preferences = {
      ...(profile?.preferences ?? {}),
      [key]: value,
    }
    dispatch({ type: 'UPDATE_PROFILE', data: { preferences } })
    if (user) {
      try {
        await updateProfile(user.uid, { preferences })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div className="academy-screen">
      <img src={profileBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="academy-safe-top relative z-10 flex items-center gap-2 px-4 pb-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">{pageTitle}</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-32">
        {!directTab && <div className="academy-card mb-3 text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <Avatar
              gender={avatarGender}
              variant="bust"
              frame={equipped.frame ?? 'soft_gold'}
              outfit={equipped.outfit ?? 'academy'}
              accessory={equipped.accessory ?? 'star_pin'}
              src={profilePortraitAssets.staticImage}
              layers={profilePortraitAssets.layers}
              className="academy-profile-avatar"
            />
          </div>
          <div className="text-base font-black text-[#26324A]">{playerName}</div>
          <div className="text-xs font-bold text-[#8E87A8]">稱號：{equippedTitle ?? title.name}</div>
          <div className="text-[10px] font-bold text-[#8E87A8]">{title.desc}</div>
          <div className="mx-auto mt-2 w-52">
            <ExpBar expInLevel={expInLevel} expToNext={expToNext} />
          </div>
        </div>}

        {!directTab && <div className="mb-3 grid grid-cols-4 gap-2">
          {[
            { label: '黃色星星', val: profile?.stars?.yellow ?? 0, tone: 'gold' },
            { label: '紫色星星', val: profile?.stars?.purple ?? 0, tone: 'purple' },
            { label: '一般扭蛋券', val: profile?.tickets?.normal ?? 0, tone: 'blue' },
            { label: '金色扭蛋券', val: profile?.tickets?.gold ?? 0, tone: 'pink' },
          ].map(c => (
            <div key={c.label} className={`academy-mini-stat academy-mini-stat--${c.tone}`}>
              <div className="text-sm font-black">{c.val}</div>
              <div className="text-[9px] font-bold">{c.label}</div>
            </div>
          ))}
        </div>}

        {!directTab && <div className="academy-tabs mb-3">
          {[
            { k: 'stats', label: '狀態' },
            { k: 'titles', label: '稱號' },
            { k: 'wardrobe', label: '造型' },
            { k: 'settings', label: '設定' },
          ].map(t => (
            <button key={t.k} className={tab === t.k ? 'is-active' : ''} onClick={() => setTab(t.k)}>
              {t.label}
            </button>
          ))}
        </div>}

        {tab === 'stats' && (
          <div className="academy-card">
            <div className="mb-3 text-xs font-black text-[#26324A]">今日狀態</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '今日消費', val: `NT$${formatMoney(state.totalSpent)}` },
                { label: '今日預算', val: `NT$${formatMoney(profile?.dailyBudget ?? 1000)}` },
                { label: '連續記帳', val: `${profile?.consecutiveDays ?? 0}天` },
                { label: '咒靈血量', val: `${formatMoney(state.currentHp)}` },
              ].map(s => (
                <div key={s.label} className="academy-stat-box">
                  <div className="text-[10px] font-bold text-[#8E87A8]">{s.label}</div>
                  <div className="text-sm font-black text-[#26324A]">{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'titles' && (
          <div className="academy-card">
            <div className="mb-3 text-xs font-black text-[#26324A]">所有稱號</div>
            <TitleList currentLevel={level} />
          </div>
        )}

        {tab === 'wardrobe' && (
          <WardrobePanel
            appearance={equipped.appearance}
            collectionIds={collectionIds}
            onEquipPart={equipPart}
          />
        )}

        {tab === 'settings' && (
          <div className="academy-settings-page">
            <SettingSection title="玩家資料" eyebrow="Adventurer">
              {editName ? (
                <div className="academy-settings-edit-row">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="min-w-0 flex-1 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
                    maxLength={12}
                    placeholder="輸入玩家名稱"
                  />
                  <button className="academy-small-button" onClick={savePlayerName}>儲存</button>
                </div>
              ) : (
                <SettingRow
                  label="暱稱"
                  value={playerName}
                  note="顯示在主畫面與遠征紀錄。"
                  action={(
                    <button className="academy-inline-action" onClick={() => {
                      setNameInput(playerName)
                      setEditName(true)
                    }}>修改</button>
                  )}
                />
              )}

              <SettingRow
                label="主角外觀"
                value={avatarGender === 'boy' ? '男主角' : '女主角'}
                note="這是角色版本偏好，不是套裝衣櫃；套裝收藏仍從主畫面的「造型」入口管理。"
              />
              <div className="academy-avatar-segment">
                {[
                  { k: 'boy', label: '男主角' },
                  { k: 'girl', label: '女主角' },
                ].map(a => (
                  <button
                    key={a.k}
                    className={`academy-avatar-option ${avatarGender === a.k ? 'is-active' : ''}`}
                    onClick={() => chooseAvatar(a.k)}
                  >
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="資料與同步" eyebrow="Privacy">
              {user?.isAnonymous ? (
                <SettingRow
                  label="同步狀態"
                  value="匿名備份"
                  note="目前可保存遊戲進度；綁定 Google 後換裝置也能取回。"
                  action={<button className="academy-inline-action" onClick={handleGoogleLink}>綁定</button>}
                />
              ) : (
                <SettingRow
                  label="同步狀態"
                  value="已登入"
                  note={user?.email ?? user?.displayName ?? 'Google 帳號已連結'}
                />
              )}
              <SettingRow
                label="資料分層"
                value="規劃中"
                note="未來會把遊戲進度與記帳明細分開管理，方便匯出與刪除。"
              />
              <SettingRow
                label="匯出資料"
                value="CSV / JSON"
                note="先預留入口，之後提供記帳明細匯出。"
              />
              <SettingRow
                label="清除本機資料"
                value="尚未開放"
                note="破壞性操作會獨立確認，避免誤刪帳本。"
                danger
              />
            </SettingSection>

            <SettingSection title="聲音與回饋" eyebrow="Audio">
              <SettingRow
                label="背景音樂"
                value="準備中"
                note="未來首頁、地圖與 Boss 會有不同氛圍；預設會保持安靜。"
                action={(
                  <SettingToggle
                    checked={!!profile?.preferences?.musicEnabled}
                    label="背景音樂"
                    onClick={() => updatePreference('musicEnabled', !profile?.preferences?.musicEnabled)}
                  />
                )}
              />
              <SettingRow
                label="操作音效"
                note="控制記帳、戰鬥、任務、抽獎與升級的短音效。"
                action={(
                  <SettingToggle
                    checked={profile?.preferences?.soundEnabled !== false}
                    label="操作音效"
                    onClick={() => updatePreference('soundEnabled', profile?.preferences?.soundEnabled === false)}
                  />
                )}
              />
              <SettingRow
                label="震動回饋"
                note="用在記帳成功、擊敗怪物與重要獎勵等短回饋。"
                action={(
                  <SettingToggle
                    checked={profile?.preferences?.hapticsEnabled !== false}
                    label="震動回饋"
                    onClick={() => updatePreference('hapticsEnabled', profile?.preferences?.hapticsEnabled === false)}
                  />
                )}
              />
            </SettingSection>

            <SettingSection title="提醒與說明" eyebrow="Guide">
              <SettingRow
                label="每日記帳提醒"
                note="提醒功能會在通知權限流程完成後啟用。"
                action={(
                  <SettingToggle
                    checked={!!profile?.preferences?.dailyReminder}
                    label="每日記帳提醒"
                    onClick={() => updatePreference('dailyReminder', !profile?.preferences?.dailyReminder)}
                  />
                )}
              />
              <SettingRow
                label="減少動態效果"
                note="保留角色與頁面資訊，但降低閃爍與場景特效。"
                action={(
                  <SettingToggle
                    checked={!!profile?.preferences?.reduceMotion}
                    label="減少動態效果"
                    onClick={() => updatePreference('reduceMotion', !profile?.preferences?.reduceMotion)}
                  />
                )}
              />
              <SettingRow
                label="新手教學"
                note="重新查看今日、地圖、任務、商店、公會與設定入口說明。"
                action={<button className="academy-inline-action" onClick={replayOnboarding}>重看</button>}
              />
            </SettingSection>
          </div>
        )}
      </div>

    </div>
  )
}
