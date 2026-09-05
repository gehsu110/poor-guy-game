import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { STORYBOOK_ART, STORYBOOK_OUTFIT_ART } from '../storybookAssets'

export default function StorybookActor({ className = '', reduced = false, interactive = false, successPulse, companion = false, outfit = 'mint', message = '今天也一起，寫下一點小小的進步。' }) {
  const systemReduced = useReducedMotion()
  const [greeting, setGreeting] = useState(0)
  const [loadedSource, setLoadedSource] = useState(null)
  const [visible, setVisible] = useState(!document.hidden)
  const timer = useRef(null)
  const serial = useRef(0)
  const quiet = reduced || systemReduced || !visible
  const art = STORYBOOK_OUTFIT_ART[outfit] ?? STORYBOOK_OUTFIT_ART.mint
  const motionSource = quiet ? null : greeting ? art.greet : art.idle
  const greet = useCallback(() => {
    clearTimeout(timer.current)
    setGreeting(++serial.current)
    timer.current = setTimeout(() => setGreeting(0), 5000)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!successPulse) return
    const start = setTimeout(greet, 0)
    return () => clearTimeout(start)
  }, [successPulse, greet])
  useEffect(() => {
    const change = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, [])
  const content = <>
    <span className="storybook-actor__shadow" aria-hidden="true" />
    <img className="storybook-actor__figure" style={{ visibility: quiet || loadedSource !== motionSource ? 'visible' : 'hidden' }} src={art.still} alt="薄荷帳本學徒" draggable="false" />
    {!quiet && <img key={`${outfit}:${greeting || 'idle'}`} className="storybook-actor__figure storybook-actor__motion" src={motionSource} onLoad={() => setLoadedSource(motionSource)} onError={() => setLoadedSource(null)} alt="薄荷帳本學徒動畫" draggable="false" />}
    {companion && <img className="storybook-actor__companion" src={STORYBOOK_ART.owl} alt="書頁小鴞" draggable="false" />}
    {greeting > 0 && <span className="storybook-actor__speech" role="status">{message}</span>}
  </>
  return interactive
    ? <button type="button" className={`storybook-actor ${className}`} onClick={greet} aria-label="和學徒打招呼">{content}</button>
    : <div className={`storybook-actor ${className}`}>{content}</div>
}
