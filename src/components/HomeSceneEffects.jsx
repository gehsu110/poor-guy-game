import { useEffect, useState } from 'react'
import { getEquippedHomeEffects } from '../homeSceneEffects'
import coinBurstBack from '../assets/academy-art/effects/coin-burst-back.webp'
import coinBurstFront from '../assets/academy-art/effects/coin-burst-front.webp'

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
const GROUND_LIFTS = ['one', 'two', 'three', 'four', 'five', 'six']
const SUCCESS_BEAMS = ['one', 'two', 'three', 'four']
const SUCCESS_REWARDS = ['one', 'two', 'three', 'four', 'five']
const SUCCESS_ASSETS = {
  coin_spark_burst: {
    back: coinBurstBack,
    front: coinBurstFront,
  },
}

export default function HomeSceneEffects({ theme = 'academy', equipped, successPulse, layer = 'all' }) {
  const effects = getEquippedHomeEffects(equipped, theme)
  const [summonKey, setSummonKey] = useState(null)
  const auraParticles = AURA_PARTICLES[effects.backgroundAura] ?? []
  const successParticles = SUCCESS_PARTICLES[effects.successEffect] ?? []
  const successAsset = SUCCESS_ASSETS[effects.successEffect]
  const hasGroundEffect = Boolean(effects.groundEffect)
  const hasSuccessEffect = Boolean(effects.successEffect)
  const showBackLayer = layer !== 'front'
  const showFrontLayer = layer !== 'back'
  const burstKey = successPulse && hasSuccessEffect ? String(successPulse) : null

  useEffect(() => {
    if (!hasGroundEffect || !showFrontLayer) return
    if (successPulse && !String(successPulse).startsWith('preview-')) return
    const key = successPulse ?? `entrance-${effects.groundEffect}`
    setSummonKey(key)
    const timer = window.setTimeout(() => setSummonKey(null), 1650)
    return () => window.clearTimeout(timer)
  }, [effects.groundEffect, hasGroundEffect, showFrontLayer, successPulse])

  return (
    <div
      className={`home-scene-effects home-scene-effects--${layer}`}
      data-theme={theme}
      data-background-aura={effects.backgroundAura}
      data-ground-effect={effects.groundEffect}
      data-success-effect={effects.successEffect}
      aria-hidden="true"
    >
      {showBackLayer && (
        <div className={`home-scene-aura home-scene-aura--${effects.backgroundAura}`}>
          {auraParticles.map(particle => (
            <i key={particle} className={`home-scene-aura__particle home-scene-aura__particle--${particle}`} />
          ))}
        </div>
      )}

      {showBackLayer && hasGroundEffect && (
        <>
          <div className={`home-scene-ground home-scene-ground--${effects.groundEffect}`}>
            <span className="home-scene-ground__reveal" />
            <span className="home-scene-ground__core" />
            <span className="home-scene-ground__art" />
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
            <span className="home-scene-ground__sweep" />
            <span className="home-scene-ground__lift">
              {GROUND_LIFTS.map(particle => (
                <i key={particle} className={`home-scene-ground__lift-particle home-scene-ground__lift-particle--${particle}`} />
              ))}
            </span>
            <span className="home-scene-ground__summon-flare" />
            <span className="home-scene-ground__rise-ring home-scene-ground__rise-ring--one" />
            <span className="home-scene-ground__rise-ring home-scene-ground__rise-ring--two" />
            <span className="home-scene-ground__spark home-scene-ground__spark--one" />
            <span className="home-scene-ground__spark home-scene-ground__spark--two" />
            <span className="home-scene-ground__spark home-scene-ground__spark--three" />
          </div>
        </>
      )}

      {showFrontLayer && hasGroundEffect && summonKey && (
        <div key={summonKey} className={`home-scene-summon home-scene-summon--${effects.groundEffect}`}>
          <span className="home-scene-summon__flare" />
          <span className="home-scene-summon__ring home-scene-summon__ring--one" />
          <span className="home-scene-summon__ring home-scene-summon__ring--two" />
          {GROUND_LIFTS.slice(0, 4).map(particle => (
            <i key={particle} className={`home-scene-summon__spark home-scene-summon__spark--${particle}`} />
          ))}
        </div>
      )}

      {showBackLayer && burstKey && (
        <div key={`back-${burstKey}`} className={`home-scene-success home-scene-success--backplane home-scene-success--${effects.successEffect}`}>
          {successAsset?.back && (
            <img className="home-scene-success__asset home-scene-success__asset--back" src={successAsset.back} alt="" draggable="false" />
          )}
          <span className="home-scene-success__ground-flare" />
          <span className="home-scene-success__halo" />
          {SUCCESS_BEAMS.map(beam => (
            <span key={beam} className={`home-scene-success__beam home-scene-success__beam--${beam}`} />
          ))}
        </div>
      )}

      {showFrontLayer && burstKey && hasSuccessEffect && (
        <div key={`front-${burstKey}`} className={`home-scene-success home-scene-success--frontburst home-scene-success--${effects.successEffect}`}>
          {successAsset?.front && (
            <img className="home-scene-success__asset home-scene-success__asset--front" src={successAsset.front} alt="" draggable="false" />
          )}
          {successParticles.map(particle => (
            <i key={particle} className={`home-scene-success__particle home-scene-success__particle--${particle}`} />
          ))}
          {SUCCESS_REWARDS.map(reward => (
            <span key={reward} className={`home-scene-success__reward home-scene-success__reward--${reward}`} />
          ))}
        </div>
      )}
    </div>
  )
}
