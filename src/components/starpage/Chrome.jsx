import { useApp } from "../../useAppStore";
import GameIcon from "../GameIcon";
export function StarNav() {
  const { state, navigate, openEntry } = useApp();
  return (
    <nav className="star-nav" aria-label="主要導覽">
      {[
        ["town", "首頁", "tab-today"],
        ["adventure", "冒險", "tab-map"],
        ["entry", "記帳", "tab-record"],
        ["journal", "手帳", "report"],
        ["collection", "收藏", "wardrobe"],
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
            <GameIcon name={icon} />
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
