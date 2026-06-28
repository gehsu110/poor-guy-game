import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, generateDayMonster, formatMoney } from '../gameLogic'
import { addExpense, calcLevel, getMonthDayRecords, getMonthExpenses, setDayRecord, updateProfile } from '../firebase'
import monsterSprites from '../assets/academy-art/monster-sprites.png'
import zoneAcademy from '../assets/academy-art/map-zones/week1-academy.webp'
import zoneMarket from '../assets/academy-art/map-zones/week2-market.webp'
import zoneForest from '../assets/academy-art/map-zones/week3-forest.webp'
import zoneBoss from '../assets/academy-art/map-zones/week4-boss.webp'

// 節點狀態設定
const NODE_CONFIG = {
  defeated:  { label: '擊殺' },
  undefeated:{ label: '未滅' },
  no_record: { label: '未記' },
  today:     { label: '今日' },
  future:    { label: '未來' },
  boss:      { label: '首領' },
  monthboss: { label: '月底首領' },
}

const MAP_ZONES = [
  { key: 'academy', week: 1, title: '第 1 週｜學院入口', sub: '建立記帳節奏，讓路線亮起來', range: [1, 7], bg: zoneAcademy, reward: { exp: 80, yellow: 3, normalTicket: 1 } },
  { key: 'market', week: 2, title: '第 2 週｜魔法市集', sub: '誘惑變多，檢查每天是否守住預算', range: [8, 14], bg: zoneMarket, reward: { exp: 100, yellow: 4, normalTicket: 1 } },
  { key: 'forest', week: 3, title: '第 3 週｜帳本森林', sub: '花費開始累積，路線會留下戰鬥痕跡', range: [15, 21], bg: zoneForest, reward: { exp: 120, yellow: 5, purple: 1 } },
  { key: 'boss', week: 4, title: '第 4 週｜月底魔王城', sub: '月底壓力登場，準備面對大 Boss', range: [22, 31], bg: zoneBoss, reward: { exp: 160, yellow: 6, normalTicket: 2 } },
]

const MAP_LEGEND_ITEMS = [
  { cls: 'today', label: '今日位置', desc: '目前可以前往戰鬥與記帳的節點。' },
  { cls: 'defeated', label: '已擊殺', desc: '這一天有完成記帳並擊敗怪物。' },
  { cls: 'undefeated', label: '未滅', desc: '有花費紀錄，但怪物尚未被擊敗。' },
  { cls: 'no_record', label: '未記', desc: '過去日期尚未記帳，可補登但不發放完整獎勵。' },
  { cls: 'monthboss', label: '月底 Boss', desc: '月底壓力節點，代表月末挑戰。' },
]

