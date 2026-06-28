import { useEffect, useState } from 'react'
import { getEquippedHomeEffects } from '../homeSceneEffects'

const AURA_PARTICLES = {
  academy_stardust: ['one', 'two', 'three', 'four', 'five'],
  sakura_petals: ['one', 'two', 'three', 'four'],
  qixi_star_threads: ['one', 'two', 'three', 'four'],
  rainy_afterglow: ['one', 'two', 'three', 'four', 'five'],
}

const SUCCESS_PARTICLES = {
  coin_spark_burst: ['one', 'two', 'three', 'four', 'five', 'six'],
  ticket_glow_burst: ['one', 'two', 'three', 'four'],
  star_confetti_burst: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
}

const GROUND_GLYPHS = ['A', 'R', 'M', 'E', 'S', 'Q', 'L', 'V']

export default function HomeSceneEffects({ theme = 'academy', equipped, successPulse }) {
  const effects = getEquippedHomeEffects(equipped, theme)
  const [burstKey, setBurstKey] = useState(null)
  const auraParticles = AURA_PARTICLES[effects.backgroundAura] ?? []
  const successParticles = SUCCESS_PARTICLES[effects.successEffect] ?? []

  useEffect(() => {
    if (!successPulse) return
    setBurstKey(successPulse)
    const timer = window.setTimeout(() => setBurstKey(null), 1100)
    return () => window.clearTimeout(timer)
  }, [successPulse])

  return (
    <div
      className="home-scene-effects"
      data-theme={theme}
      data-background-aura={effects.backgroundAura}
      data-ground-effect={effects.groundEffect}
      data-success-effect={effects.successEffect}
      aria-hidden="true"
    >
      <div className={`home-scene-aura home-scene-aura--${effects.backgroundAura}`}>
        {auraParticles.map(particle => (
          <i key={particle} className={`home-scene-aura__particle home-scene-aura__particle--${particle}`} />
        ))}
      </div>

      <div className={`home-scene-ground home-scene-ground--${effects.groundEffect}`}>
        <span className="home-scene-ground__core" />
        <span className="home-scene-ground__outer" />
        <span className="home-scene-ground__ring" />
        <span className="home-scene-ground__inner" />
        <span className="home-scene-ground__sigil home-scene-ground__sigil--one" />
        <span className="home-scene-ground__sigil home-scene-ground__sigil--two" />
        <span className="home-scene-ground__sigil home-scene-ground__sigil--three" />
        <span className="home-scene-ground__runes">
          {GROUND_GLYPHS.map((glyph, index) => (
            <b key={`${glyph}-${index}`} className={`home-scene-ground__glyph home-scene-ground__glyph--${index + 1}`}>
              {glyph}
            </b>
          ))}
        </span>
        <span className="home-scene-ground__spark home-scene-ground__spark--one" />
        <span className="home-scene-ground__spark home-scene-ground__spark--two" />
        <span className="home-scene-ground__spark home-scene-ground__spark--three" />
      </div>

      {burstKey && (
        <div key={burstKey} className={`home-scene-success home-scene-success--${effects.successEffect}`}>
          {successParticles.map(particle => (
            <i key={particle} className={`home-scene-success__particle home-scene-success__particle--${particle}`} />
          ))}
        </div>
      )}
    </div>
  )
}
