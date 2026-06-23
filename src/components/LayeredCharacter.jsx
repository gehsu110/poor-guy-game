import { getEquippedLayers } from '../characterItems'

/**
 * 分層紙娃娃渲染器。
 * 所有圖層共用同一畫布與定位，之後接上任務獎勵資產即可即時換裝。
 */
export default function LayeredCharacter({
  gender = 'girl',
  equipped,
  baseAsset,
  className = '',
  onClick,
}) {
  const layers = getEquippedLayers(equipped, gender)

  return (
    <button
      type="button"
      className={`layered-character ${className}`}
      onClick={onClick}
      aria-label="角色造型"
    >
      {baseAsset && <img className="layered-character__layer" src={baseAsset} alt="" draggable="false" />}
      {layers.map(({ slot, item, asset }) => (
        <img
          key={`${slot}:${item.id}`}
          className="layered-character__layer"
          data-character-slot={slot}
          src={asset}
          alt=""
          draggable="false"
        />
      ))}
    </button>
  )
}
