import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../useAppStore'
import { getPaperDollAssets } from '../paperDoll'
import PaperDollFigure from './PaperDollFigure'
import GameIcon from './GameIcon'
import { collectibleItem } from '../collectibleItems'
import { STORYBOOK_ART } from '../storybookAssets'


export function RewardChips({ reward = {} }) {
  return <div className="journal-rewards" aria-label="獎勵">
    {reward.exp > 0 && <span className="journal-exp">+{reward.exp} EXP</span>}
    {Object.entries({ yellow: 'coin-gold', purple: 'coin-purple', normalTicket: 'ticket-normal', goldTicket: 'ticket-gold' }).map(([key, icon]) => reward[key] > 0 && <span key={key} aria-label={`${{ yellow: '黃星', purple: '紫星', normalTicket: '一般券', goldTicket: '金券' }[key]} +${reward[key]}`}><GameIcon name={icon} /><b>+{reward[key]}</b></span>)}
    {reward.collectionItem && <span className="journal-rarity">{reward.collectionItem.rarity} 收藏</span>}
  </div>
}
export function CollectiblePreview({ part, appearance, className = '' }) {
  const item = collectibleItem(part)
  const assets = getPaperDollAssets({ ...appearance, action: 'stand', ...(part ? { [part[0]]: part[1] } : {}) })
  if (part?.[0] === 'storybook') return <div className={`journal-preview journal-preview--storybook ${className}`} style={{ backgroundImage: `url(${STORYBOOK_ART.courtyard})` }}><img className="journal-preview__collectible" src={STORYBOOK_ART[part[1]]} alt={item.name} draggable="false" /><span className="journal-preview__label">薄荷帳本 · {item.name}</span></div>
  return <div className={`journal-preview ${className}`} style={{ backgroundImage: `url(${assets.bg})` }}>
    <PaperDollFigure assets={assets} label={item ? `試穿：${item.name}` : '學院冒險者'} />
    {item && <span className="journal-preview__label">{item.name}</span>}
  </div>
}
export function RewardReveal() {
  const { state, dispatch, navigate } = useApp()
  const reveal = state.rewardReveal
  const closeRef = useRef(null)
  useEffect(() => {
    if (!reveal) return
    const previous = document.activeElement
    closeRef.current?.focus()
    return () => previous?.isConnected && previous.focus?.()
  }, [reveal])
  if (!reveal) return null
  const close = () => dispatch({ type: 'REVEAL', value: null })
  return createPortal(<div className="journal-modal" onKeyDown={event => {
    if (event.key === 'Escape') close()
    if (event.key === 'Tab') {
      const buttons = [...event.currentTarget.querySelectorAll('button')]
      if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus() }
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus() }
    }
  }}>
    <div className="journal-modal__shade" onClick={close} />
    <section className="journal-reveal" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <span className="journal-eyebrow">{reveal.rating ? 'DAILY REPORT' : 'A LITTLE PROGRESS, A NEW STORY'}</span>
      {reveal.part ? <CollectiblePreview part={reveal.part} appearance={state.profile?.equipped?.appearance} /> : <div className="journal-seal"><GameIcon name={reveal.rating ? 'tab-quest' : 'tab-supply'} /></div>}
      <h2 id="reward-title">{reveal.title}</h2>
      <p>{reveal.rating ? `${reveal.rating} 級評價・${reveal.defeated ? '討伐成功' : '每一筆紀錄都是進步'}` : '這份小小的成就，已經收進你的冒險。'}</p>
      {reveal.levelUp && <b className="journal-level-up">升級了！Lv.{reveal.levelUp}</b>}
      <RewardChips reward={reveal.reward} />
      <button ref={closeRef} className="journal-primary" onClick={() => { close(); if (reveal.part) navigate('profile', { tab: 'wardrobe' }) }}>{reveal.part ? '去造型頁裝備' : '收下，繼續冒險'}</button>
      {reveal.part && <button className="journal-text-button" onClick={close}>稍後再換裝</button>}
    </section>
  </div>, document.body)
}
