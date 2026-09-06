import { STORYBOOK_ART } from "../../storybookAssets";

// The detailed painting is the art baseline. Keep it at full contrast.
export default function IllustratedScene({ className = "" }) {
  return (
    <div className={`illustrated-scene ${className}`} aria-hidden="true">
      <img src={STORYBOOK_ART.courtyard} alt="" draggable="false" />
      <span className="painted-scene-light" />
      <span className="painted-scene-motes">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function ForestSpirit({
  hit = false,
  defeated = false,
  variant = 0,
  className = "",
}) {
  const index = ((variant % 8) + 8) % 8;
  return (
    <div
      className={`painted-spirit forest-spirit ${hit ? "is-hit" : ""} ${defeated ? "is-friend" : ""} ${className}`}
      role="img"
      aria-label={defeated ? "找回星光的旅程精靈" : "等待你幫忙的旅程精靈"}
    >
      <span className="painted-spirit-shadow" />
      <span
        className="painted-spirit-art"
        style={{
          backgroundImage: `url(${STORYBOOK_ART.monsters})`,
          backgroundPosition: `${((index % 4) * 100) / 3}% ${Math.floor(index / 4) * 100}%`,
        }}
      />
    </div>
  );
}

// Garden items remain in saved collections until their production art is ready.
export function GardenObject() {
  return null;
}
