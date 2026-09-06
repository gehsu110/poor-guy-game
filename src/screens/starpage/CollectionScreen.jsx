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
import IllustratedScene, {
  GardenObject,
} from "../../components/starpage/IllustratedScene";
import JourneyAlbum from "../../components/starpage/JourneyAlbum";
import { HowToPlay } from "../../components/starpage/JourneyUX";
const COLLECTION_TABS = [
  ["wardrobe", "造型"],
  ["catalog", "圖鑑"],
  ["shop", "小店"],
  ["stamps", "旅程印記"],
];
import { PageHead, Tabs, StarCurrency } from "../../components/starpage/Chrome";
function ItemArt({ item, look }) {
  if (item.slot === "companion") return <LittleFriend kind={item.look} />;
  if (item.slot === "garden") return <GardenObject kind={item.look} />;
  return (
    <PaintedCharacter
      look={{ ...look, [item.slot]: item.id }}
      portrait={["hat", "hair"].includes(item.slot)}
      reduced
    />
  );
}
export default function CollectionScreen() {
  const { state, equip, buy, updateGame, navigate } = useApp();
  const requestedItem = ITEM_BY_ID[state.screenParams.item];
  const initialItem = requestedItem?.artReady
    ? requestedItem
    : state.screenParams.tab === "shop"
      ? (ITEMS.find((item) => item.cost && !owns(state.profile, item.id)) ??
        ITEMS.find((item) => item.cost))
      : null;
  const [tab, setTab] = useState(
    ["catalog", "shop", "stamps"].includes(state.screenParams.tab)
      ? state.screenParams.tab
      : "wardrobe",
  );
  const [slot, setSlot] = useState(initialItem?.slot ?? "top");
  const [look, setLook] = useState(
    normalizeLook(
      initialItem
        ? {
            ...state.profile.equipped.layered,
            [initialItem.slot]: initialItem.id,
          }
        : state.profile.equipped.layered,
    ),
  );
  const [selected, setSelected] = useState(initialItem?.id ?? look[slot]);
  const [action, setAction] = useState("idle");
  const [actionKey, setActionKey] = useState(0);
  const profile = state.profile;
  const item = ITEM_BY_ID[selected];
  const friend = ITEM_BY_ID[look.companion];
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
    setLook((current) => ({ ...current, [next.slot]: next.id }));
    setSlot(next.slot);
  }
  function changeTab(next) {
    setTab(next);
    if (next === "shop" && !item?.cost)
      select(
        ITEMS.find((item) => item.cost && !owns(profile, item.id)) ??
          ITEMS.find((item) => item.cost),
      );
  }
  if (tab === "stamps")
    return (
      <main className="star-page star-collection quest-collection">
        <PageHead eyebrow="屬於你的冒險手帳" title="把相遇，收成故事。">
          <HowToPlay />
        </PageHead>
        <Tabs
          label="收藏內容"
          tabs={COLLECTION_TABS}
          value={tab}
          onChange={changeTab}
        />
        <JourneyAlbum
          profile={profile}
          highlight={state.screenParams.stamp}
          onExplore={() => navigate("adventure")}
        />
      </main>
    );
  return (
    <main className="star-page star-collection quest-collection">
      <PageHead eyebrow="套裝、夥伴，還有旅途的紀念" title="把喜歡的，收起來。">
        <span className="star-count">
          {ownedCount} / {ITEMS.length}
        </span>
      </PageHead>
      <Tabs
        label="收藏內容"
        tabs={COLLECTION_TABS}
        value={tab}
        onChange={changeTab}
      />
      <section className="star-fitting-room">
        <IllustratedScene />
        <span className="star-fitting-label">
          {changed ? "正在試穿" : "目前的搭配"}
        </span>
        <div className="star-fitting-character">
          <PaintedCharacter
            key={actionKey}
            look={look}
            action={action}
            reduced={profile.preferences?.reduceMotion}
          />
        </div>
        {friend && (
          <div className="star-fitting-friend">
            <LittleFriend kind={friend.look} />
          </div>
        )}
        {look.garden && (
          <div className="star-fitting-garden">
            <GardenObject kind={ITEM_BY_ID[look.garden].look} />
          </div>
        )}
        <div className="star-motion-switch">
          {[
            ["idle", "待機"],
            ["greet", "招呼"],
          ].map(([id, name]) => (
            <button
              key={id}
              aria-pressed={action === id}
              onClick={() => {
                setAction(id);
                setActionKey((key) => key + 1);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </section>
      <section className="star-fitting-info">
        <div>
          <span className="star-eyebrow">
            {item ? SLOTS.find((s) => s.id === item.slot).label : "MY LOOK"}
          </span>
          <h2>{item?.name ?? "今天的搭配"}</h2>
          <p>{item?.desc ?? "挑選今天的套裝，再邀一位夥伴同行。"}</p>
        </div>
        {item && !owns(profile, item.id) && (
          <button
            className="star-heart"
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
            {profile.wishlist?.includes(item.id) ? "♥" : "♡"}
          </button>
        )}
      </section>
      {item && !owns(profile, item.id) ? (
        item.cost ? (
          <button
            className="star-button star-buy"
            disabled={
              state.busy ||
              (profile.stars[item.currency ?? "yellow"] ?? 0) < item.cost
            }
            onClick={async () => {
              if (await buy(item.id, true))
                setLook(
                  normalizeLook({
                    ...profile.equipped.layered,
                    [item.slot]: item.id,
                  }),
                );
            }}
          >
            <span>
              {(profile.stars[item.currency ?? "yellow"] ?? 0) < item.cost
                ? "星幣還差一點"
                : item.slot === "companion"
                  ? "兌換並同行"
                  : "兌換並穿上"}
            </span>
            <StarCurrency
              amount={item.cost}
              purple={item.currency === "purple"}
            />
          </button>
        ) : (
          <div className="star-source-note">
            {item.source}後自動取得{" "}
            <button
              onClick={() =>
                navigate(item.days ? "journal" : "adventure", {
                  tab: item.days ? "goals" : undefined,
                })
              }
            >
              查看進度 →
            </button>
          </div>
        )
      ) : (
        <button
          className="star-button"
          disabled={state.busy || !allOwned || !changed}
          onClick={() => equip(look)}
        >
          {!allOwned
            ? "搭配中還有未取得的收藏"
            : changed
              ? "穿上這套搭配"
              : "這套搭配已穿上"}
        </button>
      )}
      {item?.cost && !owns(profile, item.id) && (
        <div className="quest-purchase-hint">
          <div>
            目前有{" "}
            <StarCurrency
              amount={profile.stars[item.currency ?? "yellow"] ?? 0}
              purple={item.currency === "purple"}
            />{" "}
            <span>
              {Math.max(
                0,
                item.cost - (profile.stars[item.currency ?? "yellow"] ?? 0),
              )
                ? `還差 ${Math.max(0, item.cost - (profile.stars[item.currency ?? "yellow"] ?? 0))} 顆${item.currency === "purple" ? "紫星" : "黃星"}`
                : "可以兌換了"}
            </span>
          </div>
          <p>
            {item.currency === "purple"
              ? "完成章節或每週記錄 5 天，可以獲得紫星。"
              : "每天記錄 +2 黃星，當日回顧再 +1；一天多筆記錄不會重複發獎。"}
          </p>
        </div>
      )}
      {changed && (
        <button
          className="star-text-button"
          onClick={() => {
            setLook(normalizeLook(profile.equipped.layered));
            setSelected(profile.equipped.layered[slot]);
          }}
        >
          還原目前搭配
        </button>
      )}
      {tab === "wardrobe" && (
        <div className="star-slot-tabs" aria-label="收藏類別">
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
      )}
      {tab === "shop" && (
        <>
          <div className="star-shop-wallet">
            <span>我的星幣</span>
            <StarCurrency amount={profile.stars.yellow} />
            <StarCurrency amount={profile.stars.purple} purple />
          </div>
          <p className="star-form-hint">
            記錄一天 +2 黃星，回顧再 +1；每週累積 5 天 +5 黃星與 1
            紫星。喜歡的衣服，慢慢存就能得到。
          </p>
        </>
      )}
      <div className="star-item-grid">
        {tab === "wardrobe" &&
          ["hat", "companion", "garden"].includes(slot) && (
            <button
              className="star-item-card star-item-none"
              aria-pressed={!look[slot]}
              onClick={() => {
                setLook((current) => ({ ...current, [slot]: null }));
                setSelected(null);
              }}
            >
              <span>＋</span>
              <strong>不裝備</strong>
            </button>
          )}
        {visible.map((raw) => {
          const i = ITEM_BY_ID[raw.id];
          const owned = owns(profile, i.id);
          return (
            <button
              className={`star-item-card ${profile.wishlist?.includes(i.id) ? "is-wish" : ""}`}
              key={i.id}
              aria-pressed={selected === i.id}
              onClick={() => select(i)}
            >
              <div className="star-item-art">
                <ItemArt item={i} look={look} />
              </div>
              <strong>{i.name}</strong>
              <small>
                {owned ? (
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
              {profile.wishlist?.includes(i.id) && (
                <span className="star-item-wish" aria-label="心願收藏">
                  ♥
                </span>
              )}
            </button>
          );
        })}
      </div>
      {tab === "catalog" && (
        <button className="quest-album-link" onClick={() => setTab("stamps")}>
          <span>
            我的旅程印記 <b>{profile.journey.stamps.length} / 15</b>
          </span>
          <span>翻開相遇的故事 →</span>
        </button>
      )}
      <section className="star-legacy-link">
        <strong>熟悉的收藏，也還在。</strong>
        <p>舊套裝、配件、星幣和票券完整保留。</p>
        <div>
          <button onClick={() => navigate("profile", { tab: "wardrobe" })}>
            舊版造型收藏 →
          </button>
          <button onClick={() => navigate("shop")}>舊票與兌換櫃 →</button>
        </div>
      </section>
    </main>
  );
}
