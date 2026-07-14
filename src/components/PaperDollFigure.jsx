import SpriteCharacter from './SpriteCharacter'

function FigureLayer({ layer }) {
  return (
    <img
      src={layer.asset}
      alt=""
      draggable="false"
      className="paper-doll-figure__layer"
      data-paper-doll-slot={layer.slot}
    />
  )
}

/**
 * 紙娃娃共用渲染器：整張角色核心＋可自由混搭的透明外掛層。
 * 所有素材共用 896 × 1200 邏輯畫布，讓首頁、造型頁與商店預覽維持同一套對位。
 */
export default function PaperDollFigure({
  assets,
  animated = false,
  className = '',
  label = '目前角色造型',
}) {
  const {
    image,
    staticImage,
    blinkSrc,
    happySrc,
    layers = [],
  } = assets ?? {}
  const baseAsset = animated ? (image ?? staticImage) : (staticImage ?? image)
  const behind = layers.filter(layer => layer.layer === 'back')
  const inFront = layers.filter(layer => layer.layer !== 'back')

  return (
    <div className={`paper-doll-figure ${className}`} role="img" aria-label={label}>
      {behind.map(layer => <FigureLayer key={`${layer.slot}:${layer.item.id}`} layer={layer} />)}
      {animated && baseAsset ? (
        <SpriteCharacter
          frames={[baseAsset]}
          blinkSrc={blinkSrc}
          tapSrc={happySrc}
          fps={4}
          blinkInterval={3500}
          className="paper-doll-figure__base"
        />
      ) : baseAsset ? (
        <img src={baseAsset} alt="" draggable="false" className="paper-doll-figure__base" />
      ) : null}
      {inFront.map(layer => <FigureLayer key={`${layer.slot}:${layer.item.id}`} layer={layer} />)}
    </div>
  )
}
