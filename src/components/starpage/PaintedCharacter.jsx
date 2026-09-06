import StorybookActor from "../StorybookActor";
import { STORYBOOK_ART, STORYBOOK_OUTFIT_ART } from "../../storybookAssets";
import { ForestSpirit } from "./IllustratedScene";

export function LittleFriend({ kind = "owl", className = "" }) {
  return kind === "cat" ? (
    <ForestSpirit variant={4} className={`little-friend ${className}`} />
  ) : (
    <img
      className={`little-friend painted-owl ${className}`}
      src={STORYBOOK_ART.owl}
      alt="書頁小鴞"
      draggable="false"
    />
  );
}

// These are complete outfit performances, not interchangeable body parts.
// The rig prototype stays separate until painted parts meet the same standard.
export default function PaintedCharacter({
  look,
  action = "idle",
  reduced = false,
  interactive = false,
  className = "",
  portrait = false,
  successPulse,
}) {
  const outfit = look?.top === "top_starlight" ? "star" : "mint";
  if (portrait)
    return (
      <div className={`painted-portrait ${className}`}>
        <img
          src={STORYBOOK_OUTFIT_ART[outfit].still}
          alt="冒險者頭像"
          draggable="false"
        />
      </div>
    );
  return (
    <div className={`painted-character ${className}`} data-action={action}>
      <StorybookActor
        outfit={outfit}
        interactive={interactive}
        reduced={reduced}
        successPulse={
          successPulse ||
          (action === "greet" || action === "victory" ? action : null)
        }
      />
      {action === "cast" && (
        <span className="painted-book-glow" aria-hidden="true" />
      )}
    </div>
  );
}
