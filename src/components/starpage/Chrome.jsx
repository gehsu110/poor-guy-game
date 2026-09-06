import { useApp } from "../../useAppStore";
import GameIcon from "../GameIcon";
import { RelicIcon } from "./RelicIcon";
export function StarNav() {
  const { state, navigate, openEntry } = useApp();
  return (
    <nav className="world-dock" aria-label="主要導覽">
      {[
        ["town", "庭院", "home"],
        ["adventure", "冒險", "map"],
        ["entry", "記帳", "book"],
        ["journal", "手帳", "book"],
        ["collection", "收藏", "bag"],
      ].map(([id, label, icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => (id === "entry" ? openEntry() : navigate(id))}
          className={`${id === "entry" ? "star-nav__entry" : ""} ${state.screen === id ? "is-active" : ""}`}
          aria-current={state.screen === id ? "page" : undefined}
          aria-label={id === "entry" ? "新增記帳" : label}
        >
          <span>
            <RelicIcon kind={icon} />
          </span>
          <b>{label}</b>
        </button>
      ))}
    </nav>
  );
}
export function PageHead({ eyebrow, title, children }) {
  return (
    <header className="star-page-head">
      <div>
        <span className="star-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}
export function StarCurrency({ amount, purple = false }) {
  return (
    <span
      className="star-currency"
      aria-label={`${purple ? "紫星" : "黃星"} ${amount}`}
    >
      <GameIcon name={purple ? "coin-purple" : "coin-gold"} />
      <b>{amount}</b>
    </span>
  );
}
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="star-tabs" aria-label={label}>
      {tabs.map(([id, name]) => (
        <button
          key={id}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
