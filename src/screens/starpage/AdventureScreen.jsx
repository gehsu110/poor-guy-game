import { useEffect, useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import {
  CHAPTERS,
  ROUTES,
  currentNode,
  encounterStep,
} from "../../game/journey";
import { ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import { nextStep, searchProgress, encounterFor } from "../../game/guidance";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import { ForestSpirit } from "../../components/starpage/IllustratedScene";
import {
  Diorama,
  HowToPlay,
  JourneySteps,
  StarShard,
} from "../../components/starpage/JourneyUX";
import { StarCurrency } from "../../components/starpage/Chrome";
import GameIcon from "../../components/GameIcon";

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
  const node = currentNode(profile);
  const guide = nextStep(profile, dayRecord, date);
  const look = normalizeLook(profile.equipped.layered);
  const friend = ITEM_BY_ID[look.companion];
  const [route, setRoute] = useState("library");
  const [practice, setPractice] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [acting, setActing] = useState(false);
  const [heldEncounter, setHeldEncounter] = useState(null);
  const [castKey, setCastKey] = useState(0);
  const [inspected, setInspected] = useState(null);
  const [inlineError, setInlineError] = useState("");
  const actionLock = useRef(false);
  const mounted = useRef(true);
  const headingRef = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const active =
    practice ?? profile.journey.active ?? (acting ? heldEncounter : null);
  const result =
    !acting &&
    (practiceResult ??
      (!practice && !profile.journey.active && !profile.journey.lastResult?.seen
        ? profile.journey.lastResult
        : null));
  const view = result ? "result" : active ? "encounter" : "lobby";
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
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
      practice: true,
    });
    setCastKey(0);
    setInlineError("");
  }
  async function act(skill) {
    if (actionLock.current || !active) return;
    const current = active;
    actionLock.current = true;
    setHeldEncounter(current);
    setActing(true);
    setInlineError("");
    setCastKey((key) => key + 1);
    const quiet =
      profile.preferences?.reduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finishMotion = new Promise((resolve) =>
      setTimeout(resolve, quiet ? 0 : 700),
    );
    let success;
    try {
      const hp = encounterStep(current, skill, !!friend);
      success = current.practice
        ? true
        : await actJourney(current.id, current.turn, skill);
      if (success && current.practice && mounted.current)
        setPractice({ ...current, hp, turn: current.turn + 1 });
      await finishMotion;
      if (!mounted.current) return;
      if (success && current.practice && hp === 0) {
        setPractice(null);
        setPracticeResult({ ...current, hp: 0 });
      }
      if (!success)
        setInlineError("這片星光還沒存好，請再試一次。已找到的星片會保留。");
    } catch (error) {
      if (mounted.current)
        setInlineError(error.message || "星光還沒存好，請再試一次。");
    } finally {
      actionLock.current = false;
      if (mounted.current) setActing(false);
    }
  }
  async function leaveResult(destination) {
    if (result?.practice) {
      setPracticeResult(null);
      if (destination === "collection")
        navigate("collection", { tab: "stamps" });
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
  const goStep = (index) =>
    index === 0
      ? openEntry()
      : index === 2
        ? navigate("collection", { tab: "stamps" })
        : null;

  if (result) {
    const encounter = encounterFor(result.node);
    return (
      <main className="quest-page quest-result">
        <header className="quest-page-header">
          <div>
            <span className="quest-kicker">
              {result.practice
                ? "自由探索完成"
                : `第 ${result.node} 段旅程完成`}
            </span>
            <h1 ref={headingRef} tabIndex={-1}>
              {result.practice ? "找到全部星片了！" : "把這次相遇，收起來。"}
            </h1>
          </div>
          <HowToPlay />
        </header>
        <div className="quest-result-art">
          <span className="quest-result-halo" />
          <ForestSpirit variant={result.node - 1} defeated />
          <span className="quest-result-ribbon">
            {result.practice ? "探索成功" : "新的旅程印記"}
          </span>
          <div className="quest-result-stars">
            <StarShard />
            <StarShard />
            <StarShard />
          </div>
        </div>
        <h2>{encounter.name}</h2>
        <p className="quest-result-story">「{encounter.thanks}」</p>
        {result.practice ? (
          <div className="quest-result-rewards">
            <GameIcon name="tab-map" />
            <p>
              自由探索不消耗次數，也不發正式獎勵。
              <br />
              記錄新的一天，就能繼續主線、收集印記。
            </p>
          </div>
        ) : (
          <div className="quest-result-rewards">
            <span>
              <GameIcon name="report" />
              <b>{ROUTES.find((r) => r.id === result.route)?.mark}</b>
            </span>
            <span>
              <strong>+30</strong>
              <small>成長 EXP</small>
            </span>
            {result.node % 5 === 0 && <StarCurrency amount={1} purple />}
          </div>
        )}
        <button
          className="star-button quest-primary"
          disabled={busy}
          onClick={() =>
            result.practice
              ? explore((result.node % 15) + 1)
              : leaveResult("collection")
          }
        >
          {result.practice ? "再探索一次" : "到圖鑑看看新印記"}
          <span>→</span>
        </button>
        <button
          className="quest-secondary"
          disabled={busy}
          onClick={() => leaveResult("lobby")}
        >
          回到冒險入口
        </button>
      </main>
    );
  }
  if (active) {
    const progress = searchProgress(active);
    const encounter = encounterFor(active.node);
    const slots =
      active.route === "forest"
        ? [
            [76, 26],
            [25, 18],
            [57, 43],
          ]
        : [
            [25, 18],
            [76, 26],
            [57, 43],
          ];
    return (
      <main className="quest-page quest-play">
        <header className="quest-page-header">
          <button
            className="quest-back"
            disabled={acting}
            aria-label={active.practice ? "離開自由探索" : "保存進度，返回首頁"}
            onClick={() =>
              active.practice ? setPractice(null) : navigate("town")
            }
          >
            ‹
          </button>
          <div>
            <span className="quest-kicker">
              {active.practice
                ? "自由探索 · 不消耗次數"
                : `第 ${String(active.node).padStart(2, "0")} 段 · ${ROUTES.find((r) => r.id === active.route)?.name}`}
            </span>
            <h1 ref={headingRef} tabIndex={-1}>
              幫{encounter.name}找星片
            </h1>
          </div>
          <HowToPlay />
        </header>
        <section className="quest-objective" aria-label="本次冒險目標">
          <div>
            <span className="quest-objective-icon">
              <GameIcon name="tab-quest" />
            </span>
            <div>
              <strong>
                {acting
                  ? "星光正在回到手帳…"
                  : progress.found === 2
                    ? "最後一片，就快完成了！"
                    : "點一下場景裡發光的星片"}
              </strong>
              <small>
                {active.practice
                  ? "輕鬆探索，沒有倒數"
                  : "找齊 3 片，就能收下這次相遇的印記"}
              </small>
            </div>
          </div>
          <div
            className="quest-progress"
            role="progressbar"
            aria-label="已找到的星片"
            aria-valuenow={progress.found}
            aria-valuemin={0}
            aria-valuemax={3}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < progress.found ? "is-found" : ""}>
                <StarShard />
              </span>
            ))}
            <b>{progress.found}/3</b>
          </div>
        </section>
        <Diorama
          className={`quest-play-scene ${acting ? "is-casting" : ""}`}
          reduced={profile.preferences?.reduceMotion}
        >
          <span className="quest-scene-location">
            <i />
            風鈴庭院
          </span>
          <div className="quest-play-hero">
            <PaintedCharacter
              key={castKey}
              look={look}
              action={castKey ? "cast" : "idle"}
              reduced={profile.preferences?.reduceMotion}
            />
          </div>
          <div className="quest-play-spirit">
            <ForestSpirit variant={active.node - 1} hit={acting} />
          </div>
          {friend && (
            <div className="quest-play-friend">
              <LittleFriend kind={friend.look} />
            </div>
          )}
          {slots.map(([x, y], index) => (
            <button
              key={index}
              data-index={index}
              className={`quest-hotspot ${index < progress.found ? "is-found" : index === progress.target ? "is-target" : "is-waiting"}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              disabled={acting || busy || index !== progress.target}
              aria-label={`第 ${index + 1} 片星光，${index < progress.found ? "已找到" : index === progress.target ? "點一下收集" : "稍後尋找"}`}
              onClick={() => act("cast")}
            >
              <span className="quest-hotspot-ring" />
              <StarShard />
              {index === progress.target && (
                <span className="quest-hotspot-label">點我收集</span>
              )}
              {index < progress.found && <b>✓</b>}
            </button>
          ))}
          {acting && (
            <span
              className="quest-capture-flare"
              key={castKey}
              aria-hidden="true"
            />
          )}
          <div className="quest-scene-caption">
            <strong>{encounter.name}</strong>
            <span>
              {acting
                ? "謝謝！星光又亮了一點。"
                : progress.found
                  ? "快找齊了，我們一起加油。"
                  : encounter.request}
            </span>
          </div>
        </Diorama>
        <div className="quest-play-actions">
          <p className="quest-action-hint" role="status">
            {inlineError ||
              (acting
                ? active.practice
                  ? "正在收下星片…"
                  : "正在收下星片，進度會自動保存。"
                : `第 ${Math.min(3, progress.found + 1)} 片亮起了。點星片或下方按鈕，都能收集。`)}
          </p>
          <button
            className="star-button quest-primary"
            disabled={acting || busy}
            onClick={() => act("cast")}
          >
            <StarShard />
            {acting
              ? "收集星片中…"
              : progress.found === 2
                ? "收集最後一片"
                : "收集發光星片"}
            <span>→</span>
          </button>
          <div className="quest-assist-row">
            {friend && (
              <button disabled={acting || busy} onClick={() => act("friend")}>
                <GameIcon name="wardrobe" />
                {friend.name}幫忙
              </button>
            )}
            <button disabled={acting || busy} onClick={() => act("quick")}>
              輕鬆完成{" "}
              <small>{active.practice ? "不消耗次數" : "獎勵相同"}</small>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const ready = guide.step === 1;
  const completed = guide.step === 2;
  const encounter = encounterFor(Math.min(15, node.index));
  return (
    <main className="quest-page quest-lobby">
      <header className="quest-page-header">
        <div>
          <span className="quest-kicker">每一段旅程，都有一份相遇</span>
          <h1 ref={headingRef} tabIndex={-1}>
            今天的小冒險
          </h1>
        </div>
        <HowToPlay />
      </header>
      <JourneySteps step={guide.step} onSelect={goStep} />
      <section className={`quest-ready-card ${completed ? "is-complete" : ""}`}>
        <Diorama reduced={profile.preferences?.reduceMotion}>
          <div className="quest-ready-copy">
            <span className="quest-ready-badge">
              {completed
                ? "今日完成"
                : ready
                  ? `${profile.journey.pendingDates.length} 次冒險已準備`
                  : "下一次相遇"}
            </span>
            <h2>
              {completed ? (
                <>
                  今天的相遇，
                  <br />
                  收好了。
                </>
              ) : (
                encounter.name
              )}
            </h2>
            <p>
              {completed
                ? "你的印記已收進圖鑑。\n明天記錄後，再出發找新朋友。"
                : encounter.request}
            </p>
          </div>
          <div className="quest-ready-spirit">
            <ForestSpirit
              variant={
                completed
                  ? Math.max(0, profile.journey.completed - 1)
                  : Math.min(14, node.index - 1)
              }
              defeated={completed}
            />
          </div>
        </Diorama>
        <div className="quest-ready-footer">
          <GameIcon name="report" />
          <span>
            {completed
              ? `已收藏 ${profile.journey.stamps.length} 枚旅程印記`
              : "完成獎勵：相遇印記 + 30 EXP"}
          </span>
        </div>
      </section>
      {!completed && (
        <fieldset className="quest-route-picker">
          <legend>為這次相遇，選一款紀念印記</legend>
          {ROUTES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === route}
              onClick={() => setRoute(r.id)}
            >
              <GameIcon name={r.id === "library" ? "report" : "tab-map"} />
              <span>
                <strong>{r.mark}</strong>
                <small>
                  {r.id === "library" ? "把故事收進書頁" : "留下森林的記憶"}
                </small>
              </span>
              <b>{r.id === route ? "✓" : ""}</b>
            </button>
          ))}
        </fieldset>
      )}
      <button
        className="star-button quest-primary"
        disabled={busy}
        onClick={() =>
          completed
            ? navigate("collection", { tab: "stamps" })
            : ready
              ? beginJourney(route)
              : openEntry()
        }
      >
        {completed
          ? "看看今天的旅程印記"
          : ready
            ? "開始冒險 · 找齊 3 片星光"
            : "先記帳，準備一次冒險"}
        <span>→</span>
      </button>
      {!completed && !ready && (
        <button
          className="quest-secondary"
          disabled={busy}
          onClick={() => recordAction("zero")}
        >
          今天沒有花錢，確認零消費
        </button>
      )}
      <button className="quest-explore-button" onClick={() => explore()}>
        <span>
          <GameIcon name="tab-map" />
        </span>
        <span>
          <strong>
            {completed ? "還想再玩？自由探索" : "先試玩一次，自由探索"}
          </strong>
          <small>不扣次數、不發獎勵，隨時可以玩</small>
        </span>
        <b>→</b>
      </button>
      <details className="quest-chapter-list">
        <summary>
          <span>我的旅程地圖</span>
          <small>{profile.journey.completed} / 15 段</small>
          <b>⌄</b>
        </summary>
        {CHAPTERS.map((chapter, chapterIndex) => (
          <section key={chapter.id}>
            <h2>{chapter.name}</h2>
            {chapter.nodes.map((name, index) => {
              const number = chapterIndex * 5 + index + 1;
              const done = number <= profile.journey.completed;
              return (
                <div key={name}>
                  <button
                    className={number === node.index ? "is-current" : ""}
                    onClick={() =>
                      setInspected(inspected === number ? null : number)
                    }
                    aria-expanded={inspected === number}
                  >
                    <span>{done ? "✓" : number}</span>
                    <strong>{name}</strong>
                    <small>
                      {done
                        ? "已收藏"
                        : number === node.index
                          ? "下一站"
                          : "待解鎖"}
                    </small>
                  </button>
                  {inspected === number && (
                    <p>
                      {done
                        ? "這次相遇已收進你的旅程圖鑑。"
                        : number === node.index
                          ? "準備一次冒險後，就能走到這一站。"
                          : "完成前一段旅程後開啟。跨月或漏記都不會歸零。"}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        ))}
      </details>
    </main>
  );
}
