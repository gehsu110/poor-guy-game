import { useMemo, useRef, useState } from "react";
import { useApp } from "../../useAppStore";
import {
  FIELD_STYLE,
  fieldLook,
  fieldState,
  wearFieldLook,
  fieldAction,
} from "../../game/exploration";
import { WorldDialog } from "../starpage/WorldUI";
import FieldCanvas from "./FieldCanvas";
const slots = [
  ["hair", "髮型"],
  ["outfit", "服裝"],
  ["hat", "頭飾"],
  ["pack", "隨身物"],
  ["reward", "探索收藏"],
];
export default function FieldWardrobe({ onClose, reduced }) {
  const { state, updateGame, navigate } = useApp(),
    api = useRef(null);
  const [draft, setDraft] = useState(() => fieldLook(state.profile)),
    [slot, setSlot] = useState("hair");
  const field = fieldState(state.profile),
    config = useMemo(
      () => ({ look: draft, field, reduced }),
      [draft, field, reduced],
    );
  const current = fieldLook(state.profile),
    changed = JSON.stringify(current) !== JSON.stringify(draft);
  return (
    <WorldDialog
      title="旅人的衣間"
      onClose={onClose}
      className="field-wardrobe"
    >
      <div className="field-fitting-stage">
        <span className="field-fitting-label">
          {state.profile.playerName}
          <small>STARWIND TRAVELER</small>
        </span>
        <FieldCanvas api={api} config={config} studio />
        <div className="field-turntable">
          <button
            aria-label="向左轉動角色"
            onClick={() => api.current?.rotate(-0.5)}
          >
            ↶
          </button>
          <span>拖曳查看 · 獨立混搭</span>
          <button
            aria-label="向右轉動角色"
            onClick={() => api.current?.rotate(0.5)}
          >
            ↷
          </button>
        </div>
        <button className="field-pose" onClick={() => api.current?.pose()}>
          打個招呼
        </button>
      </div>
      <div className="field-wardrobe-tabs" aria-label="造型部位">
        {slots.map(([id, name]) => (
          <button
            key={id}
            aria-pressed={slot === id}
            onClick={() => setSlot(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="field-style-options">
        {slot === "reward" ? (
          <>
            <button
              disabled={!field.brooch || state.busy}
              aria-pressed={field.wearingBrooch}
              onClick={() =>
                updateGame((p) =>
                  fieldAction(p, {
                    type: "wear",
                    item: "brooch",
                    value: !field.wearingBrooch,
                  }),
                )
              }
            >
              <span>✧</span>
              <b>風鈴胸針</b>
              <small>
                {field.brooch
                  ? field.wearingBrooch
                    ? "佩戴中"
                    : "點一下佩戴"
                  : "米菈的採花委託"}
              </small>
            </button>
            <button
              disabled={!field.treasure || state.busy}
              aria-pressed={field.followingWisp}
              onClick={() =>
                updateGame((p) =>
                  fieldAction(p, {
                    type: "wear",
                    item: "wisp",
                    value: !field.followingWisp,
                  }),
                )
              }
            >
              <span>◇</span>
              <b>微光精靈</b>
              <small>
                {field.treasure
                  ? field.followingWisp
                    ? "跟隨中"
                    : "點一下跟隨"
                  : "點亮古燈，開啟寶箱"}
              </small>
            </button>
          </>
        ) : (
          FIELD_STYLE[slot].map((item) => {
            const owned =
              !item.requires ||
              state.profile.collection.some((i) => i.id === item.requires);
            return (
              <button
                key={item.id}
                aria-pressed={draft[slot] === item.id}
                onClick={() => setDraft({ ...draft, [slot]: item.id })}
                className={`field-style-${item.id}`}
              >
                <span className={`field-swatch field-swatch--${slot}`}>
                  <i />
                  <i />
                  <i />
                </span>
                <b>{item.name}</b>
                <small>
                  {!owned
                    ? "試穿 · 需晚星制服"
                    : draft[slot] === item.id
                      ? "試穿中"
                      : "基礎款 · 已擁有"}
                </small>
              </button>
            );
          })
        )}
      </div>
      <div className="field-wardrobe-footer">
        <button
          className="field-text-button"
          onClick={() => {
            onClose();
            navigate("collection");
          }}
        >
          手繪收藏與小店 ›
        </button>
        <button
          className="field-primary"
          disabled={
            !changed ||
            state.busy ||
            Object.entries(draft).some(([s, id]) => {
              const item = FIELD_STYLE[s].find((i) => i.id === id);
              return (
                item?.requires &&
                !state.profile.collection.some((i) => i.id === item.requires)
              );
            })
          }
          onClick={async () => {
            if (
              await updateGame((p) => wearFieldLook(p, draft), "新搭配已穿上。")
            )
              onClose();
          }}
        >
          {state.busy ? "儲存中…" : changed ? "穿上這套" : "目前的搭配"}
        </button>
      </div>
    </WorldDialog>
  );
}
