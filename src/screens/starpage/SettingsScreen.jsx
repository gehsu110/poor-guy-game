import { useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import { firebaseConfigured, loginWithGoogle } from "../../firebase";
import { gameSnapshot, importGame, migrateGame } from "../../gameRepository";
import { validateBackup } from "../../game/backup";
import { calendarDate } from "../../game/ledger";
import { parseAmount } from "../../progression";
import { PageHead } from "../../components/starpage/Chrome";
import PaintedCharacter from "../../components/starpage/PaintedCharacter";
export default function SettingsScreen() {
  const { state, updateGame, refresh, notify, navigate } = useApp();
  const [name, setName] = useState(state.profile.playerName);
  const [budget, setBudget] = useState(String(state.profile.dailyBudget));
  const [working, setWorking] = useState(false);
  const [backup, setBackup] = useState(null);
  const [progress, setProgress] = useState("");
  const [cloudUser, setCloudUser] = useState(null);
  const uploadRef = useRef(null);
  const profile = state.profile;
  async function exportBackup() {
    setWorking(true);
    try {
      const data = await gameSnapshot(state.user.uid);
      const blob = new Blob(
        [
          JSON.stringify(
            {
              ...data,
              origin: state.user.isLocal ? data.profile.saveId : state.user.uid,
              exportedAt: Date.now(),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `starpage-${calendarDate()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("完整備份已準備下載。");
    } catch (e) {
      notify(e.message);
    } finally {
      setWorking(false);
    }
  }
  async function chooseFile(event) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024)
        throw new Error("備份檔不可超過 20 MB。");
      setBackup(validateBackup(JSON.parse(await file.text()), calendarDate()));
      setCloudUser(null);
    } catch (e) {
      notify(e.message);
    } finally {
      event.target.value = "";
    }
  }
  async function connect() {
    setWorking(true);
    try {
      const user = await loginWithGoogle();
      if (state.user.isLocal) {
        setCloudUser(user);
        setBackup(
          validateBackup(
            { ...(await gameSnapshot(state.user.uid)), origin: profile.saveId },
            calendarDate(),
          ),
        );
      } else {
        await refresh();
        notify("已綁定 Google，帳本仍使用同一份存檔。");
      }
    } catch (e) {
      notify(`連結尚未完成：${e.message}`);
    } finally {
      setWorking(false);
    }
  }
  async function performImport() {
    setWorking(true);
    setProgress("正在保存原資料並合併…");
    try {
      const uid = cloudUser?.uid ?? state.user.uid;
      await migrateGame(uid);
      await importGame(uid, backup, (done, total) =>
        setProgress(`已合併 ${done} / ${total} 筆`),
      );
      if (cloudUser) {
        localStorage.removeItem("expense-quest:mode");
        const url = new URL(location.href);
        url.searchParams.delete("local");
        location.assign(url.href);
        return;
      }
      await refresh();
      setBackup(null);
      notify("備份已合併，原有帳目與收藏保留。");
    } catch (e) {
      notify(`合併尚未完成，可重試接續：${e.message}`);
    } finally {
      setWorking(false);
      setProgress("");
    }
  }
  return (
    <main className="star-page star-settings">
      <PageHead eyebrow="旅人資料" title="個人資料與設定">
        <button className="star-text-button" onClick={() => navigate("town")}>
          回首頁
        </button>
      </PageHead>
      <div className="star-settings-avatar">
        <PaintedCharacter look={profile.equipped.layered} portrait reduced />
      </div>
      <section className="star-settings-section">
        <h2>讓冒險像自己</h2>
        <label className="star-field">
          冒險者名字
          <input
            value={name}
            maxLength={12}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="star-field">
          每日預算 · NT$
          <input
            value={budget}
            inputMode="decimal"
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>
        <p className="star-form-hint">
          已有紀錄的日期保留當時預算；新額度從下一個記錄日使用。預算只用來看收支，不影響冒險戰力。
        </p>
        <button
          className="star-button"
          disabled={state.busy}
          onClick={() => {
            const amount = parseAmount(budget);
            if (!amount || !name.trim())
              return notify("請填寫名字與有效預算。");
            updateGame(
              (p) => ({ ...p, playerName: name.trim(), dailyBudget: amount }),
              "個人資料已儲存。",
            );
          }}
        >
          儲存資料
        </button>
      </section>
      <section className="star-settings-section">
        <h2>聲音與動態</h2>
        {[
          ["musicEnabled", "庭院音樂", "輕柔的背景旋律"],
          ["soundEnabled", "操作音效", "記帳與取得收藏的提示"],
          ["hapticsEnabled", "觸覺回饋", "裝置支援時輕輕震動"],
          ["reduceMotion", "減少動態", "停止循環動畫，保留所有功能"],
        ].map(([key, label, desc]) => (
          <label className="star-setting-toggle" key={key}>
            <span>
              <strong>{label}</strong>
              <small>{desc}</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={!!profile.preferences?.[key]}
              disabled={state.busy}
              onChange={(e) => {
                // Capture the input before the asynchronous transaction rerenders this switch.
                const checked = e.currentTarget.checked;
                updateGame((p) => ({
                  ...p,
                  preferences: { ...p.preferences, [key]: checked },
                }));
              }}
            />
          </label>
        ))}
      </section>
      <section className="star-settings-section">
        <h2>帳本與存檔</h2>
        <div className="star-save-location">
          <span className={state.user.isLocal ? "is-local" : ""} />
          <div>
            <strong>
              {state.user.isLocal
                ? "此裝置的本機存檔"
                : state.user.isAnonymous
                  ? "雲端訪客存檔"
                  : "Google 雲端存檔"}
            </strong>
            <small>
              {state.user.isLocal
                ? "帳本保存在這個瀏覽器，請定期匯出備份。"
                : "每次儲存成功後，才會顯示已完成。"}
            </small>
          </div>
        </div>
        {(state.user.isLocal || state.user.isAnonymous) && (
          <button
            className="star-button star-button--quiet"
            disabled={working || !firebaseConfigured}
            onClick={connect}
          >
            {firebaseConfigured
              ? "連結 Google 與雲端存檔"
              : "本環境尚未設定雲端服務"}
          </button>
        )}
        <div className="star-data-actions">
          <button disabled={working} onClick={exportBackup}>
            匯出完整備份
          </button>
          <button disabled={working} onClick={() => uploadRef.current.click()}>
            匯入備份
          </button>
        </div>
        <input
          type="file"
          accept=".json,application/json"
          hidden
          ref={uploadRef}
          onChange={chooseFile}
        />
        <p className="star-form-hint">
          日期統一使用台灣時間。移轉不計入收入／支出；歷史帳目不設筆數截斷。
        </p>
      </section>
      {backup && (
        <section
          className="star-import-review"
          role="region"
          aria-label="備份合併確認"
        >
          <h2>{cloudUser ? "將本機帳本帶到雲端" : "合併這份備份"}</h2>
          <p>
            {backup.expenses.filter((row) => !row.deleted).length} 筆帳目 ·{" "}
            {backup.profile.collection.length} 件收藏
          </p>
          <p>
            只加入未存在的帳目；不覆蓋目前的修改與刪除。不同來源首次合併時，星幣和票券取較大值、不相加；同一來源重試不重複增加。原本資料會先備份。
          </p>
          {progress && <p role="status">{progress}</p>}
          <button
            className="star-button"
            disabled={working}
            onClick={performImport}
          >
            {working ? "正在合併…" : "確認合併並保留原資料"}
          </button>
          <button
            className="star-text-button"
            disabled={working}
            onClick={() => {
              setBackup(null);
              setCloudUser(null);
            }}
          >
            取消
          </button>
        </section>
      )}
      <footer className="star-settings-footer">
        窮鬼勇者 · 星頁旅程
        <br />
        每一筆日常，都有自己的故事。
      </footer>
    </main>
  );
}
