import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { AppProvider, useApp } from "./useAppStore";
import { useGameAudio } from "./gameAudio";
import { parseAmount } from "./progression";
import { StarNav } from "./components/starpage/Chrome";
import PaintedCharacter from "./components/starpage/PaintedCharacter";
import { ATELIER_OUTFITS } from "./atelierAssets";
import QuickEntry from "./components/starpage/QuickEntry";
import { WorldBackdrop } from "./components/starpage/WorldUI";
const HomeScreen = lazy(() => import("./screens/starpage/HomeScreen"));
const AdventureScreen = lazy(
  () => import("./screens/starpage/AdventureScreen"),
);
const JournalScreen = lazy(() => import("./screens/starpage/JournalScreen"));
const CollectionScreen = lazy(
  () => import("./screens/starpage/CollectionScreen"),
);
const SettingsScreen = lazy(() => import("./screens/starpage/SettingsScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen"));
const ShopScreen = lazy(() => import("./screens/ShopScreen"));
const SCREENS = {
  town: HomeScreen,
  adventure: AdventureScreen,
  journal: JournalScreen,
  collection: CollectionScreen,
  settings: SettingsScreen,
  profile: ProfileScreen,
  shop: ShopScreen,
};
function LoadingScreen() {
  return (
    <div className="star-loading" role="status" aria-live="polite">
      <div>
        <img
          src={ATELIER_OUTFITS.top_mint.poster}
          alt=""
          className="star-loading-portrait"
        />
      </div>
      <p>正在翻開你的故事…</p>
    </div>
  );
}
function Onboarding() {
  const { state, updateGame } = useApp();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(String(state.profile.dailyBudget));
  const [error, setError] = useState("");
  return (
    <div className="star-modal-backdrop">
      <section
        className="star-entry"
        role="dialog"
        aria-modal="true"
        aria-label="開始星頁旅程"
      >
        <span className="star-eyebrow">WELCOME TO YOUR LITTLE ADVENTURE</span>
        <h2>帶著手帳，一起出發。</h2>
        <div style={{ height: 170, margin: "auto", width: 140 }}>
          <PaintedCharacter
            look={state.profile.equipped.layered}
            staticPreview
          />
        </div>
        <label className="star-field">
          你的名字
          <input
            aria-label="冒險者名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="小小旅人"
            maxLength={12}
          />
        </label>
        <label className="star-field">
          每日預算 · NT$
          <input
            aria-label="每日預算"
            inputMode="decimal"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>
        <p className="star-form-hint">
          先用舒服的額度開始。旅途中慢慢收藏套裝與夥伴，記帳金額不影響戰力。
        </p>
        {error && <p role="alert">{error}</p>}
        <button
          className="star-button"
          disabled={state.busy}
          onClick={() => {
            const amount = parseAmount(budget);
            if (!amount) {
              setError("請輸入有效預算。");
              return;
            }
            updateGame((profile) => ({
              ...profile,
              nameConfirmed: true,
              onboardingDone: true,
              playerName: name.trim() || "小小旅人",
              dailyBudget: amount,
              equipped: {
                ...profile.equipped,
                layered: profile.equipped.layered,
              },
            }));
          }}
        >
          開始我的旅程
        </button>
      </section>
    </div>
  );
}
function Recovery({ message }) {
  function rawBackup() {
    const raw = localStorage.getItem("expense-quest:local:v2");
    if (!raw) return;
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense-quest-recovery.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="app-recovery">
      <h1>先把這一頁保留好</h1>
      <p>{message}</p>
      <button className="star-button" onClick={() => location.reload()}>
        重新載入
      </button>
      <button className="star-text-button" onClick={rawBackup}>
        匯出此裝置的原始存檔
      </button>
      <p>已保存的資料沒有被清除。</p>
    </div>
  );
}
function Content() {
  const { state, navigate } = useApp();
  useGameAudio(state.profile?.preferences);
  const systemReduced = useReducedMotion();
  const reduce = !!systemReduced || !!state.profile?.preferences?.reduceMotion;
  const scrollRef = useRef(null);
  const positions = useRef({});
  const pageKey = `${state.screen}:${state.screenParams.tab ?? ""}`;
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduce);
    return () => document.documentElement.classList.remove("reduce-motion");
  }, [reduce]);
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.scrollTop = positions.current[pageKey] ?? 0;
    const saved = positions.current;
    return () => {
      saved[pageKey] = scroll.scrollTop;
    };
  }, [pageKey, state.loading]);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!state.loading) return;
    const timer = setTimeout(() => setSlow(true), 15000);
    return () => clearTimeout(timer);
  }, [state.loading]);
  if (state.loading)
    return slow ? (
      <Recovery message="連線比預期久，請檢查網路後重試。" />
    ) : (
      <LoadingScreen />
    );
  if (state.error) return <Recovery message={state.error} />;
  const Screen = SCREENS[state.screen] ?? HomeScreen;
  const legacy = ["profile", "shop"].includes(state.screen);
  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <div className="star-shell world-shell" data-screen={state.screen}>
        <WorldBackdrop />
        <div className={legacy ? "star-legacy" : "star-scroll"} ref={scrollRef}>
          {legacy && (
            <button
              className="star-legacy-banner"
              onClick={() => navigate("collection")}
            >
              ← 回星頁收藏 · 舊版造型與票券保留於此
            </button>
          )}
          <Suspense fallback={<LoadingScreen />}>
            <Screen key={`${pageKey}:${state.screenParams.item ?? ""}`} />
          </Suspense>
        </div>
        <StarNav />
        {!state.profile.nameConfirmed && <Onboarding />}
        {state.entryDraft && <QuickEntry key={state.entryDraft.id} />}
        <UpdateNotice />
        {state.notification &&
          createPortal(
            <div className="star-toast" role="status" aria-live="polite">
              {state.notification.message}
            </div>,
            document.body,
          )}
      </div>
    </MotionConfig>
  );
}
function UpdateNotice() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const { state } = useApp();
  if (
    !needRefresh ||
    state.busy ||
    state.entryDraft ||
    state.profile?.journey?.active
  )
    return null;
  return (
    <div className="pwa-update" role="status">
      <span>新的一頁已準備好</span>
      <button onClick={() => updateServiceWorker(true)}>更新遊戲</button>
    </div>
  );
}
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <Recovery message={this.state.error} />
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Content />
      </AppProvider>
    </ErrorBoundary>
  );
}
