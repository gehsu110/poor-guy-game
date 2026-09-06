import { useState } from "react";
import { CHAPTERS, currentNode } from "../../game/journey";
import { WorldDialog, RelicIcon } from "./WorldUI";
const PLACES = [
  [19, 77],
  [43, 61],
  [76, 51],
  [56, 29],
  [30, 13],
];
export default function JourneyMap({ profile, onClose, onVisit }) {
  const next = currentNode(profile);
  const [chapter, setChapter] = useState(
    Math.min(2, Math.floor((next.index - 1) / 5)),
  );
  const [selected, setSelected] = useState(Math.min(15, next.index));
  return (
    <WorldDialog
      title="我的旅程地圖"
      onClose={onClose}
      className="world-map-dialog"
    >
      <div className="world-map-chapters">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            aria-pressed={i === chapter}
            onClick={() => {
              setChapter(i);
              setSelected(i * 5 + 1);
            }}
          >
            {["庭院", "市集", "森林"][i]}
          </button>
        ))}
      </div>
      <div className="world-trail">
        <span className="world-trail-compass">
          N<RelicIcon kind="map" />
        </span>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M19 77C15 63 30 68 43 61S83 66 76 51S40 41 56 29S54 5 30 13"
            fill="none"
            stroke="#896b42"
            strokeWidth="1.1"
            strokeDasharray="2 2"
          />
        </svg>
        {PLACES.map(([x, y], i) => {
          const n = chapter * 5 + i + 1;
          const done = n <= profile.journey.completed;
          return (
            <button
              key={n}
              className={`world-trail-stop ${done ? "is-done" : ""} ${n === next.index ? "is-current" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelected(n)}
              aria-label={`第 ${n} 段 ${CHAPTERS[chapter].nodes[i]}，${done ? "已完成" : n === next.index ? "下一站" : "待解鎖"}`}
              aria-pressed={selected === n}
            >
              <span>
                {done ? "✓" : n === next.index ? <RelicIcon kind="star" /> : n}
              </span>
              <b>{CHAPTERS[chapter].nodes[i]}</b>
            </button>
          );
        })}
      </div>
      <div className="world-map-detail">
        <small>
          第 {selected} 段 · {CHAPTERS[chapter].name}
        </small>
        <strong>{CHAPTERS[chapter].nodes[(selected - 1) % 5]}</strong>
        <p>
          {selected <= profile.journey.completed
            ? "相遇的印記，已經好好收進手帳。"
            : selected === next.index
              ? "準備好一次冒險，就能走到這一站。"
              : "走完前一段旅程，就會開啟。"}
        </p>
        {selected <= next.index && (
          <button className="world-primary" onClick={() => onVisit(selected)}>
            {selected <= profile.journey.completed
              ? "看看這枚印記"
              : "前往這一站"}{" "}
            →
          </button>
        )}
      </div>
    </WorldDialog>
  );
}
