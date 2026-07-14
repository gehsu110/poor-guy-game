import avatars from '../assets/academy-art/avatars.png'

export default function Avatar({
  gender = 'girl',
  variant = 'portrait',
  frame = 'soft_gold',
  outfit = 'academy',
  accessory = 'none',
  src = null,
  layers = [],
  className = '',
}) {
  const behind = layers.filter(layer => layer.layer === 'back')
  const inFront = layers.filter(layer => layer.layer !== 'back')

  const renderLayer = layer => (
    <img
      key={`${layer.slot}:${layer.item.id}`}
      src={layer.asset}
      alt=""
      draggable="false"
      className="academy-avatar__paper-layer"
      data-paper-doll-slot={layer.slot}
    />
  )

  return (
    <div
      className={[
        'academy-avatar',
        src ? 'academy-avatar--custom' : '',
        `academy-avatar--${gender}`,
        `academy-avatar--${variant}`,
        `academy-avatar-frame--${frame}`,
        `academy-avatar-outfit--${outfit}`,
        `academy-avatar-accessory--${accessory}`,
        className,
      ].join(' ')}
    >
      {behind.map(renderLayer)}
      <img src={src ?? avatars} alt="" draggable="false" className="academy-avatar__base" />
      {inFront.map(renderLayer)}
    </div>
  )
}
