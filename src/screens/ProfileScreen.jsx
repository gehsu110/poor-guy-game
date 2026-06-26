import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { COLLECTIBLE_TITLES, DEFAULT_CATEGORIES, getTitle, TITLES, formatMoney } from '../gameLogic'
import { loginWithGoogle, updateProfile } from '../firebase'
import { BottomNav } from './TownScreen'
import Avatar from '../components/Avatar'
import { getOutfitAssets } from '../outfitAssets'
import profileBg from '../assets/academy-art/profile-bg.webp'
import LayeredCharacter from '../components/LayeredCharacter'
import { CHARACTER_ITEMS } from '../characterItems'

const WARDROBE = {
  set: [
    {
      id: 'academy_set',
      name: '星術學院套裝',
      desc: '預設主角造型',
      outfit: 'academy',
      accessory: 'star_pin',
      frame: 'soft_gold',
      owned: true,
    },
    // saving_hero_set 暫時隱藏（外觀與學院服重複，待製作獨立素材）
    {
      id: 'pink_magic_set',
      name: '粉晶禮服套裝',
      desc: '紫星直購造型',
      outfit: 'pink_robe',
      accessory: 'ribbon',
      frame: 'frame_ribbon',
      owned: true,   // 暫時解鎖測試用
    },
    {
      id: 'night_cape_set',
      name: '星夜斗篷套裝',
      desc: '扭蛋稀有造型',
      outfit: 'night_cape',
      accessory: 'crown',
      frame: 'moon',
      owned: true,   // 暫時解鎖測試用
    },
    {
      id: 'suit_set',
      name: '都市精英套裝',
      desc: '職場感限定套裝',
      outfit: 'suit',
      accessory: 'none',
      frame: 'soft_gold',
      owned: true,   // 暫時解鎖測試用
    },
    {
      id: 'summer_beach_set',
      name: '星潮海灘套裝',
      desc: '泳裝、貝殼髮飾與海灘主題場景',
      outfit: 'summer_beach',
      accessory: 'none',
      frame: 'crystal',
      owned: true,
    },
    {
      id: 'sakura_festival_set',
      name: '櫻燈祭典套裝',
      desc: '短髮盤辮、櫻扇、金魚袋與月下神社',
      outfit: 'sakura_festival',
      accessory: 'none',
      frame: 'moon',
      owned: true,
    },
    {
      id: 'rainy_detective_set',
      name: '雨夜偵探套裝',
      desc: '紫髮側辮、帳本燈與雨巷探案',
      outfit: 'rainy_detective',
      accessory: 'none',
      frame: 'crystal',
      owned: true,
    },
    {
      id: 'mint_supply_set',
      name: '薄荷補給套裝',
      desc: '黃星直購造型',
      outfit: 'mint_coat',
      accessory: 'star_pin',
      frame: 'crystal',
      owned: false,
    },
  ],
  outfit: [
    { id: 'academy',    name: '星術學院服', desc: '預設主角服裝', owned: true },
    // saving_hero 暫時隱藏，待製作獨立素材
    { id: 'pink_robe',  name: '粉晶禮服',   desc: '可愛柔粉風',   owned: true },  // 暫時解鎖
    { id: 'night_cape', name: '星夜斗篷',   desc: '扭蛋稀有服裝', owned: true },  // 暫時解鎖
    { id: 'suit',       name: '都市精英套裝',desc: '職場感套裝',   owned: true },  // 暫時解鎖
    { id: 'summer_beach', name: '星潮海灘裝', desc: '貝殼水手夏日造型', owned: true },
    { id: 'sakura_festival', name: '櫻燈祭典裝', desc: '月下和風祭典造型', owned: true },
    { id: 'rainy_detective', name: '雨夜偵探裝', desc: '帳本燈與透明雨衣', owned: true },
    { id: 'mint_coat',  name: '薄荷外套',   desc: '清爽補給色',   owned: false },
  ],
  accessory: [
    { id: 'none',     name: '不戴頭飾',   desc: '乾淨頭像',       owned: true },
    { id: 'star_pin', name: '星星髮夾',   desc: '亮晶晶小標記',   owned: true },
    { id: 'ribbon',   name: '粉色緞帶',   desc: '更可愛的感覺',   owned: true },
    { id: 'crown',    name: '勇者小冠',   desc: '月底挑戰感',     owned: false },
  ],
  frame: [
    { id: 'soft_gold', name: '柔金頭像框', desc: '預設邊框',       owned: true },
    { id: 'ribbon',    name: '緞帶頭像框', desc: '粉色收藏框',     owned: true },
    { id: 'moon',      name: '夜櫻頭像框', desc: '祭典感外框',     owned: true },
    { id: 'crystal',   name: '冰晶頭像框', desc: '紫星直購預覽',   owned: false },
  ],
  reward: [
    { ...CHARACTER_ITEMS.ledger_book, owned: true, testLabel: '30 筆記帳任務' },
    { ...CHARACTER_ITEMS.budget_wand, owned: true, testLabel: '守預算 7 天' },
    { ...CHARACTER_ITEMS.saving_crown, owned: true, testLabel: '月度 S 評級' },
  ],
}

