import { useApp } from "../../useAppStore";
import { ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import { nextStep } from "../../game/guidance";
import PaintedCharacter, {
  LittleFriend,
} from "../../components/starpage/PaintedCharacter";
import { WorldHUD, RelicIcon } from "../../components/starpage/WorldUI";
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
    <main className="world-stage world-town">
      <WorldHUD />
      <div className="world-place">
        <span>THE LITTLE COURTYARD</span>
        <h1>風鈴庭院</h1>
      </div>
      <button className="world-quest-note" onClick={next}>
        <span className="world-quest-pin" />
        <small>{guide.step === 2 ? "今日相遇 · 已完成" : "今日的冒險"}</small>
        <strong>{guide.label}</strong>
        <span className="world-quest-chevron">›</span>
      </button>
      <div className="world-town-help">
        <HowToPlay />
      </div>
      <button
        className="world-place-link world-place-link--adventure"
        onClick={() => navigate("adventure")}
      >
        <span>
          <RelicIcon kind="map" />
          {profile.journey.pendingDates.length > 0 && (
            <i>{profile.journey.pendingDates.length}</i>
          )}
        </span>
        <b>出發冒險</b>
      </button>
      <button
        className="world-place-link world-place-link--collection"
        onClick={() => navigate("collection", { tab: "stamps" })}
      >
        <span>
          <RelicIcon kind="bag" />
        </span>
        <b>我的收藏</b>
      </button>
      <button
        className="world-place-link world-place-link--outfit"
        onClick={() => navigate("collection")}
      >
        <span>
          <RelicIcon kind="coat" />
        </span>
        <b>換個造型</b>
      </button>
      <div className="world-town-character">
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
        <div className="world-town-friend">
          <LittleFriend kind={friend.look} />
        </div>
      )}
      <p className="world-town-whisper">
        {guide.step === 2
          ? "今天的星光，已經收好了。"
          : guide.step === 1
            ? "帶上手帳，一起去找星光吧。"
            : "把今天的故事，寫進手帳裡。"}
      </p>
      <button
        className="world-pocket-ledger"
        onClick={() => navigate("journal")}
      >
        <RelicIcon kind="book" />
        <span>
          <small>今天的手帳</small>
          <strong>支出 ${totalSpent.toLocaleString("zh-TW")}</strong>
        </span>
        <span className={remaining < 0 ? "is-over" : ""}>
          {remaining < 0 ? "超出" : "餘額"}
          <b>${Math.abs(remaining).toLocaleString("zh-TW")}</b>
        </span>
        <span>›</span>
      </button>
    </main>
  );
}
