import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * SpriteCharacter — 多幀 idle 動畫組件（ping-pong 無縫循環）
 *
 * Props:
 *   frames      : string[]   — 透明 PNG 的 URL / import 陣列（順序即播放順序）
 *   fps         : number     — 每秒幾幀（預設 6）
 *   blinkFrames : number[]   — 哪幾個 index 屬於眨眼幀（間歇性插入，預設 []）
 *   blinkSrc    : string     — 整張眨眼替換圖（紙娃娃 pipeline：同圖局部編輯，換 src 即眨眼）
 *   tapSrc      : string     — 整張點擊表情替換圖（點角色短暫顯示）
 *   blinkInterval: number   — 眨眼間隔毫秒（預設 3500）
 *   className   : string
 *   onClick     : () => void
 */
export default function SpriteCharacter({
  frames = [],
  fps = 6,
  blinkFrames = [],
  blinkSrc = null,
  tapSrc = null,
  blinkInterval = 3500,
  className = '',
  onClick,
}) {
  const [frameIdx, setFrameIdx] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isTapping, setIsTapping] = useState(false)
  const blinkRef  = useRef(null)
  const tapRef    = useRef(null)
  const blinkEndRef = useRef(null)
  const animRef   = useRef(null)
  const idxRef    = useRef(0)

  // ping-pong：[0,1,...,n-1, n-2,...,1] → 無縫往返，消除第 12→1 幀的硬跳
  const pingPongFrames = useMemo(() => {
    if (frames.length <= 2) return frames
    const forward  = frames
    const backward = frames.slice(1, -1).reverse()
    return [...forward, ...backward]
  }, [frames])

  // ── 主動畫 loop ──────────────────────────────────────────────
  useEffect(() => {
    if (pingPongFrames.length <= 1) return
    const ms = 1000 / fps

    animRef.current = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % pingPongFrames.length
      setFrameIdx(idxRef.current)
    }, ms)

    return () => clearInterval(animRef.current)
  }, [pingPongFrames, fps])

  // ── 眨眼（插入 blinkFrames，不打斷主 loop）──────────────────
  useEffect(() => {
    if (blinkFrames.length === 0 && !blinkSrc) return

    function scheduleBlink() {
      // 隨機 ±500ms 讓眨眼不規律
      const delay = blinkInterval + (Math.random() - 0.5) * 1000
      blinkRef.current = setTimeout(() => {
        setIsBlinking(true)
        blinkEndRef.current = setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, blinkSrc ? 150 : (blinkFrames.length * 1000) / fps + 80)
      }, delay)
    }

    scheduleBlink()
    return () => { clearTimeout(blinkRef.current); clearTimeout(blinkEndRef.current) }
  }, [blinkFrames, blinkSrc, blinkInterval, fps])

  useEffect(() => () => clearTimeout(tapRef.current), [])

  function handleClick(e) {
    if (tapSrc) {
      setIsTapping(true)
      clearTimeout(tapRef.current)
      tapRef.current = setTimeout(() => setIsTapping(false), 1400)
    }
    onClick?.(e)
  }

  if (frames.length === 0) return null

  // 優先級：點擊表情 > 眨眼 > 主 loop
  const visibleFrames = isBlinking && blinkFrames.length > 0 ? blinkFrames : null
  let src = visibleFrames
    ? frames[visibleFrames[frameIdx % visibleFrames.length]]
    : pingPongFrames[frameIdx]
  if (isBlinking && blinkSrc) src = blinkSrc
  if (isTapping && tapSrc) src = tapSrc

  return (
    <img
      src={src}
      alt=""
      draggable="false"
      className={className}
      onClick={handleClick}
      style={{ imageRendering: 'auto' }}
    />
  )
}
