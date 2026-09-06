import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useApp } from "../../useAppStore";
import {
  FIELD_OBJECTS,
  fieldState,
  fieldLook,
  fieldQuest,
  fieldAction,
  objectAvailable,
} from "../../game/exploration";
import { RelicIcon, WorldDialog } from "../../components/starpage/WorldUI";
import { StarCurrency } from "../../components/starpage/Chrome";
import FieldCanvas from "../../components/exploration/FieldCanvas";
import FieldWardrobe from "../../components/exploration/FieldWardrobe";
const positions = new Map();
function MiniMap({ position, target, onClick }) {
  const px = (x) => ((x + 16) / 32) * 100,
    pz = (z) => ((z + 26) / 36) * 100;
  return (
    <button
      className="field-minimap"
      aria-label="開啟原野地圖與探索目標"
      onClick={onClick}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="49" fill="#809774" />
        <path
          d="M47 90 Q54 68 48 49 T49 13"
          fill="none"
          stroke="#e5d6b1"
          strokeWidth="8"
        />
        <ellipse cx="83" cy="42" rx="10" ry="8" fill="#94ced2" />
        <path d="M35 12h27v13H35zM23 65h14v12H23z" fill="#d6d1ae" />
        {FIELD_OBJECTS.filter((o) => o.kind !== "flower").map((o) => (
          <circle
            key={o.id}
            cx={px(o.x)}
            cy={pz(o.z)}
            r={o.id === target ? 4 : 2}
            fill={o.id === target ? "#ffe5a3" : "#f7f1d9"}
          />
        ))}
        <path
          d="M0 -5 L4 4 L0 2 L-4 4Z"
          transform={`translate(${px(position.x)} ${pz(position.z)})`}
          fill="#fff"
          stroke="#42636b"
          strokeWidth="1"
        />
      </svg>
      <span>N</span>
    </button>
  );
}
function Joystick({ api }) {
  const [stick, setStick] = useState({ x: 0, y: 0 }),
    active = useRef(null);
  const move = (e) => {
    if (active.current !== e.pointerId) return;
    const r = e.currentTarget.getBoundingClientRect(),
      dx = e.clientX - r.left - r.width / 2,
      dy = e.clientY - r.top - r.height / 2,
      length = Math.hypot(dx, dy),
      scale = length > 34 ? 34 / length : 1;
    const x = dx * scale,
      y = dy * scale;
    setStick({ x, y });
    api.current?.input(x / 34, y / 34);
  };
  const stop = () => {
    active.current = null;
    setStick({ x: 0, y: 0 });
    api.current?.input(0, 0);
  };
  return (
    <div
      className="field-joystick"
      aria-label="拖曳搖桿移動角色"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
    >
      <i />
      <b style={{ transform: `translate(${stick.x}px,${stick.y}px)` }} />
      <span>移動</span>
    </div>
  );
}
export default function FieldPrototypeScreen() {
  const { state, navigate, openEntry, updateGame } = useApp(),
    api = useRef(null),
    systemReduced = useReducedMotion();
  const [frame, setFrame] = useState({
    position: positions.get(state.user.uid) ?? { x: 0, z: 5 },
    nearest: null,
    marker: null,
    traveling: false,
  });
  const [modal, setModal] = useState(null),
    [unavailable, setUnavailable] = useState(false),
    [reward, setReward] = useState(null),
    [running, setRunning] = useState(false);
  const field = useMemo(() => fieldState(state.profile), [state.profile]),
    look = useMemo(() => fieldLook(state.profile), [state.profile]);
  const quest = fieldQuest(field),
    reduced = !!systemReduced || !!state.profile.preferences?.reduceMotion;
  const paused =
    !!modal ||
    !!state.entryDraft ||
    state.busy ||
    !state.profile.onboardingDone;
  const config = useMemo(
    () => ({
      look,
      field,
      reduced,
      paused,
      position: positions.get(state.user.uid),
    }),
    [look, field, reduced, paused, state.user.uid],
  );
  const remaining =
    (state.dayRecord.budget ?? state.profile.dailyBudget) - state.totalSpent;
  const act = async (action, message, prize) => {
    const success = await updateGame((p) => fieldAction(p, action), message);
    if (success && prize) {
      setReward(prize);
      setModal("reward");
    }
    return success;
  };
  const interact = (id) => {
    if (state.busy) return;
    const object = FIELD_OBJECTS.find((o) => o.id === id);
    if (!object) return;
    if (object.kind === "npc") {
      setModal("npc");
      if (!field.introduced) act({ type: "talk" });
    }
    if (object.kind === "flower")
      act({ type: "gather", id }, "風鈴花已收進行囊。");
    if (object.kind === "beacon")
      act({ type: "ignite", id }, `${object.name}亮起了。`);
    if (object.kind === "chest")
      act({ type: "open" }, undefined, {
        name: "微光精靈",
        description: "這束微光會跟著你，一起走過原野。",
        type: "wisp",
      });
    if (object.kind === "landmark")
      act({ type: "discover", id }, `已收藏風景：${object.name}`);
  };
  const guide = (id) => {
    if (id) api.current?.travel(id);
  };
  const near = frame.nearest;
  const actionLabel = near
    ? near.kind === "npc"
      ? "交談"
      : near.kind === "flower"
        ? "採集"
        : near.kind === "beacon"
          ? "點亮"
          : near.kind === "chest"
            ? "開啟"
            : "收藏風景"
    : "靠近發光物";
  return (
    <main className="field-screen">
      <FieldCanvas
        api={api}
        config={config}
        onFrame={(value) => {
          positions.set(state.user.uid, value.position);
          setFrame(value);
        }}
        onInteract={interact}
        onUnavailable={() => setUnavailable(true)}
      />
      <div className="field-edge-shade" aria-hidden="true" />
      <header className="field-topline">
        <MiniMap
          position={frame.position}
          target={quest.target}
          onClick={() => setModal("map")}
        />
        <div className="field-location">
          <span>STARWIND MEADOW</span>
          <h1>星風原野</h1>
          <small>微風正好，出門走走。</small>
        </div>
        <button
          className="field-icon-button"
          aria-label="個人資料與設定"
          onClick={() => navigate("settings")}
        >
          ☼
        </button>
      </header>
      <button
        className="field-quest"
        onClick={() => (quest.target ? guide(quest.target) : setModal("map"))}
      >
        <span className="field-quest-diamond">◇</span>
        <span>
          <small>{quest.chapter}</small>
          <strong>{quest.title}</strong>
          <em>
            {quest.detail} <b>{quest.target ? "›" : ""}</b>
          </em>
        </span>
      </button>
      <div className="field-side-tools">
        <button onClick={() => setModal("wardrobe")}>
          <RelicIcon kind="coat" />
          <b>造型</b>
        </button>
        <button onClick={() => setModal("bag")}>
          <RelicIcon kind="bag" />
          <b>行囊</b>
        </button>
      </div>
      {frame.marker && !modal && (
        <span
          className={`field-object-label ${near?.id === frame.marker.id ? "is-near" : ""}`}
          style={{ left: `${frame.marker.x}%`, top: `${frame.marker.y}%` }}
        >
          {frame.marker.name}
          {near?.id === frame.marker.id && <small>可以互動</small>}
        </span>
      )}
      {frame.traveling && (
        <button className="field-travel" onClick={() => api.current?.stop()}>
          正走向目的地 <span>停止 ×</span>
        </button>
      )}
      <div className="field-controls">
        <Joystick api={api} />
        <div className="field-action-cluster">
          <button
            className="field-small-action"
            aria-label="跳躍"
            onClick={() => api.current?.jump()}
          >
            ↟<small>跳躍</small>
          </button>
          <button
            className="field-interact"
            disabled={!near || state.busy || paused}
            onClick={() => api.current?.interact()}
          >
            <span>{near ? "✦" : "◇"}</span>
            <b>{state.busy ? "儲存中" : actionLabel}</b>
          </button>
          <button
            className="field-small-action"
            aria-pressed={running}
            onClick={() => {
              setRunning(!running);
              api.current?.run(!running);
            }}
          >
            »<small>{running ? "奔跑中" : "奔跑"}</small>
          </button>
        </div>
      </div>
      <div className="field-player-line">
        <span>
          {state.profile.playerName} <small>Lv. {state.profile.level}</small>
        </span>
        <i />
        <button onClick={() => setModal("help")}>操作說明</button>
      </div>
      <nav className="field-dock" aria-label="主要導覽">
        <button onClick={() => navigate("journal")}>
          <RelicIcon kind="book" />
          <span>
            手帳<small>支出 ${state.totalSpent.toLocaleString("zh-TW")}</small>
          </span>
        </button>
        <button className="field-entry" onClick={() => openEntry()}>
          <span>＋</span>
          <b>記一筆</b>
        </button>
        <button onClick={() => navigate("adventure")}>
          <RelicIcon kind="map" />
          <span>
            章節冒險
            <small>
              {state.profile.journey.pendingDates.length > 0
                ? "可以出發"
                : "查看旅程"}
            </small>
          </span>
        </button>
      </nav>
      {unavailable && (
        <button
          className="field-accessible-entry field-primary"
          onClick={() => setModal("accessible")}
        >
          使用文字探索
        </button>
      )}
      {modal === "wardrobe" && (
        <FieldWardrobe onClose={() => setModal(null)} reduced={reduced} />
      )}
      {modal && modal !== "wardrobe" && (
        <WorldDialog
          title={
            {
              npc: "米菈 · 風鈴工匠",
              map: "星風原野",
              bag: "旅人的行囊",
              help: "在原野自在走走",
              reward: "新的旅途收藏",
              accessible: "文字探索",
            }[modal]
          }
          onClose={() => setModal(null)}
          className={`field-panel field-panel--${modal}`}
        >
          {modal === "npc" && (
            <>
              <p className="field-dialog-eyebrow">工匠的委託 · 風鈴胸針</p>
              <p className="field-dialog-story">
                {!field.brooch
                  ? field.flowers.length < 3
                    ? "「你也聽見風鈴的聲音了嗎？幫我帶回三朵藍白色的風鈴花，我想為你做一枚旅人的胸針。」"
                    : "「這些花還帶著微風呢。把它们編在一起，就能喚醒遺跡裡沉睡的古燈。」"
                  : field.treasure
                    ? "「它好像很喜歡你。帶上這位新朋友，再去看看湖邊的風景吧。」"
                    : "「胸針裡留著風的記憶。去碰觸原野上的三座古燈，看看它們會帶你找到什麼。」"}
              </p>
              {!field.brooch && (
                <div className="field-materials">
                  <span>風鈴花</span>
                  <b>{field.flowers.length} / 3</b>
                </div>
              )}
              {!field.brooch && field.flowers.length >= 3 ? (
                <button
                  className="field-primary"
                  disabled={state.busy}
                  onClick={() =>
                    act({ type: "craft" }, undefined, {
                      name: "風鈴胸針",
                      description: "用三朵風鈴花編成，已佩戴在你的披肩上。",
                      type: "brooch",
                    })
                  }
                >
                  製作並佩戴胸針
                </button>
              ) : (
                <button
                  className="field-primary"
                  onClick={() => setModal(null)}
                >
                  我去看看
                </button>
              )}
            </>
          )}
          {modal === "reward" && (
            <>
              <div className={`field-prize field-prize--${reward.type}`}>✧</div>
              <h3>{reward.name}</h3>
              <p>{reward.description}</p>
              <button
                className="field-primary"
                onClick={() => setModal("wardrobe")}
              >
                看看身上的新收藏
              </button>
              <button
                className="field-text-button"
                onClick={() => setModal(null)}
              >
                繼續散步
              </button>
            </>
          )}
          {modal === "map" && (
            <>
              <p className="field-dialog-eyebrow">
                一處小原野，幾個值得停下來的地方
              </p>
              <div className="field-map-art">
                <MiniMap
                  position={frame.position}
                  target={quest.target}
                  onClick={() => setModal(null)}
                />
              </div>
              <h3>{quest.title}</h3>
              <p>{quest.detail}</p>
              <button className="field-primary" onClick={() => setModal(null)}>
                回到原野 · 點任務可引路
              </button>
              <div className="field-landmarks">
                {FIELD_OBJECTS.filter((o) => o.kind === "landmark").map((o) => (
                  <span key={o.id}>
                    {field.visited.includes(o.id) ? "✓" : "◇"} {o.name}
                  </span>
                ))}
              </div>
            </>
          )}
          {modal === "bag" && (
            <>
              <p className="field-dialog-eyebrow">探索所得</p>
              <div className="field-bag-totals">
                <span>
                  <b>{field.flowers.length}/6</b>風鈴花
                </span>
                <span>
                  <b>{field.lit.length}/3</b>已亮古燈
                </span>
                <span>
                  <b>{field.visited.length}/3</b>風景印記
                </span>
              </div>
              <p>
                {field.brooch
                  ? "風鈴胸針已製作"
                  : "帶回 3 朵風鈴花，請米菈製作胸針。"}
                {field.treasure ? " · 微光精靈已加入旅途" : ""}
              </p>
              <button
                className="field-primary"
                onClick={() => setModal("wardrobe")}
              >
                查看與搭配收藏
              </button>
              <div className="field-bag-wallet">
                <span>記帳星幣</span>
                <StarCurrency amount={state.profile.stars.yellow} />
                <StarCurrency amount={state.profile.stars.purple} purple />
              </div>
              <p className="field-small-print">
                探索不消耗記帳資格。星幣用於原本的小店，原野收藏由遊玩取得。
              </p>
            </>
          )}
          {modal === "help" && (
            <>
              <p>
                用左下搖桿移動，或點地面讓旅人走過去。拖曳場景可以轉動鏡頭。
              </p>
              <p>
                靠近發光物或人物，按右下互動。點左上任務文字會自動引路，仍由你決定何時互動。
              </p>
              <p>
                鍵盤：WASD／方向鍵移動、Shift 奔跑、空白鍵跳躍、E
                互動。所有目的地也可由任務引路到達。
              </p>
              <p>
                造型裡可以分別更换髮型、服裝、頭飾和隨身物，拖曳人物檢查搭配，再按「穿上這套」。
              </p>
              <p>
                今天剩餘預算 ${remaining.toLocaleString("zh-TW")}
                。隨時按下方「記一筆」，返回後接著探索。
              </p>
              <button
                className="field-primary"
                onClick={() => {
                  api.current?.center();
                  setModal(null);
                }}
              >
                知道了
              </button>
            </>
          )}
          {modal === "accessible" && (
            <>
              <p>這裡提供同一份探索進度的文字操作，取得的收藏也會保留。</p>
              <div className="field-accessible-list">
                {FIELD_OBJECTS.filter((o) => objectAvailable(o, field)).map(
                  (o) => (
                    <button
                      key={o.id}
                      disabled={state.busy}
                      onClick={() => interact(o.id)}
                    >
                      {o.name} <span>互動 ›</span>
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </WorldDialog>
      )}
    </main>
  );
}
