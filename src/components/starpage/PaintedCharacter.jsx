import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import CharacterRig from "../atelier/CharacterRig";
import { atelierCharacter, ATELIER_FRIENDS } from "../../atelierAssets";

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
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  const [greeting, setGreeting] = useState(0);
  const outfit = atelierCharacter(look);
  const motion =
    visible &&
    !reduced &&
    !systemReduced &&
    !staticPreview &&
    !closeup &&
    !navigator.connection?.saveData;
  if (portrait)
    return (
      <div className={`painted-portrait wind-portrait ${className}`}>
        <CharacterRig
          key={`${outfit.poster}:${outfit.head}`}
          outfit={outfit}
          look={look}
          motion={false}
          portrait
        />
      </div>
    );
  return (
    <div
      className={`painted-character wind-character ${closeup ? "is-closeup" : ""} ${className}`}
      data-action={action}
      data-motion={motion ? "on" : "off"}
    >
      <div className="wind-paper-doll">
        <CharacterRig
          key={`${outfit.poster}:${outfit.head}`}
          outfit={outfit}
          look={look}
          motion={motion}
        />
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
