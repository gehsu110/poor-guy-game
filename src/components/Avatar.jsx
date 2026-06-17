import avatars from '../assets/academy-art/avatars.png'

export default function Avatar({
  gender = 'girl',
  variant = 'portrait',
  frame = 'soft_gold',
  outfit = 'academy',
  accessory = 'none',
  className = '',
}) {
  return (
    <div
      className={[
        'academy-avatar',
        `academy-avatar--${gender}`,
        `academy-avatar--${variant}`,
        `academy-avatar-frame--${frame}`,
        `academy-avatar-outfit--${outfit}`,
        `academy-avatar-accessory--${accessory}`,
        className,
      ].join(' ')}
    >
      <img src={avatars} alt="" draggable="false" />
    </div>
  )
}
