import { useApp } from "../../useAppStore";
import { ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import { nextStep } from "../../game/guidance";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import WindIcon from "../../components/atelier/WindIcon";
import { StarCurrency } from "../../components/starpage/Chrome";
import { HowToPlay } from "../../components/starpage/JourneyUX";
import StorybookActor from "../../components/StorybookActor";
import PaperDollFigure from "../../components/PaperDollFigure";
import { getPaperDollAssets } from "../../paperDoll";

export default function HomeScreen() {
  const { state, navigate, openEntry } = useApp();
  const { profile, dayRecord, totalSpent } = state;
  const look = normalizeLook(profile.equipped.layered);
  const friend = ITEM_BY_ID[look.companion];
  const guide = nextStep(profile, dayRecord, state.date);
  const remaining = (dayRecord.budget ?? profile.dailyBudget) - totalSpent;
  const legacy = profile.equipped.visualStyle !== "layered";
  const next = () =>
    guide.kind === "record"
      ? openEntry()
      : navigate(
          guide.kind === "adventure" ? "adventure" : "collection",
          guide.kind === "collection" ? { tab: "stamps" } : {},
        );
  return (
    <main className="wind-town">
      <header className="wind-home-hud">
        <button
          className="wind-profile"
          onClick={() => navigate("settings")}
          aria-label="個人資料與設定"
        >
          <span className="wind-profile-face">
            <PaintedCharacter portrait look={look} reduced />
          </span>
          <span>
            <strong>{profile.playerName}</strong>
            <small>Lv. {profile.level} · 星頁旅人</small>
          </span>
        </button>
        <button
          className="wind-balance"
          onClick={() => navigate("collection", { tab: "shop" })}
          aria-label="星幣與小店"
        >
          <StarCurrency amount={profile.stars.yellow} />
          <StarCurrency amount={profile.stars.purple} purple />
        </button>
      </header>
      <div className="wind-home-place">
        <span>THE WINDWARD TERRACE</span>
        <h1>星風露台</h1>
        <p>把今天，寫進旅途。</p>
      </div>
      <button className="wind-home-quest" onClick={next}>
        <WindIcon name={guide.step === 2 ? "check" : "sparkle"} />
        <span>
          <small>{guide.step === 2 ? "今日相遇 · 已完成" : "今日的冒險"}</small>
          <strong>{guide.label}</strong>
        </span>
        <WindIcon name="arrow" />
      </button>
      <div className="wind-home-hero">
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
            staticPreview={!!state.entryDraft}
            successPulse={state.homeEffectPulse}
            interactive
            reduced={profile.preferences?.reduceMotion}
          />
        )}
      </div>
      {friend && (
        <div className="wind-home-friend">
          <LittleFriend kind={friend.look} />
        </div>
      )}
      <div className="wind-home-destinations">
        <button onClick={() => navigate("adventure")}>
          <span>
            <WindIcon name="map" />
            {profile.journey.pendingDates.length > 0 && (
              <i>{profile.journey.pendingDates.length}</i>
            )}
          </span>
          <b>章節冒險</b>
        </button>
        <button onClick={() => navigate("collection")}>
          <span>
            <WindIcon name="top" />
          </span>
          <b>換個造型</b>
        </button>
        <button onClick={() => navigate("collection", { tab: "stamps" })}>
          <span>
            <WindIcon name="companion" />
          </span>
          <b>相遇圖鑑</b>
        </button>
      </div>
      <div className="wind-home-help">
        <HowToPlay />
      </div>
      <button className="wind-home-ledger" onClick={() => navigate("journal")}>
        <WindIcon name="journal" />
        <span>
          <small>今天的手帳</small>
          <strong>支出 ${totalSpent.toLocaleString("zh-TW")}</strong>
        </span>
        <span className={remaining < 0 ? "is-over" : ""}>
          <small>{remaining < 0 ? "超出" : "可用餘額"}</small>
          <strong>${Math.abs(remaining).toLocaleString("zh-TW")}</strong>
        </span>
        <WindIcon name="arrow" />
      </button>
    </main>
  );
}
