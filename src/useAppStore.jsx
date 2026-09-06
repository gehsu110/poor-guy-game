import { useContext, useReducer, useCallback, useEffect, useRef } from "react";
import {
  onAuth,
  loginAnonymously,
  LOCAL_USER,
  firebaseConfigured,
} from "./firebase";
import {
  migrateGame,
  readGame,
  commitLedger,
  confirmDay,
  gameTransaction,
  watchGame,
} from "./gameRepository";
import { calendarDate } from "./game/ledger";
import { startJourney, advanceJourney } from "./game/journey";
import { equipLook, purchase } from "./game/catalog";
import { playGameSound } from "./gameAudio";
import { AppContext as Ctx } from "./AppContext";
const PAGES = [
  "town",
  "adventure",
  "journal",
  "collection",
  "settings",
  "profile",
  "shop",
];
const route = () => {
  const url = new URL(location.href);
  const screen = url.searchParams.get("page");
  return {
    screen: PAGES.includes(screen) ? screen : "town",
    screenParams: { tab: url.searchParams.get("tab") ?? undefined },
  };
};
const init = {
  ...route(),
  user: null,
  profile: null,
  loading: true,
  error: null,
  busy: false,
  date: calendarDate(),
  dayRecord: {},
  dayRecords: {},
  expenses: [],
  totalSpent: 0,
  notification: null,
  rewardReveal: null,
  entryDraft: null,
  ledgerVersion: 0,
  damageNumbers: [],
  homeEffectPulse: null,
};
function reducer(state, action) {
  if (action.type === "HYDRATE")
    return {
      ...state,
      ...action.data,
      error: null,
      loading: false,
      ledgerVersion: state.ledgerVersion + 1,
    };
  if (action.type === "UPDATE_PROFILE")
    return { ...state, profile: { ...state.profile, ...action.data } };
  if (action.type === "SET_SCREEN")
    return {
      ...state,
      screen: action.screen,
      screenParams: action.params ?? {},
    };
  if (action.type === "SET_NOTIFICATION")
    return { ...state, notification: action.notification };
  if (action.type === "REVEAL") return { ...state, rewardReveal: action.value };
  if (action.type === "PATCH") return { ...state, ...action.data };
  return state;
}
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);
  const latest = useRef(state);
  const locked = useRef(false);
  const refreshPending = useRef(false);
  const hydrateGeneration = useRef(0);
  const notifyTimer = useRef(null);
  useEffect(() => {
    latest.current = state;
  }, [state]);
  useEffect(() => () => clearTimeout(notifyTimer.current), []);
  const patch = useCallback((data) => {
    latest.current = { ...latest.current, ...data };
    dispatch({ type: "PATCH", data });
  }, []);
  const notify = useCallback((message) => {
    clearTimeout(notifyTimer.current);
    dispatch({
      type: "SET_NOTIFICATION",
      notification: { message, id: crypto.randomUUID() },
    });
    notifyTimer.current = setTimeout(
      () => dispatch({ type: "SET_NOTIFICATION", notification: null }),
      4000,
    );
  }, []);
  const hydrate = useCallback(async (user) => {
    const generation = ++hydrateGeneration.current;
    const date = calendarDate();
    const snapshot = await readGame(user.uid, date);
    if (generation !== hydrateGeneration.current) return latest.current;
    const data = {
      ...snapshot,
      user,
      date,
      totalSpent: snapshot.dayRecord.spent ?? 0,
      loading: false,
    };
    latest.current = { ...latest.current, ...data };
    dispatch({ type: "HYDRATE", data });
    return data;
  }, []);
  useEffect(() => {
    let alive = true,
      generation = 0;
    const unsubscribe = onAuth(async (authUser) => {
      const current = ++generation;
      try {
        const requestedLocal =
          import.meta.env.DEV &&
          new URLSearchParams(location.search).get("local") === "1";
        let user = authUser;
        if (
          requestedLocal ||
          !firebaseConfigured ||
          localStorage.getItem("expense-quest:mode") === "local"
        )
          user = LOCAL_USER;
        else if (!user) {
          try {
            user = await loginAnonymously();
          } catch {
            user = LOCAL_USER;
            localStorage.setItem("expense-quest:mode", "local");
          }
        }
        await migrateGame(user.uid);
        if (alive && current === generation) await hydrate(user);
      } catch (error) {
        if (alive) patch({ loading: false, error: error.message });
      }
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [hydrate, patch]);
  const refresh = useCallback(async () => {
    if (!latest.current.user) return;
    if (locked.current) {
      refreshPending.current = true;
      return;
    }
    try {
      await hydrate(latest.current.user);
    } catch (error) {
      notify(error.message);
    }
  }, [hydrate, notify]);
  useEffect(() => {
    if (!state.user) return;
    return watchGame(state.user.uid, refresh, (error) =>
      notify(`同步暫停：${error.message}`),
    );
  }, [state.user, refresh, notify]);
  useEffect(() => {
    const check = () => {
      if (!document.hidden && latest.current.user) refresh();
    };
    const interval = setInterval(() => {
      if (latest.current.date !== calendarDate()) check();
    }, 15000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    const pop = () => {
      dispatch({ type: "SET_SCREEN", ...route() });
      patch({ entryDraft: null });
    };
    window.addEventListener("popstate", pop);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("popstate", pop);
    };
  }, [refresh, patch]);
  const run = useCallback(
    async (operation) => {
      if (locked.current) return false;
      locked.current = true;
      ++hydrateGeneration.current;
      patch({ busy: true });
      try {
        let current = latest.current;
        if (current.date !== calendarDate())
          current = { ...current, ...(await hydrate(current.user)) };
        await operation(current);
        await hydrate(current.user);
        return true;
      } catch (error) {
        notify(error.message || "尚未完成儲存，請重試。");
        return false;
      } finally {
        locked.current = false;
        patch({ busy: false });
        if (refreshPending.current) {
          refreshPending.current = false;
          refresh();
        }
      }
    },
    [hydrate, notify, patch, refresh],
  );
  const navigate = useCallback(
    (requested, params = {}) => {
      const screen =
        { map: "adventure", missions: "journal", quest: "journal" }[
          requested
        ] ?? requested;
      if (screen === "battle") {
        patch({
          entryDraft: {
            id: crypto.randomUUID(),
            operationId: crypto.randomUUID(),
            date: calendarDate(),
            kind: "expense",
            category: "餐飲",
            amount: "",
            note: "",
          },
        });
        return;
      }
      const actual = PAGES.includes(screen) ? screen : "town";
      const url = new URL(location.href);
      url.searchParams.set("page", actual);
      if (params.tab) url.searchParams.set("tab", params.tab);
      else url.searchParams.delete("tab");
      history.pushState(null, "", url);
      dispatch({ type: "SET_SCREEN", screen: actual, params });
    },
    [patch],
  );
  const openEntry = useCallback(
    (entry) => {
      let draft = null;
      if (!entry) {
        try {
          const stored = JSON.parse(
            sessionStorage.getItem(`starpage-draft:${latest.current.user.uid}`),
          );
          if (
            stored &&
            typeof stored.id === "string" &&
            typeof stored.operationId === "string" &&
            !stored.editing &&
            ["expense", "income", "transfer"].includes(stored.kind)
          )
            draft = stored;
        } catch {
          /* Invalid or unavailable drafts never block the ledger. */
        }
      }
      patch({
        entryDraft: entry
          ? {
              ...entry,
              editing: !entry.newEntry,
              operationId: crypto.randomUUID(),
            }
          : (draft ?? {
              id: crypto.randomUUID(),
              operationId: crypto.randomUUID(),
              date: calendarDate(),
              kind: "expense",
              category: "餐飲",
              amount: "",
              note: "",
            }),
      });
    },
    [patch],
  );
  const saveEntry = useCallback(
    (draft) =>
      run(async (current) => {
        await commitLedger(current.user.uid, {
          id: draft.id,
          operationId: draft.operationId,
          type: draft.editing ? "update" : "add",
          expectedRevision: draft.revision ?? 0,
          data: {
            date: draft.date,
            kind: draft.kind,
            category: draft.category,
            amount: draft.amount,
            note: draft.note,
          },
        });
        playGameSound("save", current.profile.preferences);
        if (
          current.profile.preferences?.haptics &&
          !current.profile.preferences?.reduceMotion &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          navigator.vibrate?.(20);
        patch({ homeEffectPulse: crypto.randomUUID() });
        notify(
          draft.editing
            ? "修改已儲存，冒險進度會保留。"
            : "已記好了，這一頁也成為你的故事。",
        );
      }),
    [run, notify, patch],
  );
  const deleteEntry = useCallback(
    (entry) =>
      run(async (current) => {
        await commitLedger(current.user.uid, {
          id: entry.id,
          type: "delete",
          operationId: `delete:${entry.id}:${entry.revision ?? 0}`,
          expectedRevision: entry.revision ?? 0,
        });
        notify("紀錄已刪除，已取得的收藏與進度會保留。");
      }),
    [run, notify],
  );
  const recordAction = useCallback(
    (action) =>
      run(async (current) => {
        await confirmDay(
          current.user.uid,
          action,
          current.dayRecord.revision ?? 0,
        );
        playGameSound("save", current.profile.preferences);
        notify(
          action === "review"
            ? "今天的手帳已確認。"
            : "已確認零消費，今天也留下了一頁。",
        );
      }),
    [run, notify],
  );
  const updateGame = useCallback(
    (transform, message) =>
      run(async (current) => {
        await gameTransaction(current.user.uid, (profile, record) => ({
          profile: transform(profile),
          record,
        }));
        if (message) notify(message);
      }),
    [run, notify],
  );
  const beginJourney = useCallback(
    (route) =>
      updateGame((profile) =>
        startJourney(profile, route, crypto.randomUUID()),
      ),
    [updateGame],
  );
  const actJourney = useCallback(
    (id, turn, skill) =>
      run(async (current) => {
        const result = await gameTransaction(
          current.user.uid,
          (profile, record) => ({
            profile: advanceJourney(profile, id, turn, skill),
            record,
          }),
        );
        if (!result.profile.journey.active)
          playGameSound("reward", current.profile.preferences);
      }),
    [run],
  );
  const equip = useCallback(
    (look) =>
      updateGame(
        (profile) => equipLook(profile, look),
        "這套搭配已穿上，首頁與冒險會一起更新。",
      ),
    [updateGame],
  );
  const buy = useCallback(
    (id) =>
      updateGame(
        (profile) => purchase(profile, id, crypto.randomUUID()),
        "收藏已放進衣櫃，可以穿上了。",
      ),
    [updateGame],
  );
  return (
    <Ctx.Provider
      value={{
        state,
        dispatch,
        patch,
        notify,
        navigate,
        refresh,
        run,
        openEntry,
        saveEntry,
        deleteEntry,
        recordAction,
        updateGame,
        beginJourney,
        actJourney,
        equip,
        buy,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(Ctx);
}
