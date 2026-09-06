import { useState } from "react";
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
import { WorldDialog } from "../../components/starpage/WorldUI";
import CharacterInspector from "../../components/atelier/CharacterInspector";
import WindIcon from "../../components/atelier/WindIcon";
import { ATELIER_ITEMS } from "../../atelierAssets";
const TABS = [
  ["wardrobe", "造型"],
  ["shop", "小店"],
  ["catalog", "圖鑑"],
  ["stamps", "旅程印記"],
];
function ItemArt({ item }) {
  return item.slot === "companion" ? (
    <LittleFriend kind={item.look} />
  ) : (
    <img src={ATELIER_ITEMS[item.id]} alt="" draggable="false" />
  );
}
export default function CollectionScreen() {
  const { state, equip, buy, updateGame, navigate } = useApp();
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
  const [sourceOpen, setSourceOpen] = useState(false);
  const [inspecting, setInspecting] = useState(false);
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
  const ownedCount = ITEMS.filter((i) => owns(profile, i.id)).length;
  function select(next) {
    setSelected(next.id);
    setSlot(next.slot);
    setLook((current) => ({ ...current, [next.slot]: next.id }));
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
    if (owned && !allOwned) {
      const missing = Object.values(look).find(
        (id) => id && !owns(profile, id),
      );
      select(ITEM_BY_ID[missing]);
      setTab("wardrobe");
      return;
    }
    if (!owned && item.cost) {
      if (await buy(item.id, true))
        setLook(
          normalizeLook({ ...profile.equipped.layered, [item.slot]: item.id }),
        );
    } else if (allOwned) await equip(look);
  }
  if (tab === "stamps")
    return (
      <main className="star-page wind-album">
        <PageHead eyebrow="沿途的每一次相遇" title="旅程印記">
          <span>{profile.journey.stamps.length}/15</span>
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
    <main className="wind-atelier">
      <header className="wind-topbar">
        <button
          className="wind-icon-button"
          onClick={() => navigate("town")}
          aria-label="返回庭院"
        >
          <WindIcon name="back" />
        </button>
        <div className="wind-wordmark">
          <span>WIND ATELIER</span>
          <h1>旅人的衣櫥</h1>
        </div>
        <button
          className="wind-balance"
          aria-label="星幣餘額與取得方式"
          onClick={() => setSourceOpen(true)}
        >
          <StarCurrency amount={profile.stars.yellow} />
          <StarCurrency amount={profile.stars.purple} purple />
        </button>
      </header>
      <div className="wind-mode-bar">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            onClick={() => changeTab(id)}
          >
            {label}
          </button>
        ))}
        <span>
          {ownedCount}
          <small> / {ITEMS.length}</small>
        </span>
      </div>
      <div className="wind-look-caption" key={look.top}>
        <span>{changed ? "FITTING · 試穿中" : "YOUR LOOK · 目前造型"}</span>
        <h2>{ITEM_BY_ID[look.top]?.name.replace("套裝", "")}</h2>
        <p>
          {look.top === "top_starlight"
            ? "把夜空的星光，穿進旅途。"
            : "清風為伴，向雲海出發。"}
        </p>
      </div>
      <div className="wind-hero-stage">
        <PaintedCharacter
          look={look}
          staticPreview={inspecting || !!state.entryDraft}
          interactive
          reduced={profile.preferences?.reduceMotion}
        />
      </div>
      {friend && (
        <div className="wind-hero-friend">
          <LittleFriend kind={friend.look} />
        </div>
      )}
      <div className="wind-body-slots" aria-label="選擇換裝部位">
        {SLOTS.map((s) => (
          <button
            key={s.id}
            aria-pressed={slot === s.id}
            onClick={() => {
              setSlot(s.id);
              setSelected(look[s.id]);
              setTab("wardrobe");
            }}
          >
            <span>
              <WindIcon name={s.id} />
            </span>
            <b>{s.label}</b>
          </button>
        ))}
      </div>
      <div className="wind-stage-tools">
        <button onClick={() => setInspecting(true)} aria-label="放大查看角色">
          <WindIcon name="expand" />
          <span>細節</span>
        </button>
        {changed && (
          <button
            onClick={() => {
              setLook(normalizeLook(profile.equipped.layered));
              setSelected(profile.equipped.layered[slot]);
            }}
          >
            <WindIcon name="undo" />
            <span>還原</span>
          </button>
        )}
      </div>
      <section className="wind-wardrobe-tray" aria-label="收藏與裝備">
        <div className="wind-tray-heading">
          <span>
            {tab === "shop"
              ? "星光小店"
              : tab === "catalog"
                ? "全部收藏"
                : SLOTS.find((s) => s.id === slot)?.label}
            <small> · 點選試穿</small>
          </span>
          <button
            aria-label="收藏說明與經典收藏"
            onClick={() => setSourceOpen(true)}
          >
            <WindIcon name="more" />
          </button>
        </div>
        <div className="wind-item-rail">
          {tab === "wardrobe" &&
            ["hat", "prop", "companion"].includes(slot) && (
              <button
                className="wind-item wind-item-none"
                aria-pressed={!look[slot]}
                onClick={() => {
                  setLook((l) => ({ ...l, [slot]: null }));
                  setSelected(null);
                }}
              >
                <span className="wind-item-image">
                  <WindIcon name="close" />
                </span>
                <strong>
                  {slot === "hat"
                    ? "取下帽飾"
                    : slot === "prop"
                      ? "不帶隨身物"
                      : "獨自出發"}
                </strong>
                <small>自由搭配</small>
              </button>
            )}
          {visible.map((i) => (
            <button
              key={i.id}
              className={`wind-item wind-item--${i.slot}`}
              aria-pressed={selected === i.id}
              onClick={() => select(i)}
            >
              <span className="wind-item-image">
                <ItemArt item={i} />
                {selected === i.id && (
                  <i>
                    <WindIcon name="check" />
                  </i>
                )}
              </span>
              <strong>{i.name.replace("套裝", "")}</strong>
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
            </button>
          ))}
        </div>
        <div className="wind-equip-row">
          <div className="wind-equip-status" aria-live="polite">
            <strong>{item?.name ?? "輕裝出發"}</strong>
            <span>
              {!owned
                ? item.cost
                  ? shortfall
                    ? `還差 ${shortfall} 顆${item.currency === "purple" ? "紫星" : "黃星"}`
                    : `現有 ${balance} 顆 · 兌換後裝備`
                  : item.source
                : !allOwned
                  ? "搭配中還有未取得的收藏"
                  : changed
                    ? "搭配好了，就出發吧。"
                    : "正穿著這套搭配"}
            </span>
          </div>
          {!owned && item.cost && (
            <button
              className="wind-save-wish"
              aria-label={
                profile.wishlist?.includes(item.id) ? "移出心願" : "加入心願"
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
              <WindIcon name="heart" />
            </button>
          )}
          {!owned && !item.cost ? (
            <button
              className="wind-equip"
              onClick={() => navigate("journal", { tab: "goals" })}
            >
              看進度 <WindIcon name="arrow" />
            </button>
          ) : (
            <button
              className="wind-equip"
              disabled={state.busy || (!owned ? shortfall > 0 : !changed)}
              onClick={wear}
            >
              {!owned ? (
                <>
                  <span>兌換{item.slot === "companion" ? "同行" : "穿上"}</span>
                  <StarCurrency
                    amount={item.cost}
                    purple={item.currency === "purple"}
                  />
                </>
              ) : (
                <>
                  {!allOwned ? "查看待兌換" : changed ? "穿上" : "已穿上"}
                  <WindIcon name={changed ? "arrow" : "check"} />
                </>
              )}
            </button>
          )}
        </div>
      </section>
      {inspecting && (
        <CharacterInspector
          look={look}
          reduced={profile.preferences?.reduceMotion}
          onClose={() => setInspecting(false)}
        />
      )}
      {sourceOpen && (
        <WorldDialog
          title="把日常變成收藏"
          onClose={() => setSourceOpen(false)}
          className="wind-guide-dialog"
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
              本週記錄 5 天另有 5 黃星。每日獎勵只發一次，不需要多花錢或拆單。
            </small>
            <button
              className="world-primary"
              onClick={() => navigate("journal", { tab: "goals" })}
            >
              查看成長手帳 <WindIcon name="arrow" />
            </button>
            <div className="wind-legacy-links">
              <button onClick={() => navigate("profile", { tab: "wardrobe" })}>
                經典造型收藏 ›
              </button>
              <button onClick={() => navigate("shop")}>舊票兌換櫃 ›</button>
            </div>
          </div>
        </WorldDialog>
      )}
    </main>
  );
}
