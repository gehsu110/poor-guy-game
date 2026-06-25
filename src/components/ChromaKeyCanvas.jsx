import { useEffect, useRef } from 'react'

/**
 * ChromaKeyCanvas
 * 播放影片並即時去掉指定顏色（預設純綠 #00FF00），讓角色浮在任何背景上。
 *
 * Props:
 *   src         : string  — 影片 URL（必須同源，否則 canvas 無法讀取像素）
 *   keyColor    : [r,g,b] — 要去掉的顏色，預設 [0, 255, 0]（純綠）
 *   threshold   : number  — 顏色容差距離（預設 90，越大去得越多）
 *   className   : string
 *   onClick     : () => void
 */
export default function ChromaKeyCanvas({
  src,
  keyColor = [0, 255, 0],
  threshold = 90,
  className = '',
  onClick,
}) {
  const canvasRef = useRef(null)
  const keyColorValue = keyColor.join(',')

  useEffect(() => {
    if (!src) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    // 建立隱藏 video element
    const video = document.createElement('video')
    video.src = src
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true
    // 本地同源資源不設 crossOrigin，避免 canvas 被 taint

    let rafId
    let inited = false
    const [kr, kg, kb] = keyColorValue.split(',').map(Number)
    const t2 = threshold * threshold  // 用距離平方，避免 sqrt

    function processFrame() {
      if (video.readyState >= 2) {
        if (!inited) {
          // 初始化 canvas 尺寸（依影片比例，寬度固定由 CSS 控制）
          canvas.width  = video.videoWidth  || 1280
          canvas.height = video.videoHeight || 720
          inited = true
        }

        // 清空到透明（防閃黑）
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 繪製當前幀
        ctx.drawImage(video, 0, 0)

        // 逐像素去背（try/catch 防止 tainted canvas SecurityError）
        try {
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = frame.data

          for (let i = 0; i < d.length; i += 4) {
            const dr = d[i]   - kr
            const dg = d[i+1] - kg
            const db = d[i+2] - kb
            if (dr*dr + dg*dg + db*db < t2) {
              d[i+3] = 0  // 設為透明
            }
          }

          ctx.putImageData(frame, 0, 0)
        } catch (e) {
          console.error('[ChromaKeyCanvas] getImageData 失敗:', e)
        }
      }

      rafId = requestAnimationFrame(processFrame)
    }

    video.play().catch(e => console.warn('[ChromaKeyCanvas] 影片播放失敗:', e))
    rafId = requestAnimationFrame(processFrame)

    return () => {
      cancelAnimationFrame(rafId)
      video.pause()
      video.src = ''
    }
  }, [src, threshold, keyColorValue])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={onClick}
    />
  )
}
