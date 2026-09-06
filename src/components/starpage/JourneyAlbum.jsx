import { useEffect, useRef } from "react";
import { CHAPTERS, ROUTES } from "../../game/journey";
import { encounterFor } from "../../game/guidance";
import { ForestSpirit } from "./IllustratedScene";
import { StarShard } from "./JourneyUX";

export default function JourneyAlbum({ profile, highlight, onExplore }) {
  const newest = useRef(null);
  const stamps = [...profile.journey.stamps].sort((a, b) => b.node - a.node);
  useEffect(() => {
    newest.current?.focus({ preventScroll: true });
  }, [highlight]);
  return (
    <section className="quest-album">
      <div className="quest-album-heading">
        <div>
          <span className="quest-kicker">每一次相遇，都有自己的故事</span>
          <h2>我的旅程印記</h2>
        </div>
        <span>
          {stamps.length}
          <small> / 15</small>
        </span>
      </div>
      {highlight &&
        stamps.some((stamp) => stamp.node === Number(highlight)) && (
          <p className="quest-album-new" role="status">
            新印記已收藏，隨時可以回來看看。
          </p>
        )}
      <div className="quest-album-grid">
        {stamps.map((stamp) => {
          const encounter = encounterFor(stamp.node);
          const isNew = stamp.node === Number(highlight);
          return (
            <article
              className={`quest-album-card ${isNew ? "is-new" : ""}`}
              key={stamp.node}
              ref={isNew ? newest : undefined}
              tabIndex={isNew ? -1 : undefined}
            >
              <div className="quest-album-card-art">
                <ForestSpirit variant={stamp.node - 1} defeated />
                <span>
                  {isNew
                    ? "新收藏"
                    : `第 ${String(stamp.node).padStart(2, "0")} 段`}
                </span>
              </div>
              <strong>{encounter.name}</strong>
              <small>
                {
                  CHAPTERS[Math.floor((stamp.node - 1) / 5)].nodes[
                    (stamp.node - 1) % 5
                  ]
                }
              </small>
              <span
                className={`quest-album-seal ${stamp.route === "forest" ? "is-leaf" : ""}`}
              >
                <StarShard />
                {ROUTES.find((route) => route.id === stamp.route)?.mark}
              </span>
              <p>「{encounter.thanks}」</p>
            </article>
          );
        })}
        <button
          className="quest-album-card quest-album-empty"
          onClick={onExplore}
        >
          <StarShard />
          <strong>
            {stamps.length === 15
              ? "整本故事，收齊了"
              : stamps.length
                ? "下一個故事"
                : "第一份相遇"}
          </strong>
          <p>
            {stamps.length === 15
              ? "隨時回到小徑，陪老朋友找找星光。"
              : stamps.length
                ? "新的精靈，還在小徑上等你。"
                : "完成一次正式冒險，就能收藏第一枚印記。"}
          </p>
          <span>去冒險看看 →</span>
        </button>
      </div>
    </section>
  );
}