const WARDROBE_CATS = [
  { key: 'set', label: '套裝' },
  { key: 'outfit', label: '服裝' },
  { key: 'accessory', label: '頭飾' },
  { key: 'frame', label: '頭像框' },
  { key: 'reward', label: '獎勵' },
]

const DEFAULT_EQUIPPED = { outfit: 'academy', accessory: 'star_pin', frame: 'soft_gold' }

/** 顯示套裝縮圖：優先用真實生成圖，沒有則 fallback 到 Avatar 元件 */
function OutfitPreview({ gender, outfitId, className }) {
  const { image } = getOutfitAssets(outfitId, gender)
  if (image) {
    return <img src={image} alt="" className={className} style={{ objectFit: 'contain' }} />
  }
  return <Avatar gender={gender} variant="full" outfit={outfitId} className={className} />
}

function ModularPreview({ gender, outfitId, equipped, className }) {
  const { image } = getOutfitAssets(outfitId, gender)
  if (!image) return <OutfitPreview gender={gender} outfitId={outfitId} className={className} />
  return <LayeredCharacter gender={gender} equipped={equipped} baseAsset={image} className={className} />
}

function WardrobePanel({ avatarGender, equipped, activeSet, collectionIds, onEquipSet, onEquipCosmetic }) {
  const [cat, setCat] = useState('set')

  return (
    <div className="flex flex-col gap-3">
      <div className="academy-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-black text-[#26324A]">目前造型</div>
          <span className="academy-status">{activeSet?.name ?? '自訂搭配'}</span>
        </div>
        <div className="flex items-center gap-3">
          <ModularPreview
            gender={avatarGender}
            outfitId={equipped.outfit ?? 'academy'}
            equipped={equipped}
            className="academy-wardrobe-hero"
          />
          <div className="min-w-0 flex-1 text-xs font-bold leading-6 text-[#8E87A8]">
            <div>服裝：{WARDROBE.outfit.find(i => i.id === (equipped.outfit ?? 'academy'))?.name}</div>
            <div>頭飾：{WARDROBE.accessory.find(i => i.id === (equipped.accessory ?? 'star_pin'))?.name}</div>
            <div>頭像框：{WARDROBE.frame.find(i => i.id === (equipped.frame ?? 'soft_gold'))?.name}</div>
            <div>左手：{CHARACTER_ITEMS[equipped.handLeft]?.name ?? '無'}</div>
            <div>右手：{CHARACTER_ITEMS[equipped.handRight]?.name ?? '無'}</div>
          </div>
        </div>
        {avatarGender === 'girl' && (
          <div className="academy-layered-preview-note">
            獎勵物件目前為衣櫃定位預覽；首頁動畫將在角色骨架分層完成後啟用。
          </div>
        )}
      </div>

      <div className="academy-card">
        <div className="academy-wardrobe-cats mb-3">
          {WARDROBE_CATS.map(c => (
            <button
              key={c.key}
              className={`academy-wardrobe-cat-btn ${cat === c.key ? 'is-active' : ''}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {cat === 'set' && (
          <div className="grid grid-cols-2 gap-2">
            {WARDROBE.set.map(set => {
              const owned = set.owned || collectionIds.has(set.id) || collectionIds.has(set.outfit)
              const active = activeSet?.id === set.id
              return (
                <button
                  key={set.id}
                  className={`academy-outfit-set ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}`}
                  onClick={() => owned && onEquipSet(set)}
                >
                  <OutfitPreview
                    gender={avatarGender}
                    outfitId={set.outfit}
                    className="academy-outfit-set__avatar"
                  />
                  <b>{set.name}</b>
                  <small>{owned ? set.desc : '未解鎖'}</small>
                </button>
              )
            })}
          </div>
        )}

        {cat === 'outfit' && (
          <div className="grid grid-cols-2 gap-2">
            {WARDROBE.outfit.map(item => {
              const owned = item.owned || collectionIds.has(item.id)
              const active = (equipped.outfit ?? 'academy') === item.id
              return (
                <button
                  key={item.id}
                  className={`academy-outfit-set ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}`}
                  onClick={() => owned && onEquipCosmetic('outfit', item.id)}
                >
                  <OutfitPreview
                    gender={avatarGender}
                    outfitId={item.id}
                    className="academy-outfit-set__avatar"
                  />
                  <b>{item.name}</b>
                  <small>{owned ? item.desc : '未解鎖'}</small>
                </button>
              )
            })}
          </div>
        )}

        {['accessory', 'frame'].includes(cat) && (
          <div className="grid grid-cols-2 gap-2">
            {WARDROBE[cat].map(item => {
              const owned = item.owned || collectionIds.has(item.id)
              const defaultVal = DEFAULT_EQUIPPED[cat]
              const active = (equipped[cat] ?? defaultVal) === item.id
              return (
                <button
                  key={item.id}
                  className={`academy-wardrobe-item ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}`}
                  onClick={() => owned && onEquipCosmetic(cat, item.id)}
                >
                  <span className={`academy-wardrobe-swatch academy-wardrobe-swatch--${item.id}`} />
                  <b>{item.name}</b>
                  <small>{owned ? item.desc : '未解鎖'}</small>
                </button>
              )
            })}
          </div>
        )}

        {cat === 'reward' && (
          <div className="grid grid-cols-2 gap-2">
            {WARDROBE.reward.map(item => {
              const active = equipped[item.slot] === item.id
              const owned = item.owned || collectionIds.has(item.id)
              return (
                <button
                  key={item.id}
                  className={`academy-reward-item ${active ? 'is-active' : ''} ${owned ? '' : 'is-locked'}`}
                  onClick={() => owned && onEquipCosmetic(item.slot, active ? 'none' : item.id)}
                >
                  <img src={item.girlAsset} alt="" draggable="false" />
                  <b>{item.name}</b>
                  <small>{active ? '點擊卸下' : item.testLabel}</small>
                </button>
              )
            })}
          </div>
        )}
      </div>
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

export default function ProfileScreen() {
  const { state, dispatch, navigate } = useApp()
  const { profile, user } = state
  const [tab, setTab] = useState('stats')
  const [editBudget, setEditBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(profile?.dailyBudget ?? 1000))
  const [editName, setEditName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.playerName ?? '窮鬼勇者')
  const [customName, setCustomName] = useState('')
  const [customColor, setCustomColor] = useState('#C8A8E9')

  const level = profile?.level ?? 1
  const expInLevel = profile?.expInLevel ?? 0
  const expToNext = profile?.expToNext ?? 100
  const title = getTitle(level)
  const equippedTitle = COLLECTIBLE_TITLES[profile?.equipped?.title]
  const equipped = profile?.equipped ?? {}
  const collectionIds = new Set((profile?.collection ?? []).map(item => item.id))
  const avatarGender = profile?.avatarGender ?? 'girl'
  const playerName = profile?.playerName?.trim() || '窮鬼勇者'
  const activeSet = WARDROBE.set.find(set => (
    (equipped.outfit ?? 'academy') === set.outfit &&
    (equipped.accessory ?? 'star_pin') === set.accessory &&
    (equipped.frame ?? 'soft_gold') === set.frame
  ))

  async function handleGoogleLink() {
    try {
      await loginWithGoogle()
    } catch (e) {
      console.error(e)
    }
  }

  async function saveBudget() {
    const val = Number(budgetInput)
    if (!val || val < 100) return
    dispatch({ type: 'UPDATE_PROFILE', data: { dailyBudget: val } })
    setEditBudget(false)
    if (user) {
      try {
        await updateProfile(user.uid, { dailyBudget: val })
      } catch (e) {
        console.error(e)
      }
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
    dispatch({ type: 'UPDATE_PROFILE', data: { avatarGender: gender } })
    if (user) {
      try {
        await updateProfile(user.uid, { avatarGender: gender })
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function equipCosmetic(slot, itemId) {
    const data = { equipped: { ...equipped, [slot]: itemId } }
    dispatch({ type: 'UPDATE_PROFILE', data })
    if (user) {
      try {
        await updateProfile(user.uid, data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function equipSet(set) {
    const data = {
      equipped: {
        ...equipped,
        outfit: set.outfit,
        accessory: set.accessory,
        frame: set.frame,
        set: set.id,
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

  async function saveCategories(nextCategories) {
    dispatch({ type: 'UPDATE_PROFILE', data: { customCategories: nextCategories } })
    if (user) {
      try {
        await updateProfile(user.uid, { customCategories: nextCategories })
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function addCustomCategory() {
    const label = customName.trim().slice(0, 6)
    if (!label) return
    const usedLabels = new Set([...DEFAULT_CATEGORIES, ...(profile?.customCategories ?? [])].map(c => c.label))
    if (usedLabels.has(label)) {
      dispatch({ type: 'SET_NOTIFICATION', notification: { type: 'profile', message: '這個分類已經存在' } })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 1800)
      return
    }
    const nextCategories = [
      ...(profile?.customCategories ?? []),
      {
        id: `custom_${Date.now()}`,
        label,
        iconKey: 'custom',
        color: customColor,
      },
    ]
    setCustomName('')
    await saveCategories(nextCategories)
  }

  async function deleteCustomCategory(categoryId) {
    const nextCategories = (profile?.customCategories ?? []).filter(c => c.id !== categoryId)
    await saveCategories(nextCategories)
  }

  return (
    <div className="academy-screen">
      <img src={profileBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />

      <div className="relative z-10 flex items-center gap-2 px-4 pb-2 pt-4">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1 text-center text-sm font-black text-[#26324A]">我的成長</div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-card mb-3 text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <Avatar
              gender={avatarGender}
              variant="bust"
              frame={equipped.frame ?? 'soft_gold'}
              outfit={equipped.outfit ?? 'academy'}
              accessory={equipped.accessory ?? 'star_pin'}
              className="academy-profile-avatar"
            />
          </div>
          <div className="text-base font-black text-[#26324A]">{playerName}</div>
          <div className="text-xs font-bold text-[#8E87A8]">稱號：{equippedTitle ?? title.name}</div>
          <div className="text-[10px] font-bold text-[#8E87A8]">{title.desc}</div>
          <div className="mx-auto mt-2 w-52">
            <ExpBar expInLevel={expInLevel} expToNext={expToNext} />
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
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
        </div>

        <div className="academy-tabs mb-3">
          {[
            { k: 'stats', label: '狀態' },
            { k: 'titles', label: '稱號' },
            { k: 'wardrobe', label: '衣櫃' },
            { k: 'settings', label: '設定' },
          ].map(t => (
            <button key={t.k} className={tab === t.k ? 'is-active' : ''} onClick={() => setTab(t.k)}>
              {t.label}
            </button>
          ))}
        </div>

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
            avatarGender={avatarGender}
            equipped={equipped}
            activeSet={activeSet}
            collectionIds={collectionIds}
            onEquipSet={equipSet}
            onEquipCosmetic={equipCosmetic}
          />
        )}

        {tab === 'settings' && (
          <div className="flex flex-col gap-3">
            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">玩家名稱</div>
              {editName ? (
                <div className="flex gap-2">
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
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#26324A]">{playerName}</span>
                  <button className="text-xs font-black text-[#8B7CFF]" onClick={() => {
                    setNameInput(playerName)
                    setEditName(true)
                  }}>修改</button>
                </div>
              )}
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">主角外觀</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: 'boy', label: '男主角' },
                  { k: 'girl', label: '女主角' },
                ].map(a => (
                  <button
                    key={a.k}
                    className={`academy-avatar-option ${avatarGender === a.k ? 'is-active' : ''}`}
                    onClick={() => chooseAvatar(a.k)}
                  >
                    <Avatar
                      gender={a.k}
                      variant="full"
                      frame={equipped.frame ?? 'soft_gold'}
                      outfit={equipped.outfit ?? 'academy'}
                      accessory={equipped.accessory ?? 'star_pin'}
                      className="academy-avatar-choice"
                    />
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">每日預算</div>
              {editBudget ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="min-w-0 flex-1 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
                  />
                  <button className="academy-small-button" onClick={saveBudget}>儲存</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#26324A]">NT${formatMoney(profile?.dailyBudget ?? 1000)}</span>
                  <button className="text-xs font-black text-[#8B7CFF]" onClick={() => setEditBudget(true)}>修改</button>
                </div>
              )}
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">新手教學</div>
              <div className="mb-3 text-xs font-bold leading-5 text-[#8E87A8]">
                重新查看今日、地圖、任務、補給、公會與設定入口說明。
              </div>
              <button className="academy-small-button w-full" onClick={replayOnboarding}>重新觀看教學</button>
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">自訂記帳分類</div>
              <div className="mb-3 grid grid-cols-6 gap-2">
                {['#FFB3C6', '#A8D8EA', '#C8A8E9', '#A8E6CF', '#FFE4A0', '#FFCBA4'].map(color => (
                  <button
                    key={color}
                    className={`academy-color-swatch ${customColor === color ? 'is-active' : ''}`}
                    style={{ background: color }}
                    aria-label={color}
                    onClick={() => setCustomColor(color)}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-[#E7DEF6] bg-white px-3 py-2 text-sm font-bold outline-none"
                  placeholder="例如：飲料、寵物"
                  maxLength={6}
                />
                <button className="academy-small-button" onClick={addCustomCategory}>新增</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile?.customCategories ?? []).length === 0 ? (
                  <div className="w-full rounded-2xl bg-white/70 px-3 py-3 text-center text-xs font-bold text-[#8E87A8]">
                    目前使用系統預設分類
                  </div>
                ) : (profile?.customCategories ?? []).map(cat => (
                  <div key={cat.id} className="academy-category-chip">
                    <span style={{ background: cat.color }} />
                    <b>{cat.label}</b>
                    <button onClick={() => deleteCustomCategory(cat.id)}>刪除</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="academy-card">
              <div className="mb-3 text-xs font-black text-[#26324A]">帳號</div>
              {user?.isAnonymous ? (
                <div>
                  <div className="mb-2 text-xs font-bold text-[#8E87A8]">目前使用匿名登入，綁定雲端帳號可保存進度</div>
                  <button className="academy-small-button w-full" onClick={handleGoogleLink}>
                    綁定雲端帳號
                  </button>
                </div>
              ) : (
                <div className="text-xs font-bold text-[#8E87A8]">{user?.email ?? user?.displayName ?? '已登入'}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav current="profile" navigate={navigate} />
    </div>
  )
}
