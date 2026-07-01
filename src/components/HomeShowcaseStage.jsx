const THEME_VARIANTS = new Set(['academy', 'summer', 'sakura', 'qixi', 'rainy'])

function resolveTheme(theme) {
  return THEME_VARIANTS.has(theme) ? theme : 'academy'
}

export default function HomeShowcaseStage({ theme = 'academy', layer = 'back', compact = false }) {
  const resolvedTheme = resolveTheme(theme)
  return (
    <div
      className={[
        'home-showcase-stage',
        `home-showcase-stage--${resolvedTheme}`,
        `home-showcase-stage--${layer}`,
        compact ? 'home-showcase-stage--compact' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {layer === 'back' ? (
        <>
          <span className="home-showcase-stage__spotlight" />
          <span className="home-showcase-stage__floor-glow" />
          <span className="home-showcase-stage__prop home-showcase-stage__prop--book" />
          <span className="home-showcase-stage__prop home-showcase-stage__prop--crystal" />
          <span className="home-showcase-stage__prop home-showcase-stage__prop--cushion" />
          <span className="home-showcase-stage__pet-slot">
            <i className="home-showcase-stage__pet-body" />
            <i className="home-showcase-stage__pet-ear home-showcase-stage__pet-ear--left" />
            <i className="home-showcase-stage__pet-ear home-showcase-stage__pet-ear--right" />
            <i className="home-showcase-stage__pet-eye home-showcase-stage__pet-eye--left" />
            <i className="home-showcase-stage__pet-eye home-showcase-stage__pet-eye--right" />
            <i className="home-showcase-stage__pet-spark" />
          </span>
        </>
      ) : (
        <>
          <span className="home-showcase-stage__foreground home-showcase-stage__foreground--one" />
          <span className="home-showcase-stage__foreground home-showcase-stage__foreground--two" />
          <span className="home-showcase-stage__foreground home-showcase-stage__foreground--three" />
          <span className="home-showcase-stage__foreground home-showcase-stage__foreground--four" />
        </>
      )}
    </div>
  )
}
