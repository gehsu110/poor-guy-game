import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../useAppStore";
import { DEFAULT_CATEGORIES } from "../../gameLogic";
import { calendarDate } from "../../game/ledger";
import GameIcon from "../GameIcon";
import { nextStep } from "../../game/guidance";
import { JourneySteps } from "./JourneyUX";
import { StarCurrency } from "./Chrome";
export default function QuickEntry() {
  const { state, patch, saveEntry, navigate, recordAction } = useApp();
  const [saved, setSaved] = useState(false);
  const [earnedDaily, setEarnedDaily] = useState(false);
  const successRef = useRef(null);
  const guide = nextStep(state.profile, state.dayRecord, state.date);
  useEffect(() => {
    if (saved) successRef.current?.focus();
  }, [saved]);
  const draft = state.entryDraft;
  const dialogRef = useRef(null);
  const amountRef = useRef(null);
  const saving = useRef(false);
  useEffect(() => {
    const previous = document.activeElement;
    amountRef.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  useEffect(() => {
    if (!draft || draft.editing || saved) return;
    try {
      sessionStorage.setItem(
        `starpage-draft:${state.user.uid}`,
        JSON.stringify(draft),
      );
    } catch {
      /* A draft never replaces a committed ledger entry. */
    }
  }, [draft, saved, state.user.uid]);
  if (!draft) return null;
  function set(field, value) {
    patch({ entryDraft: { ...draft, [field]: value } });
  }
  async function submit(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    const firstToday =
      draft.date === state.date &&
      !state.profile.claimedMissions?.[`journal3:record:${state.date}`];
    if (await saveEntry(draft)) {
      setEarnedDaily(firstToday);
      setSaved(true);
      sessionStorage.removeItem(`starpage-draft:${state.user.uid}`);
    }
    saving.current = false;
  }
  const close = () => {
    if (!state.busy) patch({ entryDraft: null });
  };
  const categories =
    draft.kind === "expense"
      ? DEFAULT_CATEGORIES.map((c) => [c.label, c.iconKey])
      : draft.kind === "income"
        ? [
            ["薪資", "coin-gold"],
            ["獎金", "star"],
            ["其他收入", "other"],
          ]
        : [
            ["儲蓄移轉", "tab-guild"],
            ["帳戶移轉", "coin-gold"],
          ];
  return createPortal(
    <div
      className="star-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        ref={dialogRef}
        className="star-entry"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll(
              "button:not(:disabled),input:not(:disabled),select",
            ),
          ];
          if (event.shiftKey && document.activeElement === controls[0]) {
            event.preventDefault();
            controls.at(-1)?.focus();
          }
          if (!event.shiftKey && document.activeElement === controls.at(-1)) {
            event.preventDefault();
            controls[0]?.focus();
          }
        }}
      >
        <div className="star-entry__handle" />
        <header>
          <div>
            <span className="star-eyebrow">A PAGE OF TODAY</span>
            <h2 id="entry-title">
              {saved
                ? "這一筆，記好了。"
                : draft.editing
                  ? "修改這筆記錄"
                  : "寫下今天的一筆"}
            </h2>
          </div>
          <button
            className="star-icon-button"
            onClick={close}
            disabled={state.busy}
            aria-label="關閉記帳面板"
          >
            ×
          </button>
        </header>
        {saved ? (
          <div
            className="star-entry-success quest-entry-success"
            tabIndex={-1}
            ref={successRef}
          >
            <span className="star-entry-seal">
              <GameIcon name="report" />
            </span>
            <strong>
              NT${" "}
              {Number(
                String(draft.amount)
                  .split("+")
                  .reduce((sum, n) => sum + Number(n), 0),
              ).toLocaleString("zh-TW")}
            </strong>
            <p>
              {draft.category} · {draft.date}
              <br />
              {state.user.isLocal ? "已儲存在這個裝置" : "已儲存至雲端帳本"}
            </p>
            {earnedDaily && (
              <div className="quest-earned">
                <StarCurrency amount={2} />
                <span>今日記錄獎勵已收下</span>
                <b>冒險 +1 次</b>
              </div>
            )}
            <JourneySteps
              step={guide.step}
              onSelect={(index) => {
                close();
                navigate(
                  index === 0
                    ? "journal"
                    : index === 1
                      ? "adventure"
                      : "collection",
                  index === 2 ? { tab: "stamps" } : {},
                );
              }}
            />
            <p className="quest-entry-next">
              {guide.step === 1
                ? "下一步：幫精靈找星片，收下旅程印記。"
                : guide.step === 0
                  ? "補登已儲存。記錄今天的一筆，或確認今日零消費，就能準備冒險。"
                  : "今天的冒險已完成，新記錄會繼續更新帳本。"}
            </p>
            <button
              className="star-button quest-primary"
              onClick={() => {
                close();
                navigate(
                  guide.step === 1
                    ? "adventure"
                    : guide.step === 0
                      ? "journal"
                      : "collection",
                  guide.step === 2 ? { tab: "stamps" } : {},
                );
              }}
            >
              {guide.step === 1
                ? "去冒險，找星片"
                : guide.step === 0
                  ? "回到今天的手帳"
                  : "看看我的收藏"}{" "}
              →
            </button>
            <button className="star-button star-button--quiet" onClick={close}>
              完成，回到剛才
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="star-tabs">
              {[
                ["expense", "支出"],
                ["income", "收入"],
                ["transfer", "移轉"],
              ].map(([kind, text]) => (
                <button
                  type="button"
                  key={kind}
                  aria-pressed={draft.kind === kind}
                  onClick={() =>
                    patch({
                      entryDraft: {
                        ...draft,
                        kind,
                        category:
                          kind === "expense"
                            ? "餐飲"
                            : kind === "income"
                              ? "薪資"
                              : "儲蓄移轉",
                      },
                    })
                  }
                >
                  {text}
                </button>
              ))}
            </div>
            <label className="star-amount">
              <span>NT$</span>
              <input
                ref={amountRef}
                inputMode="decimal"
                aria-label="金額"
                autoComplete="off"
                value={draft.amount}
                onChange={(event) => set("amount", event.target.value)}
                placeholder="0"
                required
              />
              <small>可輸入 80+25 加總</small>
            </label>
            <div className="star-category-grid" aria-label="分類">
              {categories.map(([label, icon]) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={draft.category === label}
                  onClick={() => set("category", label)}
                >
                  <GameIcon name={icon} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="star-entry-fields">
              <label>
                日期
                <input
                  type="date"
                  max={calendarDate()}
                  value={draft.date}
                  onChange={(event) => set("date", event.target.value)}
                  required
                />
              </label>
              <label>
                分類
                <input
                  aria-label="自訂分類"
                  value={draft.category}
                  maxLength={24}
                  onChange={(event) => set("category", event.target.value)}
                  required
                />
              </label>
            </div>
            <label className="star-field">
              小記
              <input
                aria-label="備註"
                value={draft.note}
                onChange={(event) => set("note", event.target.value)}
                maxLength={160}
                placeholder="選填，留下一點日常"
              />
            </label>
            {draft.kind === "transfer" && (
              <p className="star-form-hint">
                移轉只記錄資金移動，不計入收入或支出。
              </p>
            )}
            {draft.date < calendarDate() && (
              <p className="star-form-hint">
                補登會更新帳本，不重複發放過去日期的日常獎勵。
              </p>
            )}
            <button className="star-button" disabled={state.busy} type="submit">
              {state.busy ? "正在儲存…" : draft.editing ? "儲存修改" : "記好了"}
            </button>
            {!draft.editing && !(state.dayRecord.expenseCount > 0) && (
              <button
                className="star-text-button"
                type="button"
                disabled={state.busy}
                onClick={async () => {
                  if (await recordAction("noSpend")) close();
                }}
              >
                今天沒有消費，留一頁紀錄
              </button>
            )}
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}
