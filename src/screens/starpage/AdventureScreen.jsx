import { useEffect, useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import {
  CHAPTERS,
  ROUTES,
  currentNode,
  resolveStarAction,
} from "../../game/journey";
import { ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import { nextStep, searchProgress, encounterFor } from "../../game/guidance";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import { ForestSpirit } from "../../components/starpage/IllustratedScene";
import { StarShard } from "../../components/starpage/JourneyUX";
import { WorldHeader, RelicIcon } from "../../components/starpage/WorldUI";
import { StarCurrency } from "../../components/starpage/Chrome";
import JourneyMap from "../../components/starpage/JourneyMap";

const POSITIONS = [
  [18, 32],
  [81, 39],
  [55, 23],
];
export default function AdventureScreen() {
  const {
    state,
    beginJourney,
    actJourney,
    navigate,
    openEntry,
    recordAction,
    updateGame,
  } = useApp();
  const { profile, busy, dayRecord, date } = state;
  const node = currentNode(profile),
    guide = nextStep(profile, dayRecord, date);
  const look = normalizeLook(profile.equipped.layered),
    friend = ITEM_BY_ID[look.companion];
  const [route, setRoute] = useState("library");
  const [practice, setPractice] = useState(null),
    [practiceResult, setPracticeResult] = useState(null);
  const [acting, setActing] = useState(false),
    [held, setHeld] = useState(null);
  const [castKey, setCastKey] = useState(0),
    [inlineError, setInlineError] = useState("");
  const [mapOpen, setMapOpen] = useState(false),
    [chat, setChat] = useState(false),
    [pickup, setPickup] = useState(null);
  const lock = useRef(false),
    mounted = useRef(true),
    stage = useRef(null),
    meter = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const active = practice ?? profile.journey.active ?? (acting ? held : null);
  const result =
    !acting &&
    (practiceResult ??
      (!practice && !profile.journey.active && !profile.journey.lastResult?.seen
        ? profile.journey.lastResult
        : null));
  const view = result ? "result" : active ? "encounter" : "lobby";
  useEffect(() => {
    stage.current?.querySelector("h1")?.focus({ preventScroll: true });
    document.querySelector(".star-scroll")?.scrollTo({ top: 0 });
  }, [view]);
  function explore(number = Math.min(15, node.index)) {
    setPracticeResult(null);
    setPractice({
      id: `practice-${crypto.randomUUID()}`,
      node: number,
      route,
      hp: 100,
      turn: 0,
      foundShards: [],
      practice: true,
    });
    setCastKey(0);
    setInlineError("");
    setChat(false);
  }
  async function act(skill, shardId) {
    if (lock.current || !active) return;
    lock.current = true;
    const current = active;
    setHeld(current);
    setActing(true);
    setInlineError("");
    setChat(false);
    setCastKey((k) => k + 1);
    try {
      const change = resolveStarAction(current, skill, !!friend, shardId);
      const index = shardId ?? searchProgress(current).target ?? 0;
      const box = stage.current?.getBoundingClientRect(),
        end = meter.current?.getBoundingClientRect();
      if (box && end) {
        const x = (box.width * POSITIONS[index][0]) / 100,
          y = (box.height * POSITIONS[index][1]) / 100;
        setPickup({
          id: current.turn,
          x,
          y,
          dx: end.left - box.left + end.width / 2 - x,
          dy: end.top - box.top + end.height / 2 - y,
        });
      }
      const quiet =
        profile.preferences?.reduceMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const motion = new Promise((resolve) =>
        setTimeout(resolve, quiet ? 0 : 650),
      );
      const success = current.practice
        ? true
        : await actJourney(current.id, current.turn, skill, shardId);
      if (success && current.practice && mounted.current)
        setPractice({ ...current, ...change, turn: current.turn + 1 });
      await motion;
      if (!mounted.current) return;
      if (success && current.practice && change.hp === 0) {
        setPractice(null);
        setPracticeResult({ ...current, hp: 0 });
      }
      if (!success) setInlineError("星光還沒存好，請再試一次。");
    } catch (error) {
      if (mounted.current) setInlineError(error.message || "請再試一次。");
    } finally {
      lock.current = false;
      if (mounted.current) {
        setActing(false);
        setPickup(null);
      }
    }
  }
  async function leaveResult(destination) {
    if (result?.practice) {
      setPracticeResult(null);
      return;
    }
    const id = result?.id;
    const success = await updateGame((p) => ({
      ...p,
      journey: {
        ...p.journey,
        lastResult:
          p.journey.lastResult?.id === id
            ? { ...p.journey.lastResult, seen: true }
            : p.journey.lastResult,
      },
    }));
    if (success && destination === "collection")
      navigate("collection", { tab: "stamps", stamp: result.node });
  }
  if (result) {
    const encounter = encounterFor(result.node);
    return (
      <main ref={stage} className="world-stage world-result">
        <WorldHeader
          title={result.practice ? "星光回來了！" : "新的相遇，已收藏"}
          subtitle={
            result.practice ? "自由探索完成" : `第 ${result.node} 段旅程完成`
          }
          onBack={() => leaveResult("lobby")}
          backLabel="返回冒險入口"
        />
        <div className="world-reward-light" aria-hidden="true" />
        <div className="world-reward-portrait">
          <div className="world-reward-ring" />
          <ForestSpirit variant={result.node - 1} defeated />
          <div className="world-reward-stars">
            <StarShard />
            <StarShard />
            <StarShard />
          </div>
          <span className="world-reward-ribbon">
            {result.practice ? "相遇成功" : "旅程新印記"}
          </span>
        </div>
        <section className="world-reward-caption">
          <h2>{encounter.name}</h2>
          <p>「{encounter.thanks}」</p>
          {result.practice ? (
            <small>自由探索 · 不扣次數、不發正式獎勵</small>
          ) : (
            <div className="world-reward-loot">
              <span>
                <RelicIcon kind="book" />
                {ROUTES.find((r) => r.id === result.route)?.mark}
              </span>
              <span>
                <RelicIcon kind="star" />
                30 EXP
              </span>
              {result.node % 5 === 0 && <StarCurrency amount={1} purple />}
            </div>
          )}
          <button
            className="world-primary"
            disabled={busy}
            onClick={() =>
              result.practice
                ? explore((result.node % 15) + 1)
                : leaveResult("collection")
            }
          >
            {result.practice ? "再去找一位朋友" : "收好印記，打開圖鑑"} ›
          </button>
          <button
            className="world-text-action"
            disabled={busy}
            onClick={() => leaveResult("lobby")}
          >
            回到冒險入口
          </button>
        </section>
      </main>
    );
  }
  if (active) {
    const progress = searchProgress(active),
      encounter = encounterFor(active.node);
    return (
      <main
        ref={stage}
        className="world-stage world-adventure"
        data-casting={acting}
      >
        <WorldHeader
          title={
            CHAPTERS[Math.floor((active.node - 1) / 5)].name.split("・")[1]
          }
          subtitle={
            active.practice
              ? "自由探索 · 不消耗次數"
              : `第 ${active.node} 段 · ${ROUTES.find((r) => r.id === active.route)?.name}`
          }
          onBack={() => {
            if (!acting) active.practice ? setPractice(null) : navigate("town");
          }}
          backDisabled={acting}
          backLabel={active.practice ? "離開自由探索" : "保存進度，返回庭院"}
        />
        <div className="world-mission">
          <small>精靈的委託</small>
          <strong>找回散落的星光</strong>
          <span>點選發光星片</span>
        </div>
        <div
          className="world-star-meter"
          ref={meter}
          role="progressbar"
          aria-label="已找到的星片"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={progress.found}
        >
          <div>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < progress.found ? "is-filled" : ""}>
                <StarShard />
              </span>
            ))}
          </div>
          <b>{progress.found} / 3</b>
        </div>
        <div className="world-adventure-hero">
          <PaintedCharacter
            key={castKey}
            look={look}
            action={acting ? "cast" : "idle"}
            reduced={profile.preferences?.reduceMotion}
          />
        </div>
        <button
          className="world-npc"
          onClick={() => setChat(!chat)}
          aria-label={`和${encounter.name}說話`}
        >
          <ForestSpirit variant={active.node - 1} hit={acting} />
          <b>{encounter.name}</b>
        </button>
        {friend && (
          <div className="world-adventure-friend">
            <LittleFriend kind={friend.look} />
          </div>
        )}
        {POSITIONS.map(([x, y], i) => (
          <button
            key={i}
            className={`world-star ${progress.collected.includes(i) ? "is-collected" : ""}`}
            style={{ left: `${x}%`, top: `${y}%`, "--star-order": i }}
            disabled={acting || busy || progress.collected.includes(i)}
            aria-label={`第 ${i + 1} 片星光，${progress.collected.includes(i) ? "已找到" : "點一下收集"}`}
            onClick={() => act("cast", i)}
          >
            <span className="world-star-aura" />
            <StarShard />
            <span className="world-star-spark" />
            {!progress.collected.includes(i) && <i>✧</i>}
          </button>
        ))}
        {pickup && !profile.preferences?.reduceMotion && (
          <span
            key={pickup.id}
            className="world-pickup"
            style={{
              left: pickup.x,
              top: pickup.y,
              "--fly-x": `${pickup.dx}px`,
              "--fly-y": `${pickup.dy}px`,
            }}
            aria-hidden="true"
          >
            <StarShard />
          </span>
        )}
        <div className="world-dialogue" role="status">
          <span className="world-dialogue-name">{encounter.name}</span>
          <p>
            {inlineError ||
              (acting
                ? "找到一片了！"
                : chat
                  ? encounter.request
                  : progress.found === 2
                    ? "還有最後一片！你看，它就在那裡。"
                    : progress.found
                      ? "星光藏在庭院裡，找找看。"
                      : encounter.request)}
          </p>
          <i aria-hidden="true">◆</i>
        </div>
        <div className="world-skills">
          {friend && (
            <button
              disabled={acting || busy}
              onClick={() => act("friend")}
              aria-label={`${friend.name}幫忙收集星片`}
            >
              <span>
                <LittleFriend kind={friend.look} />
              </span>
              <b>夥伴幫忙</b>
            </button>
          )}
          <button
            className="world-skill-main"
            disabled={acting || busy}
            onClick={() => act("cast")}
            aria-label="感應星光，收集一片星光"
          >
            <span>
              <RelicIcon kind="book" />
            </span>
            <b>{acting ? "收集中…" : "感應星光"}</b>
          </button>
        </div>
        <button
          className="world-easy"
          disabled={acting || busy}
          onClick={() => act("quick")}
        >
          輕鬆完成 <span>{active.practice ? "自由探索" : "獎勵相同"}</span>
        </button>
      </main>
    );
  }
  const ready = guide.step === 1,
    completed = guide.step === 2,
    encounter = encounterFor(Math.min(15, node.index));
  return (
    <main ref={stage} className="world-stage world-adventure-lobby">
      <WorldHeader
        title="風鈴小徑"
        subtitle={`我的旅程 · ${profile.journey.completed} / 15 段`}
        onBack={() => navigate("town")}
      />
      <button className="world-map-button" onClick={() => setMapOpen(true)}>
        <RelicIcon kind="map" />
        <span>旅程地圖</span>
      </button>
      <div className="world-lobby-sign">
        <small>
          {completed
            ? "今日冒險已完成"
            : ready
              ? "今日委託已準備"
              : "下一次相遇"}
        </small>
        <h2>{encounter.name}</h2>
        <p>{completed ? "還想散步嗎？我陪你去找星光。" : encounter.request}</p>
      </div>
      <div className="world-lobby-hero">
        <PaintedCharacter
          look={look}
          reduced={profile.preferences?.reduceMotion}
        />
      </div>
      <div className="world-lobby-spirit">
        <ForestSpirit variant={Math.min(14, node.index - 1)} />
      </div>
      <div className="world-lobby-camp">
        <fieldset className="world-route-charms">
          <legend>
            {completed ? "散步時想留下哪一種心情？" : "替這次相遇選一款印記"}
          </legend>
          {ROUTES.map((r) => (
            <button
              key={r.id}
              aria-pressed={route === r.id}
              onClick={() => setRoute(r.id)}
            >
              <RelicIcon kind={r.id === "library" ? "book" : "map"} />
              <span>{r.mark}</span>
              {route === r.id && <i>✓</i>}
            </button>
          ))}
        </fieldset>
        <button
          className="world-primary"
          disabled={busy}
          onClick={() =>
            completed ? explore() : ready ? beginJourney(route) : openEntry()
          }
        >
          <RelicIcon kind={completed || ready ? "map" : "book"} />
          {completed
            ? "和小夥伴自由探索"
            : ready
              ? "帶上手帳，出發"
              : "記下一筆，準備出發"}{" "}
          ›
        </button>
        <p className="world-lobby-reward">
          {completed
            ? "自由探索不扣次數、不發正式獎勵"
            : "完成相遇 · 收藏印記 ＋ 30 EXP"}
        </p>
        <div className="world-lobby-extra">
          {completed ? (
            <button onClick={() => navigate("collection", { tab: "stamps" })}>
              打開我的旅程印記
            </button>
          ) : (
            <button onClick={() => explore()}>先自由探索一下</button>
          )}
          {!ready && !completed && (
            <button disabled={busy} onClick={() => recordAction("zero")}>
              今天零消費
            </button>
          )}
        </div>
      </div>
      {mapOpen && (
        <JourneyMap
          profile={profile}
          onClose={() => setMapOpen(false)}
          onVisit={(n) => {
            setMapOpen(false);
            if (n <= profile.journey.completed)
              navigate("collection", { tab: "stamps", stamp: n });
          }}
        />
      )}
    </main>
  );
}
