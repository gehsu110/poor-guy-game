import { useState } from 'react'
import { motion } from 'framer-motion'
import { parseAmount } from '../progression'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, getTitle, TITLES, formatMoney } from '../gameLogic'
import { loginWithGoogle, updateProfile, exportSave, transactGame } from '../firebase'
import Avatar from '../components/Avatar'
import PaperDollFigure from '../components/PaperDollFigure'
import {
  PAPER_DOLL_SLOTS,
  PAPER_DOLL_ITEMS,
  getPaperDollAssets,
  normalizeAppearance,
  isPartOwned,
  isPartCompatible,
  randomizeOwnedAppearance,
  countOwnedAppearanceCombinations,
} from '../paperDoll'
import profileBg from '../assets/academy-art/profile-bg.webp'
import StorybookActor from '../components/StorybookActor'
import { STORYBOOK_ART, getStorybookArt } from '../storybookAssets'
import { isStorybook, STORYBOOK_OWL_ID, STORYBOOK_OUTFITS, equipStorybookParts } from '../storybookCatalog'

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

function WardrobePanel({
  appearance,
  collectionIds,
  presets,
  onEquipPart,
  onApplyAppearance,
  onSavePreset,
  onDeletePreset,
  onRandomize,
  onOpenShop,
}) {
  const current = normalizeAppearance(appearance)
  const combinationCount = countOwnedAppearanceCombinations(collectionIds)
  return (
    <div className="academy-collection">
      <section className="academy-style-hero">
        <AppearanceStage appearance={current} />
        <div className="academy-style-hero__info">
          <span className="academy-style-kicker">九槽混搭衣櫃</span>
          <h2>今天想怎麼冒險？</h2>
          <p>核心服裝維持完整對位，帽子、眼鏡、翅膀與寵物可以自由加上去。</p>
          <div className="academy-style-meta">
            <span>已解鎖 {combinationCount.toLocaleString('zh-TW')} 種正式搭配</span>
          </div>
          <button type="button" className="academy-style-randomize" onClick={onRandomize}>換一套靈感</button>
        </div>
      </section>

      <section className="academy-style-presets">
        <div className="academy-shop-section__head">
          <div>
            <b>我的造型卡</b>
            <small>儲存三套常用搭配，換裝不用重新逐格找</small>
          </div>
          <span className="academy-status">{presets.filter(Boolean).length}/3</span>
        </div>
        <div className="academy-style-presets__grid">
          {Array.from({ length: 3 }, (_, index) => {
            const preset = presets[index]
            const presetAppearance = preset?.appearance ? normalizeAppearance(preset.appearance) : null
            const presetAssets = presetAppearance ? getPaperDollAssets(presetAppearance) : null
            return (
              <div key={index} className={`academy-style-preset ${preset ? '' : 'is-empty'}`}>
                <button
                  type="button"
                  className="academy-style-preset__preview"
                  onClick={() => presetAppearance ? onApplyAppearance(presetAppearance) : onSavePreset(index)}
                  aria-label={presetAppearance ? `套用造型卡 ${index + 1}` : `儲存到造型卡 ${index + 1}`}
                >
                  {presetAssets ? (
                    <PaperDollFigure assets={presetAssets} className="academy-style-preset__figure" />
                  ) : (
                    <span className="academy-style-preset__empty-mark">＋</span>
                  )}
                </button>
                <b>造型 {index + 1}</b>
                <div className="academy-style-preset__actions">
                  <button type="button" onClick={() => onSavePreset(index)}>{preset ? '覆蓋' : '儲存'}</button>
                  {preset && <button type="button" onClick={() => onDeletePreset(index)}>清除</button>}
                </div>
              </div>
            )
          })}
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
              const compatible = isPartCompatible(slot.key, key, current)
              const active = current[slot.key] === key
              const previewAssets = getPaperDollAssets({ ...current, [slot.key]: key })
              return (
                <button
                  key={item.id}
                  className={`academy-style-card ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'} ${compatible ? '' : 'is-incompatible'}`}
                  onClick={() => owned ? (compatible && onEquipPart(slot.key, key)) : onOpenShop(item.id)}
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
                    <small>{!owned ? '未解鎖：點擊前往商店' : compatible ? item.desc : '此搭配尚無正式動作資產'}</small>
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
  const { state, dispatch, navigate, notify, refresh } = useApp()
  const { profile, user, screenParams } = state
  const [tab, setTab] = useState(screenParams?.tab ?? 'stats')
  const [editName, setEditName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.playerName ?? '新手勇者')
  const [budgetInput, setBudgetInput] = useState(String(profile?.dailyBudget ?? 1000))
  const [exporting, setExporting] = useState(false)

  const level = profile?.level ?? 1
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const title = getTitle(level)
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const equipped = profile?.equipped ?? {}
  const collectionIds = new Set((profile?.collection ?? []).map(item => item.id))
  const appearancePresets = Array.from({ length: 3 }, (_, index) => profile?.appearancePresets?.[index] ?? null)
  const avatarGender = profile?.avatarGender ?? 'girl'
  const playerName = profile?.playerName?.trim() || '新手勇者'
  const directTab = ['wardrobe', 'settings'].includes(screenParams?.tab) ? screenParams.tab : null
  const pageTitle = directTab === 'wardrobe' ? '造型收藏'
    : directTab === 'settings' ? '設定'
    : '冒險者資料'
  const profilePortraitAssets = getPaperDollAssets(equipped.appearance)
  const [styleSaving, setStyleSaving] = useState(false)
  async function equipStorybook(withOwl = equipped.storybookCompanion === STORYBOOK_OWL_ID, outfit = equipped.storybookOutfit ?? 'mint') {
    if (styleSaving) return
    if (withOwl && !collectionIds.has(STORYBOOK_OWL_ID)) return notify('累積記帳 3 天後，到冒險手帳迎接書頁小鴞。')
    setStyleSaving(true)
    try {
      const result = await transactGame(user.uid, state.date, (fresh, record) => ({ profile: equipStorybookParts(fresh, { storybookOutfit: outfit, storybookCompanion: withOwl ? STORYBOOK_OWL_ID : null }), record }))
      dispatch({ type: 'UPDATE_PROFILE', data: result.profile })
      notify('薄荷帳本造型已裝備。')
    } catch (e) { notify(e.message) }
    finally { setStyleSaving(false) }
  }

  async function downloadBackup() {
    if (!user || exporting) return
    setExporting(true)
    try {
      const data = await exportSave(user.uid)
      const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expense-quest-${state.date}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      notify('備份檔已準備下載，包含帳本、造型與遊戲進度。')
    } catch (e) { notify(e.message) }
    finally { setExporting(false) }
  }
  async function saveBudget() {
    const dailyBudget = parseAmount(budgetInput)
    if (!dailyBudget) return notify('請輸入有效的每日預算。')
    try {
      await updateProfile(user.uid, { dailyBudget })
      dispatch({ type: 'UPDATE_PROFILE', data: { dailyBudget } })
      await refresh()
      notify(state.expenses.length || state.dayRecord.noSpend ? '預算已儲存，從明天的冒險生效。' : '每日預算已更新。')
    } catch (e) { notify(e.message) }
  }
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
    const data = { onboardingDone: false, nameConfirmed: false }
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
    await applyAppearance({ ...normalizeAppearance(equipped.appearance), [slot]: key })
  }

  async function applyAppearance(appearance) {
    if (styleSaving) return
    setStyleSaving(true)
    const data = {
      equipped: {
        ...equipped,
        visualStyle: 'classic',
        appearance: normalizeAppearance(appearance),
      },
    }
    if (user) {
      try {
        await updateProfile(user.uid, data)
        dispatch({ type: 'UPDATE_PROFILE', data })
      } catch (e) {
        notify(e.message)
      }
    }
    setStyleSaving(false)
  }

  async function saveAppearancePreset(index) {
    const nextPresets = [...appearancePresets]
    nextPresets[index] = {
      appearance: normalizeAppearance(equipped.appearance),
      savedAt: Date.now(),
    }
    const data = { appearancePresets: nextPresets }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function deleteAppearancePreset(index) {
    const nextPresets = [...appearancePresets]
    nextPresets[index] = null
    const data = { appearancePresets: nextPresets }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function randomizeAppearance() {
    await applyAppearance(randomizeOwnedAppearance(equipped.appearance, collectionIds))
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
    <div className="academy-screen academy-profile-screen">
      <img src={isStorybook(profile) ? STORYBOOK_ART.courtyard : profileBg} alt="" className="academy-bg" draggable="false" />
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
              src={isStorybook(profile) ? getStorybookArt(profile).still : profilePortraitAssets.staticImage}
              layers={isStorybook(profile) ? [] : profilePortraitAssets.layers}
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
          <>
          <section className="storybook-style-card">
            <div className="storybook-style-card__scene" style={{ backgroundImage: `url(${STORYBOOK_ART.courtyard})` }}><StorybookActor outfit={equipped.storybookOutfit} reduced={profile?.preferences?.reduceMotion} companion={equipped.storybookCompanion === STORYBOOK_OWL_ID} /></div>
            <div className="storybook-style-card__copy"><span className="journal-eyebrow">薄荷帳本 · 新系列 01</span><h2>把日常，穿成自己的樣子。</h2><p>薄荷斗篷、星徽貝雷帽與隨身帳本。會寫帳，也會向你打招呼。</p><button className="journal-primary" disabled={styleSaving || isStorybook(profile)} onClick={() => equipStorybook()}>{isStorybook(profile) ? '目前裝備中' : '裝備薄荷帳本'}</button>
            <div className="storybook-clothes-grid" aria-label="薄荷帳本衣服">{Object.entries(STORYBOOK_OUTFITS).map(([key, item]) => {
              const owned = item.cost === 0 || collectionIds.has(item.id)
              const active = isStorybook(profile) && (equipped.storybookOutfit ?? 'mint') === key
              return <button key={key} className={active ? 'is-active' : ''} disabled={styleSaving || active} onClick={() => owned ? equipStorybook(undefined, key) : navigate('shop', { tab: 'exchange', category: 'storybook' })}><StorybookActor outfit={key} reduced /><b>{item.name}</b><small>{active ? '穿著中' : owned ? '點擊換上' : '12 黃星 · 前往小店'}</small></button>
            })}</div>
            <button className="storybook-companion-toggle" disabled={styleSaving} onClick={() => collectionIds.has(STORYBOOK_OWL_ID) ? equipStorybook(equipped.storybookCompanion !== STORYBOOK_OWL_ID) : navigate('missions', { tab: 'collection' })}><img src={STORYBOOK_ART.owl} alt="" /><span><b>書頁小鴞</b><small>{collectionIds.has(STORYBOOK_OWL_ID) ? equipped.storybookCompanion === STORYBOOK_OWL_ID ? '同行中 · 點擊休息' : '已收藏 · 點擊同行' : '累積記帳 3 天後，在手帳領取'}</small></span><b>→</b></button></div>
          </section>
          <div className="journal-section-title"><h2>經典混搭</h2><span>選擇部件即可切換系列</span></div>
          <WardrobePanel
            appearance={equipped.appearance}
            collectionIds={collectionIds}
            presets={appearancePresets}
            onEquipPart={equipPart}
            onApplyAppearance={applyAppearance}
            onSavePreset={saveAppearancePreset}
            onDeletePreset={deleteAppearancePreset}
            onRandomize={randomizeAppearance}
            onOpenShop={itemId => navigate('shop', { tab: 'exchange', category: 'collection', previewItemId: itemId, returnTo: 'profile' })}
          />
          </>
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

            <SettingSection title="冒險預算" eyebrow="Budget">
              <label className="onboarding-budget"><span>每日可用預算 NT$<small className="block">今日已有紀錄時，調整從明天生效</small></span><input aria-label="調整每日預算" inputMode="decimal" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} /></label>
              <button className="journal-primary" onClick={saveBudget}>儲存預算</button>
            </SettingSection>
            <SettingSection title="資料與同步" eyebrow="Privacy">
              {user?.isLocal ? <SettingRow label="同步狀態" value="本機存檔" note="資料保存在這個瀏覽器，重新整理仍會保留；尚未同步至雲端。可下載備份。" /> : user?.isAnonymous ? (
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
                label="存檔內容"
                value="帳本與冒險"
                note="記帳明細、每日進度、任務、收藏與設定一起保存。"
              />
              <SettingRow
                label="匯出資料"
                value="JSON 備份"
                note="下載全部記帳明細、每日紀錄與遊戲進度。"
                action={<button className="academy-inline-action" disabled={exporting} onClick={downloadBackup}>{exporting ? '準備中' : '下載'}</button>}
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
                note="輕柔的學院旋律；開啟後點一下畫面開始，切到背景時暫停。"
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
                note="控制記帳成功與領取任務獎勵的短音效。"
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
