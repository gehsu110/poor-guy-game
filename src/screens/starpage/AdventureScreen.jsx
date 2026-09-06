import { useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import { CHAPTERS, ROUTES, currentNode } from "../../game/journey";
import { ITEMS, ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import IllustratedScene, {
  ForestSpirit,
} from "../../components/starpage/IllustratedScene";
import { PageHead } from "../../components/starpage/Chrome";
export default function AdventureScreen() {
  const { state, beginJourney, actJourney, navigate, openEntry } = useApp();
  const { profile, busy } = state;
  const node = currentNode(profile);
  const [chapter, setChapter] = useState(node.chapterIndex);
  const [route, setRoute] = useState("library");
  const [acting, setActing] = useState(false);
  const [lastEncounter, setLastEncounter] = useState(null);
  const active = profile.journey.active ?? (acting ? lastEncounter : null);
  const [result, setResult] = useState(null);
  const actionLock = useRef(false);
  const [inspected, setInspected] = useState(null);
  const [castKey, setCastKey] = useState(0);
  const [lastPower, setLastPower] = useState(40);
  const look = normalizeLook(profile.equipped.layered);
  const friend = ITEM_BY_ID[look.companion];
  const current = CHAPTERS[chapter];
  const encounter = active
    ? CHAPTERS[Math.floor((active.node - 1) / 5)].nodes[(active.node - 1) % 5]
    : node.name;
  async function act(skill) {
    if (actionLock.current || !active) return;
    actionLock.current = true;
    setLastEncounter(active);
    setLastPower(
      skill === "friend"
        ? 55
        : skill === "quick"
          ? active.hp
          : Math.min(40, active.hp),
    );
    setActing(true);
    setCastKey((key) => key + 1);
    const completed =
      skill === "quick" || active.hp <= (skill === "friend" ? 55 : 40);
    const [success] = await Promise.all([
      actJourney(active.id, active.turn, skill),
      new Promise((resolve) =>
        setTimeout(
          resolve,
          profile.preferences?.reduceMotion ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 0
            : 850,
        ),
      ),
    ]);
    if (success && completed)
      setResult({
        node: active.node,
        route: active.route,
        items: ITEMS.filter(
          (item) => item.node === active.node && item.artReady,
        ),
      });
    setActing(false);
    actionLock.current = false;
  }
  if (result)
    return (
      <main className="star-page star-journey-result">
        <PageHead eyebrow="A NEW PAGE" title="又走過一小段。" />
        <div className="star-result-stage">
          <IllustratedScene />
          <PaintedCharacter
            look={look}
            action="victory"
            reduced={profile.preferences?.reduceMotion}
          />
        </div>
        <span className="star-eyebrow">第 {result.node} 段旅程完成</span>
        <h2>
          {result.items.length
            ? `遇見了${result.items[0].name}`
            : "星光，回到它身邊了。"}
        </h2>
        <p>
          {ROUTES.find((item) => item.id === result.route).mark}已收集 · +30 EXP
          {result.node % 5 === 0 ? " · 紫星 +1" : ""}
        </p>
        <div className="star-result-stamp">
          <ForestSpirit variant={result.node - 1} defeated />
          <div>
            <strong>新相遇，已收進旅程圖鑑</strong>
            <small>
              {ROUTES.find((item) => item.id === result.route).mark} · 第{" "}
              {result.node} 段
            </small>
          </div>
        </div>
        {result.items.map((item) => (
          <p key={item.id}>{item.desc}</p>
        ))}
        <button
          className="star-button"
          onClick={() => navigate("collection", { item: result.items[0]?.id })}
        >
          {result.items.length ? "看看新收藏，穿上試試" : "看看我的收藏"}
        </button>
        <button
          className="star-button star-button--quiet"
          onClick={() => {
            setResult(null);
            setChapter(currentNode(profile).chapterIndex);
          }}
        >
          回到旅程地圖
        </button>
      </main>
    );
  if (active)
    return (
      <main className="star-page star-battle">
        <div className="star-battle-stage">
          <IllustratedScene />
          <div className="star-battle-monster" key={`spirit:${castKey}`}>
            <span className="star-spirit-dialogue">
              {acting
                ? "星光…回來了！"
                : active.hp < 100
                  ? "再一點點，就能看見路了。"
                  : "你也能看見那些小星光嗎？"}
            </span>
            <ForestSpirit variant={active.node - 1} hit={acting} />
            {acting && (
              <span className="star-hit-number">+{lastPower} 星光</span>
            )}
          </div>
          <div className="star-battle-hero">
            <PaintedCharacter
              key={castKey}
              look={look}
              action={castKey ? "cast" : "idle"}
              reduced={profile.preferences?.reduceMotion}
            />
          </div>
          {friend && (
            <div className="star-battle-friend">
              <LittleFriend kind={friend.look} />
            </div>
          )}
          <div
            className="star-spell-trail"
            key={`trail:${castKey}`}
            data-cast={castKey > 0}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span
            className="star-battle-magic"
            key={`magic:${castKey}`}
            data-cast={castKey > 0}
          />
        </div>
        <header className="star-battle-head">
          <div>
            <span className="star-eyebrow">
              第 {String(active.node).padStart(2, "0")} 段 ·{" "}
              {ROUTES.find((item) => item.id === active.route).name}
            </span>
            <h1>{encounter}</h1>
          </div>
          <button
            className="star-battle-exit"
            onClick={() => navigate("town")}
            aria-label="保存進度，稍後繼續"
          >
            ↩<span>稍後</span>
          </button>
        </header>
        <div className="star-spirit-hp">
          <span>替精靈找回星光</span>
          <b>
            {100 - active.hp}
            <small> / 100</small>
          </b>
          <div
            role="progressbar"
            aria-label="找回的星光"
            aria-valuenow={100 - active.hp}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${100 - active.hp}%` }} />
          </div>
        </div>
        <div className="star-battle-actions">
          <span className="star-battle-turn">
            {acting
              ? "手帳裡的微光，正在照亮前路"
              : "你的回合 · 讓今天的記錄化成魔法"}
          </span>
          <button
            className="star-button star-spell-button"
            disabled={busy || acting}
            onClick={() => act("cast")}
          >
            <span className="star-spell-emblem" aria-hidden="true">
              ✦
            </span>
            <span>
              <b>{acting ? "星光正在前進…" : "翻開手帳・星頁魔法"}</b>
              <small>每次點亮 40 星光</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
          {friend && (
            <button
              className="star-friend-action"
              disabled={busy || acting}
              onClick={() => act("friend")}
            >
              {friend.name}，一起幫忙 <span>55 星光</span>
            </button>
          )}
          <button
            className="star-text-button"
            disabled={busy || acting}
            onClick={() => act("quick")}
          >
            快速完成<span>・獎勵相同</span>
          </button>
        </div>
      </main>
    );
  return (
    <main className="star-page star-adventure">
      <PageHead eyebrow="THE STORY GOES ON" title="我的星頁旅程">
        <span className="star-count">{profile.journey.completed} / 15</span>
      </PageHead>
      <p className="star-lead">漏一天沒關係，你的故事會在這裡等你。</p>
      <div className="star-chapter-tabs">
        {CHAPTERS.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={index === chapter}
            onClick={() => {
              setChapter(index);
              setInspected(null);
            }}
          >
            {["庭院", "市集", "森林"][index]}
            <small>
              {Math.min(5, Math.max(0, profile.journey.completed - index * 5))}
              /5
            </small>
          </button>
        ))}
      </div>
      <section className={`star-map star-map--${current.id}`}>
        <IllustratedScene
          theme={current.id === "forest" ? "forest" : "courtyard"}
        />
        <div className="star-map-title">
          <span>{current.name}</span>
          <h2>{current.place}</h2>
        </div>
        <svg className="star-map-path" viewBox="0 0 320 440" aria-hidden="true">
          <path
            d="M70 360C310 360 70 265 232 276S70 181 92 197S270 96 237 115S140 61 137 56"
            fill="none"
            stroke="#fff3ce"
            strokeWidth="8"
          />
          <path
            d="M70 360C310 360 70 265 232 276S70 181 92 197S270 96 237 115S140 61 137 56"
            fill="none"
            stroke="#b29d72"
            strokeWidth="2"
            strokeDasharray="5 8"
          />
        </svg>
        <div className="star-map-nodes">
          {current.nodes.map((name, index) => {
            const number = chapter * 5 + index + 1;
            const done = profile.journey.completed >= number;
            const next = number === node.index;
            return (
              <button
                key={name}
                style={{
                  left: ["22%", "72%", "29%", "74%", "43%"][index],
                  bottom: [9, 27, 45, 64, 82][index] + "%",
                }}
                className={`star-map-node ${done ? "is-done" : ""} ${next ? "is-next" : ""}`}
                onClick={() => setInspected({ name, number, done })}
                aria-label={`第 ${number} 段 ${name}，${done ? "已完成" : next ? "下一站" : "待解鎖"}`}
              >
                <span>{done ? "✓" : number}</span>
                <small>{name}</small>
                {next && <b>下一站</b>}
              </button>
            );
          })}
        </div>
      </section>
      {inspected && (
        <div className="star-node-detail">
          <strong>
            第 {inspected.number} 段・{inspected.name}
          </strong>
          <p>
            {inspected.done
              ? `已完成 · ${ROUTES.find((r) => r.id === profile.journey.stamps.find((stamp) => stamp.node === inspected.number)?.route)?.mark ?? "旅程紀念"}`
              : inspected.number === node.index
                ? "這是你的下一站，選一條小徑就能出發。"
                : "完成前一段旅程後，就會來到這裡。"}
          </p>
          {ITEMS.filter(
            (item) => item.node === inspected.number && item.artReady,
          ).map((item) => (
            <small key={item.id}>收藏獎勵：{item.name}</small>
          ))}
        </div>
      )}
      {!node.finished && (
        <section className="star-route-choice">
          <div className="star-section-title">
            <h2>下一站・{node.name}</h2>
            <small>{profile.journey.pendingDates.length} 段已準備</small>
          </div>
          <div className="star-route-options">
            {ROUTES.map((item) => (
              <button
                key={item.id}
                aria-pressed={route === item.id}
                onClick={() => setRoute(item.id)}
              >
                <span>{item.id === "library" ? "01" : "02"}</span>
                <strong>{item.name}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
          {profile.journey.pendingDates.length ? (
            <button
              className="star-button"
              disabled={busy}
              onClick={() => beginJourney(route)}
            >
              沿著這條小徑出發 →
            </button>
          ) : (
            <>
              <p className="star-form-hint">
                記錄今天或確認零消費，就能準備一段旅程。最多保留 3
                段，隨時回來繼續。
              </p>
              <button className="star-button" onClick={() => openEntry()}>
                先寫下今天的一頁
              </button>
            </>
          )}
        </section>
      )}
      {node.finished && (
        <section className="star-node-detail">
          <h2>三個章節，都留下了你的足跡。</h2>
          <p>
            15
            段旅程已完成。日常星幣與收藏繼續累積，你也可以回看每個節點的印記。
          </p>
          <button
            className="star-button"
            onClick={() => navigate("collection")}
          >
            繼續我的收藏
          </button>
        </section>
      )}
    </main>
  );
}