function MapNode({ day, status, tier, spent = 0, onClick, isToday }) {
  const cfg = tier === 'monthboss' ? NODE_CONFIG.monthboss
    : tier !== 'normal' && tier !== 'normal_special' ? NODE_CONFIG.boss
    : NODE_CONFIG[status] ?? NODE_CONFIG.future

  const marker = tier === 'monthboss' ? 'monthboss'
    : tier !== 'normal' && tier !== 'normal_special' ? 'boss'
    : status
  const tierClass = tier === 'monthboss' ? 'academy-map-node--tier-monthboss'
    : tier !== 'normal' && tier !== 'normal_special' ? 'academy-map-node--tier-boss'
    : 'academy-map-node--tier-normal'
  const size = tier === 'monthboss' ? 'academy-map-node--large' : tier !== 'normal' ? 'academy-map-node--boss' : ''
  const isDim = status === 'future' || status === 'no_record'

  return (
    <motion.button
      className={`academy-map-node academy-map-node--${status} ${tierClass} ${size} ${isToday ? 'is-today' : ''} ${isDim ? 'is-dim' : ''}`}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      animate={isToday ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(200,168,233,0)', '0 0 0 8px rgba(200,168,233,0.4)', '0 0 0 0 rgba(200,168,233,0)'] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className={`academy-map-node__marker academy-map-node__marker--${marker}`} aria-hidden="true">
        <i />
      </span>
      {spent > 0 && <i className="academy-map-node__spent" />}
      <div className="academy-map-node__date">{day}</div>
      <span className="academy-map-node__suffix">{cfg.label}</span>
    </motion.button>
  )
}

// 將天數排列成蛇形路徑（每排 4 個，避免太像月曆）
function buildPath(days) {
  const rows = []
  const perRow = 4
  for (let i = 0; i < days.length; i += perRow) {
    const row = days.slice(i, i + perRow)
    rows.push(i % (perRow * 2) === 0 ? row : [...row].reverse())
  }
  return rows
}

function buildZones(days) {
  return MAP_ZONES.map(zone => {
    const [start, end] = zone.range
    const zoneDays = days.filter(d => d.day >= start && d.day <= end)
    return { ...zone, days: zoneDays, rows: buildPath(zoneDays) }
  }).filter(zone => zone.days.length)
}

function rewardText(reward = {}) {
  const parts = []
  if (reward.yellow) parts.push(`黃星 ${reward.yellow}`)
  if (reward.purple) parts.push(`紫星 ${reward.purple}`)
  if (reward.normalTicket) parts.push(`券 ${reward.normalTicket}`)
  if (reward.goldTicket) parts.push(`金券 ${reward.goldTicket}`)
  return parts.join('・') || 'EXP'
}

function buildWeekRewardState(zone, todayDate, claimedMissions) {
  const eligibleDays = zone.days.filter(day => day.date <= todayDate)
  const recorded = zone.days.filter(day => day.date <= todayDate && (day.spent ?? 0) > 0).length
  const target = zone.days.length
  const complete = zone.days.length > 0 && zone.days.every(day => day.date <= todayDate && (day.spent ?? 0) > 0)
  const claimKey = `map-week-${zone.week}-${zone.days[0]?.date ?? zone.key}`
  const claimed = !!claimedMissions?.[claimKey]
  const future = eligibleDays.length < target
  return {
    claimKey,
    complete,
    claimed,
    disabled: claimed || !complete,
    status: claimed ? 'claimed' : complete ? 'ready' : future ? 'future' : 'locked',
    label: claimed ? '已領' : complete ? '可領' : `${recorded}/${target}`,
    recorded,
    target,
  }
}

function WeekRewardButton({ rewardState, reward, onClaim }) {
  return (
    <button
      type="button"
      className={`academy-map-week-reward academy-map-week-reward--${rewardState.status}`}
      onClick={onClaim}
      disabled={rewardState.disabled}
      title={`任務獎勵：${rewardText(reward)}`}
    >
      <span>任務獎勵</span>
      <b>{rewardState.label}</b>
    </button>
  )
}

export default function MapScreen() {
  const { state, navigate, dispatch } = useApp()
  const { profile, date: todayDate, user } = state
  const budget = profile?.dailyBudget ?? 1000
  const [monthRecords, setMonthRecords] = useState({})
  const [monthExpenses, setMonthExpenses] = useState({})
  const [loadingMonth, setLoadingMonth] = useState(false)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const daysInMonth = new Date(year, month, 0).getDate()

  useEffect(() => {
    let alive = true
    async function loadMonth() {
      if (!user) return
      setLoadingMonth(true)
      try {
        const [records, expenses] = await Promise.all([
          getMonthDayRecords(user.uid, year, month),
          getMonthExpenses(user.uid, year, month),
        ])
        if (!alive) return
        setMonthRecords(Object.fromEntries(records.map(r => [r.date, r])))
        setMonthExpenses(expenses.reduce((acc, e) => {
          acc[e.date] = (acc[e.date] ?? 0) + Number(e.amount ?? 0)
          return acc
        }, {}))
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoadingMonth(false)
      }
    }
    loadMonth()
    return () => { alive = false }
  }, [user, year, month])

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const monster = generateDayMonster(dateStr, budget)
    const record = monthRecords[dateStr]
    const spent = monthExpenses[dateStr] ?? 0

    let status = 'future'
    if (record?.defeated) status = 'defeated'
    else if (dateStr === todayDate) status = 'today'
    else if (dateStr < todayDate) status = spent > 0 ? 'undefeated' : 'no_record'

    return { day: d, date: dateStr, status, tier: monster.tier, monster, spent, record }
  }), [budget, daysInMonth, month, monthExpenses, monthRecords, todayDate, year])

  const zones = buildZones(days)
  const currentZone = zones.find(zone => zone.days.some(day => day.date === todayDate)) ?? zones[0]
  const currentWeekReward = currentZone ? buildWeekRewardState(currentZone, todayDate, profile?.claimedMissions ?? {}) : null

  const [selected, setSelected] = useState(null)
  const [backfillAmount, setBackfillAmount] = useState('')
  const [backfillCategory, setBackfillCategory] = useState(DEFAULT_CATEGORIES[0]?.label ?? '其他')
  const [backfillNote, setBackfillNote] = useState('')
  const [savingBackfill, setSavingBackfill] = useState(false)
  const [showMapHelp, setShowMapHelp] = useState(false)
  const [claimingWeek, setClaimingWeek] = useState(null)
  const routeScrollRef = useRef(null)
  const zoneRefs = useRef({})
  const autoScrolledKeyRef = useRef(null)

  useEffect(() => {
    if (!currentZone || loadingMonth) return
    const key = `${year}-${month}-${currentZone.key}`
    if (autoScrolledKeyRef.current === key) return
    autoScrolledKeyRef.current = key
    window.setTimeout(() => {
      const container = routeScrollRef.current
      const target = zoneRefs.current[currentZone.key]
      if (!container || !target) return
      const containerTop = container.getBoundingClientRect().top
      const targetTop = target.getBoundingClientRect().top
      container.scrollTo({
        top: container.scrollTop + targetTop - containerTop - 12,
        behavior: 'smooth',
      })
    }, 180)
  }, [currentZone, loadingMonth, month, year])

  async function submitBackfill() {
    if (!user || !selected) return
    const amount = Number(backfillAmount)
    if (!amount || amount <= 0) return
    setSavingBackfill(true)
    try {
      const expense = {
        date: selected.date,
        amount,
        category: backfillCategory,
        note: backfillNote.trim() || '補登消費',
      }
      await addExpense(user.uid, expense)
      await setDayRecord(user.uid, selected.date, {
        settled: true,
        backfilled: true,
        rewardScale: 0,
        spent: (selected.spent ?? 0) + amount,
        rewards: { yellow: 0, purple: 0, normalTicket: 0, goldTicket: 0, exp: 0 },
      })
      setMonthExpenses(expenses => ({
        ...expenses,
        [selected.date]: (expenses[selected.date] ?? 0) + amount,
      }))
      setMonthRecords(records => ({
        ...records,
        [selected.date]: { ...(records[selected.date] ?? {}), backfilled: true, settled: true, spent: (selected.spent ?? 0) + amount },
      }))
      setSelected(node => node ? { ...node, spent: (node.spent ?? 0) + amount, record: { ...(node.record ?? {}), backfilled: true } } : node)
      setBackfillAmount('')
      setBackfillNote('')
    } catch (e) {
      console.error(e)
    } finally {
      setSavingBackfill(false)
    }
  }

  async function claimWeekReward(zone, rewardState) {
    if (!profile || rewardState.disabled || claimingWeek) return
    setClaimingWeek(rewardState.claimKey)
    const reward = zone.reward ?? {}
    const exp = (profile?.exp ?? 0) + (reward.exp ?? 0)
    const levelInfo = calcLevel(exp)
    const data = {
      exp,
      ...levelInfo,
      stars: {
        yellow: (profile?.stars?.yellow ?? 0) + (reward.yellow ?? 0),
        purple: (profile?.stars?.purple ?? 0) + (reward.purple ?? 0),
      },
      tickets: {
        normal: (profile?.tickets?.normal ?? 0) + (reward.normalTicket ?? 0),
        gold: (profile?.tickets?.gold ?? 0) + (reward.goldTicket ?? 0),
      },
      claimedMissions: {
        ...(profile?.claimedMissions ?? {}),
        [rewardState.claimKey]: true,
      },
    }

    try {
      if (user) await updateProfile(user.uid, data)
      dispatch({ type: 'UPDATE_PROFILE', data })
      dispatch({
        type: 'SET_NOTIFICATION',
        notification: { type: 'mission', message: `第 ${zone.week} 週任務獎勵已領取` },
      })
      setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', notification: null }), 2600)
    } catch (e) {
      console.error(e)
    } finally {
      setClaimingWeek(null)
    }
  }

  return (
    <div className="academy-screen academy-screen--map" style={{ '--monster-sprites': `url(${monsterSprites})` }}>
      <div className="academy-bg academy-map-bg" aria-hidden="true" />
      <div className="academy-bg-soft" />
      {/* 頂部 */}
      <div className="academy-safe-top relative z-10 flex items-center px-4 pb-2 gap-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1">
          <div className="text-sm font-black text-[#26324A]">本月遠征路線</div>
          <div className="text-xs font-bold text-[#8E87A8]">{year}年{month}月</div>
        </div>
        <button
          className="academy-map-help-button"
          onClick={() => setShowMapHelp(true)}
          aria-label="查看地圖節點說明"
        >
          ?
        </button>
      </div>

      {/* 地圖主體 */}
      <div ref={routeScrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-map-report mb-3">
          <div className="academy-map-report__head">
            <div>
              <div className="academy-map-report__title">本週戰報</div>
              <div className="academy-map-report__subtitle">每日路線、週任務獎勵</div>
            </div>
            <span className="academy-map-report__stamp">{currentWeekReward?.recorded ?? 0}/{currentWeekReward?.target ?? 7} 天</span>
          </div>
          <div className="academy-map-report__stats">
            <div className="academy-map-report__stat">
              <div>今日位置</div>
              <strong>{Number(todayDate.slice(-2))} 日</strong>
            </div>
            <div className="academy-map-report__stat">
              <div>本週記帳</div>
              <strong>{currentWeekReward?.recorded ?? 0} 天</strong>
            </div>
            <div className="academy-map-report__stat academy-map-report__stat--safe">
              <div>任務獎勵</div>
              <strong>{currentWeekReward?.claimed ? '已領' : currentWeekReward?.complete ? '可領' : '進行中'}</strong>
            </div>
          </div>
          <div className="academy-map-report__ratings">
            {[
              { key: 'week', label: `第 ${currentZone?.week ?? '-'} 週`, value: currentZone?.title?.split('｜')[1] ?? '路線' },
              { key: 'recorded', label: '已記', value: `${currentWeekReward?.recorded ?? 0} 天` },
              { key: 'missing', label: '未亮', value: `${Math.max(0, (currentWeekReward?.target ?? 0) - (currentWeekReward?.recorded ?? 0))} 天` },
              { key: 'reward', label: '獎勵', value: currentWeekReward?.claimed ? '已領' : currentWeekReward?.complete ? '可領' : '待完成' },
            ].map(item => (
              <div key={item.key} className="academy-rating-chip">
                <b>{item.label}</b>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="academy-month-route">
          {loadingMonth && (
            <div className="absolute inset-x-8 top-3 rounded-full bg-white/82 px-3 py-1 text-center text-[10px] font-black text-[#8E87A8]">
              讀取遠征紀錄中
            </div>
          )}
          {zones.map(zone => (
            (() => {
              const rewardState = buildWeekRewardState(zone, todayDate, profile?.claimedMissions ?? {})
              return (
            <section
              key={zone.key}
              ref={node => {
                if (node) zoneRefs.current[zone.key] = node
              }}
              className={`academy-map-zone academy-map-zone--${zone.key}`}
              style={{ '--zone-image': `url(${zone.bg})` }}
            >
              {zone.key === 'boss' && (
                <div className="academy-map-zone__boss-atmosphere" aria-hidden="true">
                  <span className="academy-map-boss-cloud academy-map-boss-cloud--one" />
                  <span className="academy-map-boss-cloud academy-map-boss-cloud--two" />
                  <span className="academy-map-boss-gate-glow" />
                  <span className="academy-map-boss-path-glow" />
                </div>
              )}
              <div className="academy-map-zone__head">
                <div>
                  <strong>{zone.title}</strong>
                  <small>{zone.sub}</small>
                </div>
                <WeekRewardButton
                  rewardState={{ ...rewardState, disabled: rewardState.disabled || claimingWeek === rewardState.claimKey }}
                  reward={zone.reward}
                  onClaim={() => claimWeekReward(zone, rewardState)}
                />
              </div>
              <div className={`academy-map-card academy-map-card--${zone.key} flex flex-col gap-8 py-5`}>
                {zone.rows.map((row, ri) => (
                  <div key={`${zone.key}-${ri}`} className="academy-map-row">
                    <div className="academy-map-line" />
                    {ri < zone.rows.length - 1 && (
                      <div className={`academy-map-turn ${ri % 2 === 0 ? 'academy-map-turn--right' : 'academy-map-turn--left'}`} />
                    )}
                    {row.map(node => (
                      <MapNode
                        key={node.day}
                        {...node}
                        isToday={node.date === todayDate}
                        onClick={() => setSelected(node)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
              )
            })()
          ))}
        </div>
      </div>

      {/* 選中節點詳情 */}
      {selected && (
        <motion.div
          className="absolute bottom-20 left-3 right-3 academy-card z-30"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0">
              <div className="font-black text-[#26324A]">{selected.monster.name}</div>
              <div className="text-xs font-bold text-[#8E87A8]">{selected.date}</div>
            </div>
            <span className={`academy-monster-sprite academy-monster-sprite--${selected.monster.id} academy-map-monster-preview`} />
            <button className="text-[#8E87A8] text-lg tap-bounce" onClick={() => setSelected(null)}>×</button>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="academy-stat-box flex-1 text-center">
              <div className="text-[#8E87A8]">怪物血量</div>
              <div className="font-bold text-[#26324A]">NT${formatMoney(selected.monster.maxHp)}</div>
            </div>
            <div className="academy-stat-box flex-1 text-center">
              <div className="text-[#8E87A8]">已記帳</div>
              <div className="font-bold text-[#26324A]">NT${formatMoney(selected.spent ?? 0)}</div>
            </div>
            <div className="academy-stat-box flex-1 text-center">
              <div className="text-[#8E87A8]">狀態</div>
              <div className={`font-bold ${selected.status === 'defeated' ? 'text-green-500' : 'text-slate-700'}`}>
                {NODE_CONFIG[selected.status]?.label ?? '未知'}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="academy-stat-box text-center">
              <div className="text-[#8E87A8]">評級</div>
              <div className="font-black text-[#7B63D8]">{selected.record?.rating ?? '-'}</div>
            </div>
            <div className="academy-stat-box text-center">
              <div className="text-[#8E87A8]">最後一擊</div>
              <div className="font-bold text-[#26324A]">NT${formatMoney(selected.record?.finalDamage ?? 0)}</div>
            </div>
            <div className="academy-stat-box text-center">
              <div className="text-[#8E87A8]">扭蛋券</div>
              <div className="font-bold text-[#26324A]">{(selected.record?.rewards?.normalTicket ?? 0) + (selected.record?.rewards?.goldTicket ?? 0)}</div>
            </div>
          </div>
          {selected.date === todayDate && (
            <button
              className="academy-small-button mt-3 w-full"
              onClick={() => { setSelected(null); navigate('battle') }}
            >
              前往今日討伐
            </button>
          )}
          {selected.date < todayDate && selected.status === 'no_record' && (
            <div className="academy-backfill-panel">
              <div className="academy-backfill-panel__title">
                <b>補登這一天</b>
                <span>補登只修正歷史資料，不重新發放當日獎勵。</span>
              </div>
              <div className="academy-backfill-row">
                <select value={backfillCategory} onChange={e => setBackfillCategory(e.target.value)}>
                  {DEFAULT_CATEGORIES.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                </select>
                <input
                  type="number"
                  value={backfillAmount}
                  onChange={e => setBackfillAmount(e.target.value)}
                  placeholder="金額"
                />
              </div>
              <input
                className="academy-backfill-note"
                value={backfillNote}
                onChange={e => setBackfillNote(e.target.value)}
                placeholder="備註，可留空"
              />
              <button className="academy-small-button mt-2 w-full" onClick={submitBackfill} disabled={savingBackfill}>
                {savingBackfill ? '補登中...' : '補登消費'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {showMapHelp && (
        <motion.div
          className="academy-map-help-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMapHelp(false)}
        >
          <motion.div
            className="academy-map-help-sheet__panel"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            onClick={event => event.stopPropagation()}
          >
            <div className="academy-map-help-sheet__head">
              <div>
                <b>地圖節點說明</b>
                <span>節點會依記帳與討伐進度改變。</span>
              </div>
              <button onClick={() => setShowMapHelp(false)} aria-label="關閉地圖說明">×</button>
            </div>
            <div className="academy-map-help-list">
              {MAP_LEGEND_ITEMS.map(item => (
                <div key={item.label} className="academy-map-help-item">
                  <div className="academy-map-legend">
                    <span className={`academy-map-legend__dot academy-map-legend__dot--${item.cls}`} />
                    <b>{item.label}</b>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="academy-map-help-note">完整新手導覽會在功能頁穩定後再補上。</div>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}
