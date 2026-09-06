import { useApp } from "../../useAppStore";
import { ITEM_BY_ID, normalizeLook, owns } from "../../game/catalog";
import { nextStep, collectionGoal } from "../../game/guidance";
import { JourneySteps, HowToPlay } from "../../components/starpage/JourneyUX";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import IllustratedScene, {
  GardenObject,
} from "../../components/starpage/IllustratedScene";
import { StarCurrency } from "../../components/starpage/Chrome";
import GameIcon from "../../components/GameIcon";
import StorybookActor from "../../components/StorybookActor";
import PaperDollFigure from "../../components/PaperDollFigure";
import { getPaperDollAssets } from "../../paperDoll";
export default function HomeScreen() {
  const { state, navigate, openEntry } = useApp();
  const { profile, dayRecord, totalSpent } = state;
  const look = normalizeLook(profile.equipped?.layered);
  const guide = nextStep(profile, dayRecord, state.date);
  const goNext = () =>
    guide.kind === "record"
      ? openEntry()
      : navigate(
          guide.kind === "adventure" ? "adventure" : "collection",
          guide.kind === "collection" ? { tab: "stamps" } : {},
        );
  const recorded = dayRecord.entryCount > 0 || dayRecord.noSpend;
  const reviewed =
    dayRecord.reviewedAt &&
    dayRecord.reviewedRevision === (dayRecord.revision ?? 0);
  const remaining = (dayRecord.budget ?? profile.dailyBudget) - totalSpent;
  const wish = collectionGoal(profile);
  const friend = ITEM_BY_ID[look.companion];
  const garden = ITEM_BY_ID[look.garden];
  const legacy = profile.equipped.visualStyle !== "layered";
  return (
    <main className="star-home quest-home">
      <header className="star-home-head">
        <button
          className="star-identity"
          onClick={() => navigate("settings")}
          aria-label="個人資料與設定"
        >
          <span className="star-avatar">
            <PaintedCharacter look={look} portrait reduced />
          </span>
          <span>
            <strong>{profile.playerName}</strong>
            <small>Lv. {profile.level} · 星頁冒險者</small>
          </span>
        </button>
        <button
          className="star-wallet"
          onClick={() => navigate("collection", { tab: "shop" })}
          aria-label="查看星幣與小店"
        >
          <StarCurrency amount={profile.stars.yellow} />
        </button>
      </header>
      <div className="quest-home-title">
        <div>
          <h1>{guide.title}</h1>
          <p>{guide.detail}</p>
        </div>
        <HowToPlay />
      </div>
      <JourneySteps
        step={guide.step}
        onSelect={(index) =>
          index === 0
            ? openEntry()
            : navigate(
                index === 1 ? "adventure" : "collection",
                index === 2 ? { tab: "stamps" } : {},
              )
        }
      />
      <section className="star-home-stage" aria-label="我的庭院">
        <IllustratedScene />
        <span className="star-place">
          <i />
          風鈴庭院
        </span>
        <button
          className="star-dress-link"
          onClick={() => navigate("collection")}
        >
          <GameIcon name="wardrobe" />
          <span>換個造型</span>
        </button>
        <div className="star-home-character">
          {legacy ? (
            profile.equipped.visualStyle === "classic" ? (
              <PaperDollFigure
                assets={getPaperDollAssets(profile.equipped.appearance)}
              />
            ) : (
              <StorybookActor
                outfit={profile.equipped.storybookOutfit}
                reduced={profile.preferences?.reduceMotion}
                interactive
              />
            )
          ) : (
            <PaintedCharacter
              look={look}
              successPulse={state.homeEffectPulse}
              interactive
              reduced={profile.preferences?.reduceMotion}
            />
          )}
        </div>
        {friend && (
          <div className="star-home-friend">
            <LittleFriend kind={friend.look} />
          </div>
        )}
        {garden && (
          <div className="star-home-garden">
            <GardenObject kind={garden.look} />
          </div>
        )}
        <button
          className="star-next-adventure quest-home-next"
          onClick={goNext}
        >
          <span className="star-next-adventure__icon">
            <GameIcon
              name={
                guide.kind === "record"
                  ? "tab-record"
                  : guide.kind === "adventure"
                    ? "tab-map"
                    : "report"
              }
            />
          </span>
          <span>
            <small>接下來</small>
            <strong>{guide.label}</strong>
          </span>
          <span>→</span>
        </button>
      </section>
      <section className="star-home-journal">
        <button
          className="star-home-journal__title"
          onClick={() => navigate("journal")}
        >
          <span className="star-book-icon">
            <GameIcon name="report" />
          </span>
          <span>
            <strong>今日手帳</strong>
            <small>
              {recorded
                ? reviewed
                  ? "已記錄，也好好回顧了"
                  : "已留下記錄 · 可以回顧了"
                : "今天，還有一頁空白"}
            </small>
          </span>
          <span>打開 →</span>
        </button>
        <div className="star-home-money">
          <span>
            今日支出<strong>NT$ {totalSpent.toLocaleString("zh-TW")}</strong>
          </span>
          <span>
            {remaining < 0 ? "超出預算" : "今日剩餘"}
            <strong className={remaining < 0 ? "star-danger" : ""}>
              NT$ {Math.abs(remaining).toLocaleString("zh-TW")}
            </strong>
          </span>
          {!recorded && <button onClick={() => openEntry()}>寫下第一筆</button>}
        </div>
      </section>
      {wish && (
        <button
          className="star-wish-strip quest-wish"
          onClick={() =>
            navigate("collection", { tab: "catalog", item: wish.id })
          }
        >
          <span className="quest-wish-art">
            {wish.slot === "companion" ? (
              <LittleFriend kind={wish.look} />
            ) : (
              <PaintedCharacter
                look={{ ...look, top: wish.id }}
                portrait
                reduced
              />
            )}
          </span>
          <span>
            下一個心願 <b>{wish.name}</b>
          </span>
          <small>
            {owns(profile, wish.id)
              ? "已收藏"
              : wish.cost
                ? `還差 ${Math.max(0, wish.cost - (profile.stars[wish.currency ?? "yellow"] ?? 0))} ${wish.currency === "purple" ? "紫星" : "黃星"}`
                : wish.source}{" "}
            →
          </small>
        </button>
      )}
      {guide.step === 2 && (
        <button
          className="quest-home-explore"
          onClick={() => navigate("adventure")}
        >
          還想再玩？去自由探索 →
        </button>
      )}
    </main>
  );
}
