import { useEffect, useState } from "react";
import { useApp } from "../../useAppStore";
import { readMonth } from "../../gameRepository";
import { calendarDate, entryKind, minor } from "../../game/ledger";
import { ITEM_BY_ID, owns } from "../../game/catalog";
import { weekDates } from "../../progression";
import { PageHead, Tabs, StarCurrency } from "../../components/starpage/Chrome";
import GameIcon from "../../components/GameIcon";
const money = (value) => Number(value).toLocaleString("zh-TW");
function monthShift(month, delta) {
  const date = new Date(`${month}-15T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
}
export default function JournalScreen() {
  const { state, navigate, openEntry, deleteEntry, recordAction } = useApp();
  const [tab, setTab] = useState(
    ["ledger", "goals"].includes(state.screenParams.tab)
      ? state.screenParams.tab
      : "today",
  );
  const [month, setMonth] = useState(state.date.slice(0, 7));
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const profile = state.profile;
  const record = state.dayRecord;
  useEffect(() => {
    let alive = true;
    readMonth(state.user.uid, month).then(
      (data) => {
        if (alive) {
          setRows(data);
          setError("");
          setLoading(false);
        }
      },
      (e) => {
        if (alive) {
          setError(e.message);
          setLoading(false);
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [state.user.uid, month, state.ledgerVersion, reload]);
  function changeMonth(delta) {
    setLoading(true);
    setDateFilter(null);
    setMonth((current) => monthShift(current, delta));
  }
  const recorded = record.entryCount > 0 || record.noSpend;
  const reviewed =
    record.reviewedAt && record.reviewedRevision === (record.revision ?? 0);
  const dates = profile.journey.recordedDates;
  const week = weekDates(state.date);
  const weekCount = dates.filter((day) => week.includes(day)).length;
  const summary = rows.reduce(
    (sum, row) => {
      if (entryKind(row) !== "transfer")
        sum[entryKind(row)] += row.amountMinor ?? minor(row.amount);
      return sum;
    },
    { expense: 0, income: 0 },
  );
  const daysInMonth = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5)),
    0,
  ).getDate();
  const weekday = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const selectedRows =
    tab === "today"
      ? state.expenses
      : dateFilter
        ? rows.filter((row) => row.date === dateFilter)
        : rows;
  return (
    <main className="star-page star-journal">
      <PageHead eyebrow="MY EVERYDAY JOURNAL" title="我的手帳">
        <span className="star-journal-date">
          {state.date.slice(5).replace("-", " / ")}
        </span>
      </PageHead>
      <Tabs
        value={tab}
        onChange={setTab}
        label="手帳內容"
        tabs={[
          ["today", "今日"],
          ["ledger", "帳本"],
          ["goals", "目標"],
        ]}
      />
      {tab === "today" && (
        <>
          <section className="star-daily-page">
            <div className="star-bookmark" />
            <span className="star-eyebrow">
              {recorded
                ? "ONE MORE DAY, ONE MORE PAGE"
                : "YOUR STORY STARTS HERE"}
            </span>
            <h2>
              {recorded ? "今天，也好好記下來了。" : "今天的故事，從這裡開始。"}
            </h2>
            <p>
              {record.noSpend
                ? "沒有消費的一天，也值得記錄。"
                : recorded
                  ? `留下 ${state.expenses.length} 筆日常，旅程繼續向前。`
                  : "記錄真實的日常，或確認今天零消費。"}
            </p>
            <div className="star-journal-totals">
              <span>
                今日支出<strong>NT$ {money(state.totalSpent)}</strong>
              </span>
              <span>
                每日預算
                <strong>
                  NT$ {money(record.budget ?? profile.dailyBudget)}
                </strong>
              </span>
            </div>
            <div className="star-check-row">
              <span className={recorded ? "is-done" : ""}>
                {recorded ? "✓" : "1"}
              </span>
              <div>
                <strong>留下今天的一頁</strong>
                <small>
                  {recorded
                    ? "已記錄 · 每天獎勵只發放一次"
                    : "記錄後自動獲得冒險資格"}
                </small>
              </div>
              <StarCurrency amount={2} />
            </div>
            <div className="star-check-row">
              <span className={reviewed ? "is-done" : ""}>
                {reviewed ? "✓" : "2"}
              </span>
              <div>
                <strong>回顧一下今天</strong>
                <small>
                  {reviewed ? "分類和金額已確認" : "可選，檢查下方明細是否正確"}
                </small>
              </div>
              {reviewed ? (
                <StarCurrency amount={1} />
              ) : (
                <button
                  disabled={!recorded || state.busy}
                  onClick={() => recordAction("review")}
                >
                  確認
                </button>
              )}
            </div>
            {!recorded && (
              <button className="star-button" onClick={() => openEntry()}>
                記下第一筆
              </button>
            )}
            {!(record.expenseCount > 0) && !record.noSpend && (
              <button
                className="star-text-button"
                disabled={state.busy}
                onClick={() => recordAction("noSpend")}
              >
                今天沒有消費
              </button>
            )}
          </section>
          <div className="star-section-title">
            <h2>今日明細</h2>
            <button onClick={() => setTab("ledger")}>完整帳本 →</button>
          </div>
        </>
      )}
      {tab === "ledger" && (
        <>
          <div className="star-month-control">
            <button aria-label="上一個月" onClick={() => changeMonth(-1)}>
              ‹
            </button>
            <h2>{month.replace("-", " 年 ")} 月</h2>
            <button
              aria-label="下一個月"
              disabled={month >= calendarDate().slice(0, 7)}
              onClick={() => changeMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="star-month-summary">
            <span>
              本月支出
              <strong>
                NT$ {loading ? "…" : money(summary.expense / 100)}
              </strong>
            </span>
            <span>
              本月收入
              <strong>NT$ {loading ? "…" : money(summary.income / 100)}</strong>
            </span>
          </div>
          <div className="star-calendar" aria-label="帳本月曆">
            {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
              <small key={d}>{d}</small>
            ))}
            {Array.from({ length: weekday }, (_, i) => (
              <span key={`blank:${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, "0")}`;
              const has = rows.some((row) => row.date === date);
              return (
                <button
                  key={date}
                  disabled={date > state.date}
                  aria-label={`${date}${has ? "，有紀錄" : ""}`}
                  aria-pressed={dateFilter === date}
                  onClick={() =>
                    setDateFilter(date === dateFilter ? null : date)
                  }
                  className={`${has ? "has-entry" : ""} ${date === state.date ? "is-today" : ""}`}
                >
                  <span>{i + 1}</span>
                  <i />
                </button>
              );
            })}
          </div>
          <div className="star-section-title">
            <h2>{dateFilter ? `${dateFilter.slice(5)} 明細` : "本月明細"}</h2>
            {dateFilter && (
              <button onClick={() => setDateFilter(null)}>顯示整月</button>
            )}
          </div>
          {dateFilter && (
            <button
              className="star-text-button"
              onClick={() =>
                openEntry({
                  id: crypto.randomUUID(),
                  operationId: crypto.randomUUID(),
                  kind: "expense",
                  date: dateFilter,
                  category: "餐飲",
                  amount: "",
                  note: "",
                  newEntry: true,
                })
              }
            >
              ＋ 在這一天記一筆
            </button>
          )}
          {loading && <p role="status">正在翻開帳本…</p>}
          {error && (
            <div className="star-error" role="alert">
              {error}
              <button
                onClick={() => {
                  setLoading(true);
                  setReload((n) => n + 1);
                }}
              >
                重試
              </button>
            </div>
          )}
        </>
      )}
      {tab !== "goals" && !(tab === "ledger" && loading) && (
        <div className="star-ledger-list">
          {selectedRows.length ? (
            [...selectedRows]
              .sort(
                (a, b) =>
                  b.date.localeCompare(a.date) ||
                  (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
              )
              .map((row) => (
                <article key={row.id} className="star-ledger-row">
                  <button
                    onClick={() =>
                      openEntry({
                        ...row,
                        kind: entryKind(row),
                        amount: String(row.amount),
                      })
                    }
                    aria-label={`編輯 ${row.date} ${row.category} ${row.amount} 元`}
                  >
                    <span className="star-ledger-mark">
                      <GameIcon
                        name={
                          entryKind(row) === "income"
                            ? "coin-gold"
                            : entryKind(row) === "transfer"
                              ? "tab-guild"
                              : "report"
                        }
                      />
                    </span>
                    <span>
                      <strong>{row.category}</strong>
                      <small>
                        {tab === "ledger" ? `${row.date.slice(5)} · ` : ""}
                        {row.note ||
                          {
                            expense: "日常支出",
                            income: "收入",
                            transfer: "資金移轉",
                          }[entryKind(row)]}
                      </small>
                    </span>
                    <b>
                      {entryKind(row) === "income"
                        ? "+"
                        : entryKind(row) === "expense"
                          ? "−"
                          : "↔"}{" "}
                      {money(row.amount)}
                    </b>
                  </button>
                  <button
                    className="star-ledger-delete"
                    onClick={() => setConfirm(row)}
                    aria-label={`刪除 ${row.category} ${row.amount} 元`}
                  >
                    ×
                  </button>
                </article>
              ))
          ) : (
            <div className="star-empty">
              <GameIcon name="report" />
              <p>
                這裡還沒有明細。
                <br />
                生活慢慢寫，每一筆都算數。
              </p>
            </div>
          )}
        </div>
      )}
      {tab === "goals" && (
        <>
          <section className="star-week-page">
            <span className="star-eyebrow">THIS WEEK</span>
            <h2>五天的小約定</h2>
            <p>本週一到週日，累積記錄 5 天。</p>
            <div className="star-week-stamps">
              {week.map((date, index) => (
                <span
                  key={date}
                  className={dates.includes(date) ? "is-done" : ""}
                >
                  <small>
                    {["一", "二", "三", "四", "五", "六", "日"][index]}
                  </small>
                  <b>{dates.includes(date) ? "✓" : "·"}</b>
                </span>
              ))}
            </div>
            <div className="star-section-title">
              <strong>{Math.min(5, weekCount)} / 5 天</strong>
              <span>
                <StarCurrency amount={5} /> <StarCurrency amount={1} purple />
              </span>
            </div>
            <small>達成後自動收下，不用到另一頁領取。</small>
          </section>
          <div className="star-section-title">
            <h2>慢慢長成自己的樣子</h2>
            <span>累積 {dates.length} 天</span>
          </div>
          {[["friend_owl", 3]].map(([id, target]) => {
            const item = ITEM_BY_ID[id];
            const progress = item.days
              ? dates.length
              : profile.journey.completed;
            return (
              <button
                className="star-goal-row"
                key={id}
                onClick={() =>
                  navigate("collection", { tab: "catalog", item: id })
                }
              >
                <span className="star-goal-number">
                  {owns(profile, id)
                    ? "✓"
                    : `${Math.min(progress, target)}/${target}`}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.source}</small>
                </span>
                <span>查看 →</span>
              </button>
            );
          })}
          <p className="star-form-hint">
            累積成長不會因中斷歸零。補登修正帳本，日常資格以當日記錄為準。
          </p>
        </>
      )}
      {confirm && (
        <div
          className="star-inline-confirm"
          role="alertdialog"
          aria-modal="true"
          aria-label="確認刪除紀錄"
        >
          <h2>刪除這筆紀錄？</h2>
          <p>
            {confirm.category} · NT$ {money(confirm.amount)}
            <br />
            帳本會更新，已取得的冒險進度保留。
          </p>
          <button
            className="star-button"
            disabled={state.busy}
            onClick={async () => {
              if (await deleteEntry(confirm)) setConfirm(null);
            }}
          >
            確認刪除
          </button>
          <button
            className="star-button star-button--quiet"
            disabled={state.busy}
            onClick={() => setConfirm(null)}
          >
            保留紀錄
          </button>
        </div>
      )}
    </main>
  );
}
