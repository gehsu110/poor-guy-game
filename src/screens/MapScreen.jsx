import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../useAppStore'
import { generateDayMonster, formatMoney } from '../gameLogic'
import { getMonthDayRecords, getMonthExpenses } from '../firebase'
import { BottomNav } from './TownScreen'
import mapBg from '../assets/academy-art/map-bg.webp'

// 節點狀態設定
const NODE_CONFIG = {
  defeated:  { bg: '#A8E6CF', border: '#69D2A8', icon: 'star', label: '擊殺' },
  undefeated:{ bg: '#FFE4A0', border: '#FFD060', icon: 'battle', label: '未滅' },
  no_record: { bg: '#F0F0F0', border: '#DDD', icon: 'unknown', label: '未記' },
  today:     { bg: '#C8A8E9', border: '#A87DE0', icon: 'battle', label: '今日' },
  future:    { bg: '#E8E8E8', border: '#CCC', icon: 'unknown', label: '未來' },
  boss:      { bg: '#FFB3C6', border: '#FF6B9D', icon: 'boss', label: 'Boss' },
  monthboss: { bg: '#C8A8E9', border: '#7B5EA7', icon: 'boss', label: '月Boss' },
}

function MapNode({ day, date, status, tier, spent = 0, onClick, isToday }) {
  const cfg = tier === 'monthboss' ? NODE_CONFIG.monthboss
    : tier !== 'normal' && tier !== 'normal_special' ? NODE_CONFIG.boss
    : NODE_CONFIG[status] ?? NODE_CONFIG.future

  const size = tier === 'monthboss' ? 'academy-map-node--large' : tier !== 'normal' ? 'academy-map-node--boss' : ''
  const isDim = status === 'future' || status === 'no_record'

  return (
    <motion.button
      className={`academy-map-node ${size} ${isToday ? 'is-today' : ''} ${isDim ? 'is-dim' : ''}`}
      style={{ '--node-bg': cfg.bg, '--node-border': cfg.border }}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      animate={isToday ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(200,168,233,0)', '0 0 0 8px rgba(200,168,233,0.4)', '0 0 0 0 rgba(200,168,233,0)'] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className={`academy-icon academy-icon--${cfg.icon}`} />
      {spent > 0 && <i className="academy-map-node__spent" />}
      <div className="academy-map-node__date">
        {day}日
      </div>
    </motion.button>
  )
}

// 將天數排列成蛇形路徑（每排 5 個）
function buildPath(days) {
  const rows = []
  const perRow = 5
  for (let i = 0; i < days.length; i += perRow) {
    const row = days.slice(i, i + perRow)
    rows.push(i % (perRow * 2) === 0 ? row : [...row].reverse())
  }
  return rows
}

export default function MapScreen() {
  const { state, navigate } = useApp()
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

  const rows = buildPath(days)

  const [selected, setSelected] = useState(null)

  const stats = {
    killed: days.filter(d => d.status === 'defeated').length,
    total: days.filter(d => d.date <= todayDate).length,
  }

  return (
    <div className="academy-screen">
      <img src={mapBg} alt="" className="academy-bg" draggable="false" />
      <div className="academy-bg-soft" />
      {/* 頂部 */}
      <div className="relative z-10 flex items-center px-4 pt-4 pb-2 gap-2">
        <button className="academy-back" onClick={() => navigate('town')}>←</button>
        <div className="flex-1">
          <div className="text-sm font-black text-[#26324A]">本月遠征路線</div>
          <div className="text-xs font-bold text-[#8E87A8]">{year}年{month}月</div>
        </div>
        <div className="academy-mini-stat academy-mini-stat--blue">
          <span className="font-black">{stats.killed}</span>
          <span className="text-[9px]">/{stats.total}天</span>
        </div>
      </div>

      {/* 圖例 */}
      <div className="relative z-10 flex gap-2 px-4 pb-2 overflow-x-auto">
        {[
          { color: '#A8E6CF', label: '擊殺' },
          { color: '#FFE4A0', label: '未滅' },
          { color: '#F0F0F0', label: '未記' },
          { color: '#C8A8E9', label: '今日' },
          { color: '#FFB3C6', label: 'Boss' },
          { color: '#E8E8E8', label: '未來' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 whitespace-nowrap">
            <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: color }} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* 地圖主體 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <div className="academy-card academy-map-card flex flex-col gap-8 py-6">
          {loadingMonth && (
            <div className="absolute inset-x-8 top-3 rounded-full bg-white/82 px-3 py-1 text-center text-[10px] font-black text-[#8E87A8]">
              讀取遠征紀錄中
            </div>
          )}
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-around items-center relative">
              {/* 連接線 */}
              <div className="academy-map-line" />
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
      </div>

      {/* 選中節點詳情 */}
      {selected && (
        <motion.div
          className="absolute bottom-20 left-3 right-3 academy-card z-30"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-black text-[#26324A]">{selected.monster.name}</div>
              <div className="text-xs font-bold text-[#8E87A8]">{selected.date}</div>
            </div>
            <button className="text-[#8E87A8] text-lg tap-bounce" onClick={() => setSelected(null)}>×</button>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="academy-stat-box flex-1 text-center">
              <div className="text-[#8E87A8]">怪物HP</div>
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
          {selected.date === todayDate && (
            <button
              className="academy-small-button mt-3 w-full"
              onClick={() => { setSelected(null); navigate('battle') }}
            >
              前往今日討伐
            </button>
          )}
        </motion.div>
      )}

      <BottomNav current="map" navigate={navigate} />
    </div>
  )
}
