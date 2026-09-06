import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { STORYBOOK_ART } from "../../storybookAssets";
import { STARWIND_OUTFITS, STARWIND_ACCESSORIES } from "../../starwindAssets";
import { ForestSpirit } from "./IllustratedScene";
import ModelViewport from "../starwind/ModelViewport";

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

// Costumes are complete skinned models. Headwear and props are separate bone attachments.
export default function PaintedCharacter({
  look,
  action = "idle",
  reduced = false,
  interactive = false,
  className = "",
  portrait = false,
  successPulse,
  controls = false,
  staticPreview = false,
  closeup = false,
}) {
  const preferReduced = useReducedMotion();
  const outfit = STARWIND_OUTFITS[look?.top] ?? STARWIND_OUTFITS.top_mint;
  const hat = look?.hat,
    prop = look?.prop;
  const accessories = useMemo(
    () => ({
      hat: STARWIND_ACCESSORIES[hat],
      prop: STARWIND_ACCESSORIES[prop],
    }),
    [hat, prop],
  );
  if (portrait)
    return (
      <div className={`painted-portrait starwind-portrait ${className}`}>
        <img src={outfit.portrait} alt="冒險者頭像" draggable="false" />
      </div>
    );
  return (
    <div className={`painted-character ${className}`} data-action={action}>
      {staticPreview ? (
        <img
          className="starwind-poster"
          src={outfit.poster}
          alt="套裝人物預覽"
          draggable="false"
        />
      ) : (
        <ModelViewport
          url={outfit.url}
          accessories={accessories}
          portrait={closeup}
          poster={closeup ? outfit.portrait : outfit.poster}
          interactive={interactive}
          reduced={reduced || !!preferReduced}
          greet={
            successPulse ??
            (action === "greet" || action === "victory" ? action : 0)
          }
          controls={controls}
        />
      )}
      {action === "cast" && (
        <span className="painted-book-glow" aria-hidden="true" />
      )}
    </div>
  );
}
