import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ATELIER_OUTFITS,
  ATELIER_ATTACHMENTS,
  ATELIER_FRIENDS,
} from "../../atelierAssets";
import AnimatedLayer from "../atelier/AnimatedLayer";

export function LittleFriend({ kind = "owl", className = "" }) {
  return (
    <img
      className={`little-friend wind-friend ${className}`}
      src={ATELIER_FRIENDS[kind] ?? ATELIER_FRIENDS.owl}
      alt={kind === "cat" ? "收據信差貓" : "書頁小鴞"}
      draggable="false"
    />
  );
}
const LINES = [
  "海風剛好，一起出發吧。",
  "今天也有值得收藏的小事。",
  "手帳帶好了，準備出發！",
];
export default function PaintedCharacter({
  look,
  action = "idle",
  reduced = false,
  interactive = false,
  className = "",
  portrait = false,
  successPulse = 0,
  staticPreview = false,
  closeup = false,
}) {
  const systemReduced = useReducedMotion();
  const [greeting, setGreeting] = useState(0);
  const outfit = ATELIER_OUTFITS[look?.top] ?? ATELIER_OUTFITS.top_mint;
  const motion =
    !reduced &&
    !systemReduced &&
    !staticPreview &&
    !closeup &&
    !navigator.connection?.saveData;
  if (portrait)
    return (
      <div className={`painted-portrait wind-portrait ${className}`}>
        <img src={outfit.poster} alt="冒險者頭像" draggable="false" />
      </div>
    );
  return (
    <div
      className={`painted-character wind-character ${closeup ? "is-closeup" : ""} ${className}`}
      data-action={action}
    >
      <div className="wind-paper-doll">
        <img
          className="wind-body-image"
          src={outfit.poster}
          alt="星風旅人"
          draggable="false"
        />
        {outfit.motion && (
          <AnimatedLayer
            key={outfit.motion}
            src={outfit.motion}
            enabled={motion}
            transparent
            className="wind-body-motion"
          />
        )}
        {[look?.hat, look?.prop].map(
          (id) =>
            ATELIER_ATTACHMENTS[id] && (
              <img
                key={id}
                className={`wind-attachment wind-attachment--${id}`}
                src={ATELIER_ATTACHMENTS[id].src}
                alt=""
                draggable="false"
                style={{
                  left: ATELIER_ATTACHMENTS[id].left,
                  top: ATELIER_ATTACHMENTS[id].top,
                  width: ATELIER_ATTACHMENTS[id].width,
                  rotate: ATELIER_ATTACHMENTS[id].rotate,
                }}
              />
            ),
        )}
        {(action === "cast" || action === "victory" || successPulse > 0) && (
          <span
            key={`${action}:${successPulse}`}
            className="wind-magic-ring"
            aria-hidden="true"
          />
        )}
        {interactive && (
          <button
            className="wind-character-touch"
            aria-label="與旅人互動"
            onClick={() => setGreeting((g) => g + 1)}
          />
        )}
      </div>
      {(greeting > 0 || successPulse > 0) && (
        <span
          className="wind-character-line"
          key={`${greeting}:${successPulse}`}
          role="status"
        >
          {LINES[(greeting + successPulse - 1) % LINES.length]}
        </span>
      )}
    </div>
  );
}
