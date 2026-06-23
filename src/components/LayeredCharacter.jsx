import { getEquippedLayers } from '../characterItems'
import SpriteCharacter from './SpriteCharacter'

/**
 * 分層紙娃娃渲染器。
 * 所有圖層共用同一畫布與定位，之後接上任務獎勵資產即可即時換裝。
 */
export default function LayeredCharacter({
  gender = 'girl',
  equipped,
  baseAsset,
  frames = [],
  fps = 4,
  className = '',
  onClick,
}) {
  const layers = getEquippedLayers(equipped, gender)
  const behind = layers.filter(({ slot }) => ['aura', 'back'].includes(slot))
  const inFront = layers.filter(({ slot }) => !['aura', 'back'].includes(slot))

  const renderLayer = ({ slot, item, asset }) => (
    <img
      key={`${slot}:${item.id}`}
      className="layered-character__layer"
      data-character-slot={slot}
      src={asset}
      alt=""
      draggable="false"
    />
  )

  return (
    <button
      type="button"
      className={`layered-character ${className}`}
      onClick={onClick}
      aria-label="角色造型"
    >
      {behind.map(renderLayer)}
      {frames.length > 0 ? (
        <SpriteCharacter frames={frames} fps={fps} className="layered-character__layer" />
      ) : baseAsset ? (
        <img className="layered-character__layer" src={baseAsset} alt="" draggable="false" />
      ) : null}
      {inFront.map(renderLayer)}
    </button>
  )
}
