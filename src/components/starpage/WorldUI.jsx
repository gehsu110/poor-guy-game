import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { STORYBOOK_ART } from "../../storybookAssets";
import courtyardMotion from "../../assets/academy-art/storybook-v2/courtyard-living.mp4";
import { createPortal } from "react-dom";
import { useApp } from "../../useAppStore";
import IllustratedScene from "./IllustratedScene";
import AtelierBackdrop from "../atelier/AtelierBackdrop";
import PaintedCharacter from "./PaintedCharacter";
import { StarCurrency } from "./Chrome";
import { HowToPlay } from "./JourneyUX";

export { RelicIcon } from "./RelicIcon";

export function WorldBackdrop({ className = "" }) {
  const { state } = useApp();
  return ["town", "collection"].includes(state.screen) ? (
    <AtelierBackdrop />
  ) : (
    <CourtyardBackdrop className={className} />
  );
}
function CourtyardBackdrop({ className = "" }) {
  const { state } = useApp();
  const systemReduced = useReducedMotion();
  const [visible, setVisible] = useState(!document.hidden);
  const [saveData, setSaveData] = useState(!!navigator.connection?.saveData);
  const [playing, setPlaying] = useState(false);
  const video = useRef(null);
  const animate =
    !systemReduced && !state.profile?.preferences?.reduceMotion && !saveData;
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden),
      connection = () => setSaveData(!!navigator.connection?.saveData);
    document.addEventListener("visibilitychange", visibility);
    navigator.connection?.addEventListener("change", connection);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      navigator.connection?.removeEventListener("change", connection);
    };
  }, []);
  useEffect(() => {
    if (!video.current) return;
    if (animate && visible) video.current.play().catch(() => setPlaying(false));
    else video.current.pause();
  }, [animate, visible]);
  return (
    <div className={`world-backdrop ${className}`} aria-hidden="true">
      <IllustratedScene />
      {animate && (
        <video
          ref={video}
          className={`world-ambient-video ${playing ? "is-playing" : ""}`}
          src={courtyardMotion}
          poster={STORYBOOK_ART.courtyard}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          tabIndex={-1}
        />
      )}
      <div className="world-vignette" />
      <div className="world-sunray" />
      <div className="world-fireflies">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="world-foreground" />
      <span className="world-arrival" key={state.screen} />
    </div>
  );
}

export function WorldHUD() {
  const { state, navigate } = useApp();
  const p = state.profile;
  return (
    <header className="world-hud">
      <button
        className="world-player"
        onClick={() => navigate("settings")}
        aria-label="個人資料與設定"
      >
        <span className="world-player-face">
          <PaintedCharacter portrait look={p.equipped.layered} reduced />
        </span>
        <span>
          <strong>{p.playerName}</strong>
          <small>Lv. {p.level} · 星頁旅人</small>
        </span>
      </button>
      <button
        className="world-wallet"
        onClick={() => navigate("collection", { tab: "shop" })}
        aria-label="星幣與小店"
      >
        <StarCurrency amount={p.stars.yellow} />
        <StarCurrency amount={p.stars.purple} purple />
      </button>
    </header>
  );
}
export function WorldHeader({
  title,
  subtitle,
  onBack,
  backLabel = "返回庭院",
  backDisabled = false,
  children,
}) {
  return (
    <header className="world-header">
      <button
        className="world-round world-back"
        aria-label={backLabel}
        disabled={backDisabled}
        onClick={onBack}
      >
        ‹
      </button>
      <div>
        <small>{subtitle}</small>
        <h1 tabIndex={-1}>{title}</h1>
      </div>
      {children ?? <HowToPlay />}
    </header>
  );
}
export function WorldDialog({ title, children, onClose, className = "" }) {
  const ref = useRef(null),
    id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const shell = document.querySelector(".star-shell");
    shell?.setAttribute("inert", "");
    ref.current?.focus();
    return () => {
      shell?.removeAttribute("inert");
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <div
      className="world-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`world-dialog ${className}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const items = [
              ...ref.current.querySelectorAll(
                "button:not(:disabled),input:not(:disabled),select",
              ),
            ];
            if (
              e.shiftKey &&
              (document.activeElement === items[0] ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              items.at(-1)?.focus();
            } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
              e.preventDefault();
              items[0]?.focus();
            }
          }
        }}
      >
        <header>
          <h2 id={id}>{title}</h2>
          <button className="world-round" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
