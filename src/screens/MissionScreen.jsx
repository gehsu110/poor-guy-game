import { useState } from 'react'
import { useApp } from '../useAppStore'
import { buildMissions } from '../progression'
import { RewardChips, CollectiblePreview } from '../components/AdventureUI'
import { collectibleItem } from '../collectibleItems'
import GameIcon from '../components/GameIcon'
import StorybookActor from '../components/StorybookActor'
import { STORYBOOK_ART } from '../storybookAssets'

const DAILY_PROMPTS = ['把今天記清楚，就比昨天更了解自己。', '沒有花錢的日子，也值得留下一枚星章。', '不用完美，願意回來就是很好的開始。', '收集的不只是道具，也是照顧自己的日常。', '一頁一頁，讓小習慣長成你的冒險。', '今天的目標：如實記錄，留一點餘裕。', '讓帳本替你記住，那些很小卻重要的努力。']
function MissionRow({ mission, claimed, busy, claim, navigate }) {
  const done = !mission.planned && mission.progress >= mission.target
  return <article className={`journal-mission ${claimed ? 'is-claimed' : done ? 'is-ready' : ''}`}>
    <div className="journal-mission__icon"><GameIcon name={mission.icon ?? 'tab-quest'} /></div>
    <div className="journal-mission__copy"><h3>{mission.title}</h3><p>{mission.desc}</p><RewardChips reward={mission.reward} />
      {mission.target > 1 && <div className="journal-track" role="progressbar" aria-label={mission.title} aria-valuenow={mission.progress} aria-valuemin={0} aria-valuemax={mission.target}><i style={{ width: `${mission.progress / mission.target * 100}%` }} /></div>}
    </div>
    <button className={done && !claimed ? 'journal-claim' : 'journal-go'} disabled={busy || claimed || (!done && !mission.action)} onClick={() => done ? claim(mission.key) : navigate(mission.action, mission.params)}>{claimed ? '已領取' : mission.planned ? (mission.tag ?? '未開放') : done ? '領取' : mission.action ? '前往' : `${mission.progress}/${mission.target}`}</button>
  </article>
}
function CollectionJournal({ sets, state, claim, navigate }) {
  const claimed = state.profile.claimedMissions ?? {}
  const [filter, setFilter] = useState('all')
  const [series, setSeries] = useState('storybook')
  const seriesMissions = sets.journey.filter(m => m.part && (series === 'storybook' ? m.part[0] === 'storybook' : m.part[0] !== 'storybook'))
  const milestones = seriesMissions.filter(m => filter !== 'owned' || state.profile.collection?.some(item => item.id === m.reward.collectionItem.id))
  const ownedCount = seriesMissions.filter(m => state.profile.collection?.some(item => item.id === m.reward.collectionItem.id)).length
  return <>
    <div className="journal-section-title"><div><span className="journal-eyebrow">THE ACADEMY COLLECTION</span><h2>日常，會長出夥伴</h2></div><b>成長收藏 {ownedCount} / {seriesMissions.length}</b></div>
    <p className="journal-intro">每一位都能陪你站上主頁。累積記帳日就能遇見，中途休息也保留進度。</p>
    <nav className="journal-series-tabs" aria-label="收藏系列"><button aria-pressed={series === 'storybook'} onClick={() => setSeries('storybook')}>薄荷帳本</button><button aria-pressed={series === 'classic'} onClick={() => setSeries('classic')}>經典混搭</button></nav><div className="journal-filters" aria-label="收藏篩選"><button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>全部收藏</button><button aria-pressed={filter === 'owned'} onClick={() => setFilter('owned')}>已擁有</button></div>
    <div className="journal-collection-grid">{milestones.map(m => {
      const item = collectibleItem(m.part)
      const owned = state.profile.collection?.some(entry => entry.id === item.id)
      return <article className="journal-collectible" key={m.id}>
        <CollectiblePreview part={m.part} appearance={state.profile.equipped?.appearance} />
        <div className="journal-collectible__copy"><span className="journal-eyebrow">{item.rarity} · {m.part[0] === 'storybook' ? '薄荷帳本系列' : '經典混搭系列'}</span><h3>{item.name}</h3><p>{item.desc}</p>
          <span className="journal-acquire">{owned ? '已收藏・可在造型頁裝備' : `累積記帳 ${m.target} 天取得`}</span>
          <button className="journal-go" disabled={state.busy || (!owned && m.progress < m.target)} onClick={() => owned ? navigate('profile', { tab: 'wardrobe' }) : claim(m.key)}>{owned ? '去裝備' : claimed[m.key] ? '已領取' : m.progress >= m.target ? '迎接新夥伴' : `${m.progress} / ${m.target} 天`}</button>
        </div>
      </article>
    })}</div>
    {!milestones.length && <div className="journal-empty"><GameIcon name="tab-supply" /><h3>你的收藏故事，才剛開始</h3><p>累積記帳 3 天，就能遇見書頁小鴞。</p></div>}
    <button className="journal-link-row" onClick={() => navigate('profile', { tab: 'wardrobe' })}><GameIcon name="wardrobe" /><span><b>看看我的全部造型</b><small>自由混搭、寵物與其他已收藏配件</small></span><b>→</b></button>
  </>
}
export default function MissionScreen() {
  const { state, navigate, claimMission } = useApp()
  const [tab, setTab] = useState(state.screenParams.tab ?? 'daily')
  const sets = buildMissions(state)
  const claimed = state.profile.claimedMissions ?? {}
  const ready = [...sets.daily, ...sets.weekly, ...sets.journey, ...sets.achievements, ...sets.activities, sets.chest].filter(m => !m.planned && m.progress >= m.target && !claimed[m.key]).length
  const next = sets.journey.find(m => m.part && !state.profile.collection?.some(item => item.id === m.reward.collectionItem.id)) ?? sets.journey.at(-1)
  const dateLabel = new Date(`${state.date}T12:00:00`).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })
  return <div className="academy-screen journal-screen">
    <div className="journal-stars" aria-hidden="true" />
    <header className="academy-safe-top journal-header"><button className="academy-back" aria-label="回到今日" onClick={() => navigate('town')}>←</button><div><span className="journal-eyebrow">EXPENSE QUEST</span><h1>冒險手帳</h1></div><span className="journal-ready-count">{ready > 0 ? `${ready} 可領` : '慢慢來，也很好'}</span></header>
    <div className="journal-scroll">
      <section className="journal-cover journal-cover--storybook" style={{ '--cover-art': `url(${STORYBOOK_ART.courtyard})` }}><div className="journal-cover__copy"><span className="journal-eyebrow">{dateLabel}</span><h2>每一筆日常，<br />都通往新的相遇。</h2><p>{DAILY_PROMPTS[new Date(`${state.date}T12:00:00`).getDay()]}</p></div><StorybookActor outfit={state.profile.equipped?.storybookOutfit} className="journal-cover__actor" reduced={state.profile.preferences?.reduceMotion} />
        <div className="journal-cover__stats"><span><b>{sets.stats.totalDays}</b> 累積記帳日</span><span><b>{sets.stats.streak}</b> 連續天數</span><span><b>{state.profile.level}</b> 冒險等級</span></div>
      </section>
      <nav className="journal-tabs" aria-label="手帳分類">{[['daily','今日'],['weekly','本週'],['journey','成長'],['collection','圖鑑'],['activity','活動']].map(([key, label]) => <button key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>{label}{key === 'daily' && sets.chest.progress > 0 && <i>{sets.chest.progress}/3</i>}</button>)}</nav>
      {tab === 'daily' && <>
        <div className="journal-section-title"><div><span className="journal-eyebrow">TODAY’S LITTLE ADVENTURE</span><h2>今天的三件小事</h2></div><span>{sets.chest.progress}/3 完成</span></div>
        <div className="journal-missions">{sets.daily.map(m => <MissionRow key={m.id} mission={m} claimed={claimed[m.key]} busy={state.busy} claim={claimMission} navigate={navigate} />)}</div>
        <section className={`journal-chest ${sets.chest.progress === 3 ? 'is-ready' : ''}`}><div className="journal-chest__icon"><GameIcon name="tab-supply" /></div><div><h3>今日手帳禮</h3><p>{claimed[sets.chest.key] ? '今天的星章已收藏，明天再來寫下一頁。' : '完成三件小事，收下一份小小的獎勵。'}</p><RewardChips reward={sets.chest.reward} /></div><button className="journal-claim" disabled={state.busy || claimed[sets.chest.key] || sets.chest.progress < 3} onClick={() => claimMission(sets.chest.key)}>{claimed[sets.chest.key] ? '已收下' : sets.chest.progress === 3 ? '打開' : `${sets.chest.progress}/3`}</button></section>
        <button className="journal-next-encounter" onClick={() => setTab('collection')}><CollectiblePreview part={next.part} appearance={state.profile.equipped?.appearance} /><span><small>下一場相遇</small><b>{collectibleItem(next.part).name}</b><em>{Math.max(0, next.target - sets.stats.totalDays) ? `再記帳 ${Math.max(0, next.target - sets.stats.totalDays)} 天，就能加入收藏` : '記帳里程碑已達成'}</em><strong>查看收藏圖鑑 →</strong></span></button>
      </>}
      {tab === 'weekly' && <><div className="journal-section-title"><div><span className="journal-eyebrow">ONE WEEK, SEVEN FOOTPRINTS</span><h2>本週的星光足跡</h2></div><b>{sets.stats.weekDays}/7 天</b></div><p className="journal-intro">{sets.stats.week[0].slice(5)} — {sets.stats.week[6].slice(5)} · 以真實記帳日計算，零消費也算。</p><div className="journal-week">{sets.stats.week.map((date, index) => { const r = state.dayRecords[date]; const done = r?.recordedOnTime || (!r?.backfilled && (r?.spent > 0 || r?.noSpend)); return <div key={date} className={`${done ? 'is-done' : ''} ${date === state.date ? 'is-today' : ''}`}><span>{['一','二','三','四','五','六','日'][index]}</span><b>{done ? '✓' : date.slice(-2)}</b><small>{date === state.date ? '今天' : done ? '已記' : date > state.date ? '待啟程' : '休息'}</small></div> })}</div><div className="journal-missions">{sets.weekly.map(m => <MissionRow key={m.id} mission={m} claimed={claimed[m.key]} busy={state.busy} claim={claimMission} navigate={navigate} />)}</div><p className="journal-footnote">每週一開啟新旅程。週獎勵可在當週達標後領取；補登只修正帳本，不發放遊戲獎勵。</p></>}
      {tab === 'journey' && <><div className="journal-section-title"><div><span className="journal-eyebrow">YOUR STORY KEEPS GROWING</span><h2>把習慣，變成收藏</h2></div><b>{sets.stats.totalDays} 天</b></div><p className="journal-intro">沒有倒數，不用連續。每一個真實記帳日，都會留在這條路上。</p><div className="journal-journey">{sets.journey.map(m => <section className="journal-milestone" key={m.id}><span className="journal-milestone__day">DAY <b>{String(m.target).padStart(2,'0')}</b></span><MissionRow mission={m} claimed={claimed[m.key]} busy={state.busy} claim={claimMission} navigate={navigate} /></section>)}</div><div className="journal-section-title"><h2>成就紀念冊</h2></div><div className="journal-missions">{sets.achievements.map(m => <MissionRow key={m.id} mission={m} claimed={claimed[m.key]} busy={state.busy} claim={claimMission} navigate={navigate} />)}</div><div className="journal-growth"><GameIcon name="tab-quest" /><div><b>Lv.{state.profile.level} · {state.profile.title}</b><p>{state.profile.expToNext ? `距離下一級還有 ${state.profile.expToNext - state.profile.expInLevel} EXP` : '已達最高等級，冒險繼續。'}</p><div className="journal-track"><i style={{ width: `${state.profile.expToNext ? state.profile.expInLevel / state.profile.expToNext * 100 : 100}%` }} /></div></div></div></>}
      {tab === 'activity' && <><div className="journal-section-title"><div><span className="journal-eyebrow">SEASONAL MEMORIES</span><h2>學院節慶記事</h2></div></div><p className="journal-intro">節日收藏只在對應活動期間取得。已結束活動保留於記事中。</p><div className="journal-missions">{sets.activities.map(m => <MissionRow key={m.id} mission={m} claimed={claimed[m.key]} busy={state.busy} claim={claimMission} navigate={navigate} />)}</div></>}
      {tab === 'collection' && <CollectionJournal sets={sets} state={state} claim={claimMission} navigate={navigate} />}
      <footer className="journal-footer">把生活記好，讓冒險慢慢發生。<span>星光學院 · 冒險者手帳</span></footer>
    </div>
  </div>
}
