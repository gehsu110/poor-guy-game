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
  ForestSpirit,
} from "../../components/starpage/IllustratedScene";
import { CHAPTERS, ROUTES } from "../../game/journey";
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
  const initialItem = requestedItem?.artReady ? requestedItem : null;
  const [tab, setTab] = useState(
    ["catalog", "shop"].includes(state.screenParams.tab)
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
  return (
    <main className="star-page star-collection">
      <PageHead eyebrow="A LITTLE COLLECTION OF YOU" title="把喜歡的，收起來。">
        <span className="star-count">
          {ownedCount} / {ITEMS.length}
        </span>
      </PageHead>
      <Tabs
        label="收藏內容"
        tabs={[
          ["wardrobe", "造型"],
          ["catalog", "圖鑑"],
          ["shop", "小店"],
        ]}
        value={tab}
        onChange={setTab}
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
            onClick={() => buy(item.id)}
          >
            <span>
              {(profile.stars[item.currency ?? "yellow"] ?? 0) < item.cost
                ? "星幣還差一點"
                : "把它收進衣櫃"}
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
        <section className="star-stamp-album">
          <div className="star-section-title">
            <h2>旅程印記</h2>
            <span>{profile.journey.stamps.length} / 15</span>
          </div>
          <p>每一次相遇，都替手帳留下一個小小的紀念。</p>
          <div className="star-stamp-grid">
            {profile.journey.stamps.map((stamp) => (
              <article key={stamp.node} className="star-stamp-card">
                <ForestSpirit variant={stamp.node - 1} defeated />
                <small>第 {String(stamp.node).padStart(2, "0")} 段</small>
                <strong>
                  {
                    CHAPTERS[Math.floor((stamp.node - 1) / 5)]?.nodes[
                      (stamp.node - 1) % 5
                    ]
                  }
                </strong>
                <span>
                  {ROUTES.find((route) => route.id === stamp.route)?.mark}
                </span>
              </article>
            ))}
            {profile.journey.stamps.length < 15 && (
              <button
                className="star-stamp-card star-stamp-next"
                onClick={() => navigate("adventure")}
              >
                <span>✦</span>
                <strong>下一次相遇</strong>
                <small>沿著小徑出發 →</small>
              </button>
            )}
          </div>
        </section>
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
