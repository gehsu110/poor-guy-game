import { useEffect, useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import {
  DISPLAY_ITEMS as ITEMS,
  ITEM_BY_ID,
  DISPLAY_SLOTS as SLOTS,
  normalizeLook,
  owns,
} from "../../game/catalog";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import JourneyAlbum from "../../components/starpage/JourneyAlbum";
import { PageHead, Tabs, StarCurrency } from "../../components/starpage/Chrome";
import {
  WorldHeader,
  RelicIcon,
  WorldDialog,
} from "../../components/starpage/WorldUI";
const TABS = [
  ["wardrobe", "造型"],
  ["shop", "小店"],
  ["catalog", "圖鑑"],
  ["stamps", "旅程印記"],
];
function ItemArt({ item, look }) {
  return item.slot === "companion" ? (
    <LittleFriend kind={item.look} />
  ) : (
    <PaintedCharacter look={{ ...look, [item.slot]: item.id }} reduced />
  );
}
export default function CollectionScreen() {
  const { state, equip, buy, updateGame, navigate } = useApp();
  const stageRef = useRef(null),
    inventoryRef = useRef(null);
  const profile = state.profile,
    requested = ITEM_BY_ID[state.screenParams.item];
  const initial = requested?.artReady
    ? requested
    : state.screenParams.tab === "shop"
      ? (ITEMS.find((i) => i.cost && !owns(profile, i.id)) ??
        ITEMS.find((i) => i.cost))
      : null;
  const [tab, setTab] = useState(
    TABS.some(([id]) => id === state.screenParams.tab)
      ? state.screenParams.tab
      : "wardrobe",
  );
  const [slot, setSlot] = useState(initial?.slot ?? "top");
  const [look, setLook] = useState(
    normalizeLook(
      initial
        ? { ...profile.equipped.layered, [initial.slot]: initial.id }
        : profile.equipped.layered,
    ),
  );
  const [selected, setSelected] = useState(initial?.id ?? look[slot]);
  const [greeting, setGreeting] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const item = ITEM_BY_ID[selected],
    friend = ITEM_BY_ID[look.companion];
  const allOwned = Object.values(look).every((id) => !id || owns(profile, id));
  const changed =
    JSON.stringify(look) !==
      JSON.stringify(normalizeLook(profile.equipped.layered)) ||
    profile.equipped.visualStyle !== "layered";
  const visible = ITEMS.filter((i) =>
    tab === "shop" ? !!i.cost : tab === "catalog" ? true : i.slot === slot,
  );
  useEffect(() => {
    if (!inventoryRef.current || !stageRef.current) return;
    const measure = () =>
      stageRef.current?.style.setProperty(
        "--inventory-height",
        `${inventoryRef.current?.getBoundingClientRect().height ?? 254}px`,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(inventoryRef.current);
    measure();
    return () => observer.disconnect();
  }, [tab]);
  const ownedCount = ITEMS.filter((i) => owns(profile, i.id)).length;
  function select(next) {
    if (window.innerHeight < 700)
      requestAnimationFrame(() =>
        inventoryRef.current?.scrollIntoView({
          block: "center",
          behavior:
            profile.preferences?.reduceMotion ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
        }),
      );
    setSelected(next.id);
    setSlot(next.slot);
    setLook((current) => ({
      ...Object.fromEntries(
        Object.entries(current).map(([key, id]) => [
          key,
          !id || owns(profile, id) ? id : profile.equipped.layered[key],
        ]),
      ),
      [next.slot]: next.id,
    }));
  }
  function changeTab(next) {
    setTab(next);
    if (next === "shop" && !item?.cost)
      select(
        ITEMS.find((i) => i.cost && !owns(profile, i.id)) ??
          ITEMS.find((i) => i.cost),
      );
  }
  const owned = !item || owns(profile, item.id),
    balance = item ? (profile.stars[item.currency ?? "yellow"] ?? 0) : 0;
  const shortfall = item?.cost ? Math.max(0, item.cost - balance) : 0;
  async function wear() {
    if (!owned && item.cost) {
      if (await buy(item.id, true))
        setLook(
          normalizeLook({ ...profile.equipped.layered, [item.slot]: item.id }),
        );
    } else if (allOwned) await equip(look);
  }
  if (tab === "stamps")
    return (
      <main className="star-page world-album-page">
        <PageHead eyebrow="旅途裡的收藏簿" title="相遇的印記">
          <span className="star-count">{profile.journey.stamps.length}/15</span>
        </PageHead>
        <Tabs label="收藏內容" tabs={TABS} value={tab} onChange={changeTab} />
        <JourneyAlbum
          profile={profile}
          highlight={state.screenParams.stamp}
          onExplore={() => navigate("adventure")}
        />
      </main>
    );
  return (
    <main className="world-stage world-collection" ref={stageRef}>
      <WorldHeader
        title={
          tab === "shop"
            ? "星光小店"
            : tab === "catalog"
              ? "我的寶物圖鑑"
              : "旅人的造型間"
        }
        subtitle={`已收藏 ${ownedCount} / ${ITEMS.length} 件`}
        onBack={() => navigate("town")}
      >
        <button
          className="world-wallet"
          aria-label="查看小店"
          onClick={() => changeTab("shop")}
        >
          <StarCurrency amount={profile.stars.yellow} />
          <StarCurrency amount={profile.stars.purple} purple />
        </button>
      </WorldHeader>
      <div className="world-collection-tabs">
        <Tabs label="收藏內容" tabs={TABS} value={tab} onChange={changeTab} />
      </div>
      <div className="world-outfit-name">
        <span>{changed ? "試穿中" : "目前造型"}</span>
        <h2>{item?.name ?? "今天的搭配"}</h2>
        <p>{item?.desc ?? "替旅程選一個喜歡的模樣。"}</p>
      </div>
      <div className="world-fitting-pedestal" aria-hidden="true" />
      <div className="world-fitting-actor">
        <PaintedCharacter
          key={greeting}
          look={look}
          action={greeting ? "greet" : "idle"}
          interactive
          reduced={profile.preferences?.reduceMotion}
        />
      </div>
      {friend && (
        <div className="world-fitting-friend">
          <LittleFriend kind={friend.look} />
        </div>
      )}
      <button
        className="world-fitting-greet"
        onClick={() => setGreeting((g) => g + 1)}
        aria-label="預覽角色招呼動作"
      >
        <RelicIcon kind="star" />
        <span>打個招呼</span>
      </button>
      {changed && (
        <button
          className="world-fitting-reset"
          onClick={() => {
            setLook(normalizeLook(profile.equipped.layered));
            setSelected(profile.equipped.layered[slot]);
          }}
        >
          還原搭配
        </button>
      )}
      <section
        className="world-inventory"
        ref={inventoryRef}
        aria-label="收藏與裝備"
      >
        <div className="world-inventory-head">
          {tab === "wardrobe" ? (
            <div className="world-slot-switch">
              {SLOTS.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={slot === s.id}
                  onClick={() => {
                    setSlot(s.id);
                    setSelected(look[s.id]);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <strong>
              {tab === "shop" ? "挑一件喜歡的寶物" : "我的收藏"}{" "}
              <small>
                {ownedCount}/{ITEMS.length}
              </small>
            </strong>
          )}
          <button
            className="world-currency-help"
            onClick={() => setSourceOpen(true)}
          >
            星幣怎麼取得？
          </button>
        </div>
        <div className="world-item-strip">
          {tab === "wardrobe" && slot === "companion" && (
            <button
              className="world-item world-item-none"
              aria-pressed={!look.companion}
              onClick={() => {
                setLook((l) => ({ ...l, companion: null }));
                setSelected(null);
              }}
            >
              <span>＋</span>
              <strong>獨自出發</strong>
            </button>
          )}
          {visible.map((i) => (
            <button
              key={i.id}
              className="world-item"
              aria-pressed={selected === i.id}
              onClick={() => select(i)}
            >
              <div>
                <ItemArt item={i} look={look} />
              </div>
              <strong>{i.name}</strong>
              <small>
                {owns(profile, i.id) ? (
                  "已收藏"
                ) : i.cost ? (
                  <StarCurrency
                    amount={i.cost}
                    purple={i.currency === "purple"}
                  />
                ) : (
                  i.source
                )}
              </small>
              {selected === i.id && <b>✓</b>}
            </button>
          ))}
        </div>
        <div className="world-equipment-action">
          {!owned && !item.cost ? (
            <>
              <p>{item.source}後自動取得</p>
              <button
                className="world-primary"
                onClick={() => navigate("journal", { tab: "goals" })}
              >
                看看成長進度 ›
              </button>
            </>
          ) : (
            <>
              <p>
                {!owned
                  ? shortfall
                    ? `還差 ${shortfall} 顆${item.currency === "purple" ? "紫星" : "黃星"} · 目前有 ${balance} 顆`
                    : `目前有 ${balance} 顆，兌換後直接裝備`
                  : changed
                    ? "喜歡的話，就穿上出發吧。"
                    : "這個模樣，已經陪你出發了。"}
              </p>
              <div>
                <button
                  className="world-primary"
                  disabled={
                    state.busy ||
                    (!owned ? shortfall > 0 : !changed || !allOwned)
                  }
                  onClick={wear}
                >
                  {!owned
                    ? item.slot === "companion"
                      ? "兌換並同行"
                      : "兌換並穿上"
                    : !allOwned
                      ? "請先取得收藏"
                      : changed
                        ? "穿上這套搭配"
                        : "已穿上"}
                  {!owned && (
                    <StarCurrency
                      amount={item.cost}
                      purple={item.currency === "purple"}
                    />
                  )}
                </button>
                {!owned && (
                  <button
                    className="world-wishlist"
                    aria-label={
                      profile.wishlist?.includes(item.id)
                        ? "移出心願"
                        : "加入心願"
                    }
                    aria-pressed={!!profile.wishlist?.includes(item.id)}
                    disabled={state.busy}
                    onClick={() =>
                      updateGame((p) => ({
                        ...p,
                        wishlist: p.wishlist?.includes(item.id)
                          ? p.wishlist.filter((id) => id !== item.id)
                          : [...(p.wishlist ?? []), item.id],
                      }))
                    }
                  >
                    {profile.wishlist?.includes(item.id) ? "♥" : "♡"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      <div className="world-legacy-collection">
        <button onClick={() => navigate("profile", { tab: "wardrobe" })}>
          經典造型收藏
        </button>
        <button onClick={() => navigate("shop")}>舊票兌換櫃</button>
      </div>
      {sourceOpen && (
        <WorldDialog
          title="把日常變成星光"
          onClose={() => setSourceOpen(false)}
        >
          <div className="world-currency-guide">
            <p>
              <StarCurrency amount={2} /> 如實記錄一天，或確認零消費。
            </p>
            <p>
              <StarCurrency amount={1} /> 回顧今天的手帳。
            </p>
            <p>
              <StarCurrency amount={1} purple /> 完成一章旅程，或本週記錄 5 天。
            </p>
            <small>
              每週記錄 5 天還有 5 黃星。每天的獎勵只發一次，多記幾筆不會多領。
            </small>
            <button
              className="world-primary"
              onClick={() => {
                setSourceOpen(false);
                navigate("journal", { tab: "goals" });
              }}
            >
              翻開我的成長手帳 ›
            </button>
          </div>
        </WorldDialog>
      )}
    </main>
  );
}
