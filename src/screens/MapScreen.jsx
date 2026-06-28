import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { DEFAULT_CATEGORIES, generateDayMonster, formatMoney } from '../gameLogic'
import { addExpense, getMonthDayRecords, getMonthExpenses, setDayRecord } from '../firebase'
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
  { key: 'academy', title: '第 1 週｜學院入口', sub: '建立記帳節奏，讓路線亮起來', tag: '啟程區', range: [1, 7], bg: zoneAcademy },
  { key: 'market', title: '第 2 週｜魔法市集', sub: '誘惑變多，檢查每天是否守住預算', tag: '誘惑區', range: [8, 14], bg: zoneMarket },
  { key: 'forest', title: '第 3 週｜帳本森林', sub: '花費開始累積，路線會留下戰鬥痕跡', tag: '迷霧區', range: [15, 21], bg: zoneForest },
  { key: 'boss', title: '第 4 週｜月底魔王城', sub: '月底壓力登場，準備面對大 Boss', tag: '月底壓力區', range: [22, 31], bg: zoneBoss },
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

export default function MapScreen() {
  const { state, navigate } = useApp()
  const { profile, date: todayDate, user } = state
  const budget = profile?.dailyBudget ?? 1000
  const [monthRecords, setMonthRecords] = useState({})
  const [monthExpenses, setMonthExpenses] = useState({})
  const [monthExpenseItems, setMonthExpenseItems] = useState([])
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
        setMonthExpenseItems(expenses)
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

  const [selected, setSelected] = useState(null)
  const [backfillAmount, setBackfillAmount] = useState('')
  const [backfillCategory, setBackfillCategory] = useState(DEFAULT_CATEGORIES[0]?.label ?? '其他')
  const [backfillNote, setBackfillNote] = useState('')
  const [savingBackfill, setSavingBackfill] = useState(false)
  const [showMapHelp, setShowMapHelp] = useState(false)

  const stats = useMemo(() => {
    const elapsedDays = days.filter(d => d.date <= todayDate)
    const recordedDays = elapsedDays.filter(d => (d.spent ?? 0) > 0)
    const totalSpent = monthExpenseItems.reduce((sum, e) => sum + Number(e.amount ?? 0), 0)
    const ratingCounts = elapsedDays.reduce((acc, d) => {
      const rating = d.record?.rating
      if (rating) acc[rating] = (acc[rating] ?? 0) + 1
      return acc
    }, {})
    return {
      killed: elapsedDays.filter(d => d.status === 'defeated').length,
      total: elapsedDays.length,
      recorded: recordedDays.length,
      noRecord: elapsedDays.filter(d => d.status === 'no_record').length,
      underBudget: recordedDays.filter(d => d.spent <= budget).length,
      totalSpent,
      avgSpent: recordedDays.length ? Math.round(totalSpent / recordedDays.length) : 0,
      ratingCounts,
    }
  }, [budget, days, monthExpenseItems, todayDate])

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
      const ref = await addExpense(user.uid, expense)
      await setDayRecord(user.uid, selected.date, {
        settled: true,
        backfilled: true,
        rewardScale: 0,
        spent: (selected.spent ?? 0) + amount,
        rewards: { yellow: 0, purple: 0, normalTicket: 0, goldTicket: 0, exp: 0 },
      })
      const nextItem = { ...expense, id: ref.id }
      setMonthExpenseItems(items => [...items, nextItem])
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
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-map-report mb-3">
          <div className="academy-map-report__head">
            <div>
              <div className="academy-map-report__title">本月戰報</div>
              <div className="academy-map-report__subtitle">記帳、預算、討伐進度</div>
            </div>
            <span className="academy-map-report__stamp">{stats.recorded}/{stats.total} 天</span>
          </div>
          <div className="academy-map-report__stats">
            <div className="academy-map-report__stat">
              <div>總消費</div>
              <strong>NT${formatMoney(stats.totalSpent)}</strong>
            </div>
            <div className="academy-map-report__stat">
              <div>日均</div>
              <strong>NT${formatMoney(stats.avgSpent)}</strong>
            </div>
            <div className="academy-map-report__stat academy-map-report__stat--safe">
              <div>預算內</div>
              <strong>{stats.underBudget} 天</strong>
            </div>
          </div>
          <div className="academy-map-report__ratings">
            {['S', 'A', 'B', 'C'].map(rating => (
              <div key={rating} className="academy-rating-chip">
                <b>{rating}</b>
                <span>{stats.ratingCounts[rating] ?? 0}</span>
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
            <section
              key={zone.key}
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
                <span>{zone.tag}</span>
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
