import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * SpriteCharacter — 多幀 idle 動畫組件（ping-pong 無縫循環）
 *
 * Props:
 *   frames      : string[]   — 透明 PNG 的 URL / import 陣列（順序即播放順序）
 *   fps         : number     — 每秒幾幀（預設 6）
 *   blinkFrames : number[]   — 哪幾個 index 屬於眨眼幀（間歇性插入，預設 []）
 *   blinkInterval: number   — 眨眼間隔毫秒（預設 3500）
 *   className   : string
 *   onClick     : () => void
 */
export default function SpriteCharacter({
  frames = [],
  fps = 6,
  blinkFrames = [],
  blinkInterval = 3500,
  className = '',
  onClick,
}) {
  const [frameIdx, setFrameIdx] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const blinkRef  = useRef(null)
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
    if (blinkFrames.length === 0) return

    function scheduleBlink() {
      // 隨機 ±500ms 讓眨眼不規律
      const delay = blinkInterval + (Math.random() - 0.5) * 1000
      blinkRef.current = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, (blinkFrames.length * 1000) / fps + 80)
      }, delay)
    }

    scheduleBlink()
    return () => clearTimeout(blinkRef.current)
  }, [blinkFrames, blinkInterval, fps])

  if (frames.length === 0) return null

  // 眨眼期間改用 blinkFrames 系列
  const visibleFrames = isBlinking && blinkFrames.length > 0 ? blinkFrames : null
  const src = visibleFrames
    ? frames[visibleFrames[Math.floor((Date.now() / (1000 / fps)) % visibleFrames.length)]]
    : pingPongFrames[frameIdx]

  return (
    <img
      src={src}
      alt=""
      draggable="false"
      className={className}
      onClick={onClick}
      style={{ imageRendering: 'auto' }}
    />
  )
}
