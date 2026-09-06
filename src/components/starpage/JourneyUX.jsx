import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import GameIcon from "../GameIcon";
import IllustratedScene from "./IllustratedScene";

export function StarShard({ className = "" }) {
  return (
    <svg
      className={`quest-shard ${className}`}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        d="M32 4L40 23L60 26L45 40L49 60L32 50L15 60L19 40L4 26L24 23Z"
        fill="#d6993e"
        stroke="#926128"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M32 6L32 34L6 27L24 24Z" fill="#fff1ad" />
      <path d="M32 6L40 24L58 27L32 34Z" fill="#f7d67b" />
      <path d="M32 34L58 27L44 40L48 57Z" fill="#d69a42" />
      <path d="M32 34L48 57L32 48L16 57Z" fill="#ecc266" />
      <path d="M32 34L16 57L20 40L6 27Z" fill="#fce299" />
      <path
        d="M27 24L32 13L34 25"
        fill="none"
        stroke="#fffbe2"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JourneySteps({ step = 0, onSelect }) {
  return (
    <nav className="quest-steps" aria-label="每日遊玩流程">
      {[
        ["記錄", "tab-record"],
        ["冒險", "tab-map"],
        ["收藏", "wardrobe"],
      ].map(([name, icon], index) => (
        <button
          key={name}
          type="button"
          aria-current={index === step ? "step" : undefined}
          onClick={() => onSelect?.(index)}
          className={index < step ? "is-complete" : ""}
        >
          <span>{index < step ? "✓" : <GameIcon name={icon} />}</span>
          <b>{name}</b>
          {index < 2 && <i aria-hidden="true">›</i>}
        </button>
      ))}
    </nav>
  );
}

export function Diorama({ children, className = "", reduced = false }) {
  const ref = useRef(null);
  const frame = useRef(null);
  const systemReduced = useReducedMotion();
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function move(event) {
    if (reduced || systemReduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.style.setProperty("--scene-x", `${x}px`);
      ref.current?.style.setProperty("--scene-y", `${y}px`);
    });
  }
  function reset() {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty("--scene-x", "0px");
    ref.current?.style.setProperty("--scene-y", "0px");
  }
  return (
    <div
      ref={ref}
      className={`quest-diorama ${className}`}
      onPointerMove={move}
      onPointerLeave={reset}
      data-reduced={reduced || systemReduced}
    >
      <IllustratedScene />
      <span className="quest-diorama-ground" aria-hidden="true" />
      {children}
    </div>
  );
}

function HelpDialog({ onClose }) {
  const ref = useRef(null);
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
      className="quest-help-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="quest-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-help-title"
        tabIndex={-1}
        ref={ref}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
          if (event.key === "Tab") {
            const buttons = [...ref.current.querySelectorAll("button")];
            if (event.shiftKey && document.activeElement === buttons[0]) {
              event.preventDefault();
              buttons.at(-1).focus();
            } else if (
              !event.shiftKey &&
              document.activeElement === buttons.at(-1)
            ) {
              event.preventDefault();
              buttons[0].focus();
            }
          }
        }}
      >
        <header>
          <div>
            <span className="quest-kicker">每天一點點，就會長大</span>
            <h2 id="quest-help-title">這個遊戲怎麼玩？</h2>
          </div>
          <button aria-label="關閉玩法說明" onClick={onClose}>
            ×
          </button>
        </header>
        <ol>
          {[
            [
              "tab-record",
              "記下今天",
              "如實記一筆，或確認今天零消費。每天取得 2 黃星和 1 次冒險，多記不會多給。",
            ],
            [
              "tab-map",
              "幫精靈找星片",
              "點選場景裡發光的星片，找到 3 片就完成。沒有倒數，也不需要連點。",
            ],
            [
              "wardrobe",
              "收下你的成長",
              "冒險留下印記，黃星能換套裝。每天回顧再得 1 黃星，累積 3 天遇見小鴞。",
            ],
          ].map(([icon, title, description], index) => (
            <li key={title}>
              <span>
                <GameIcon name={icon} />
              </span>
              <div>
                <small>0{index + 1}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="quest-help-note">
          今天玩完也可以「自由探索」，不扣次數、不發正式獎勵。隔天記錄後，就能推進新的旅程。
        </p>
        <button className="star-button" onClick={onClose}>
          知道了，一起出發
        </button>
      </section>
    </div>,
    document.body,
  );
}
export function HowToPlay() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="quest-help-button" onClick={() => setOpen(true)}>
        <span aria-hidden="true">?</span>玩法
      </button>
      {open && <HelpDialog onClose={() => setOpen(false)} />}
    </>
  );
}
