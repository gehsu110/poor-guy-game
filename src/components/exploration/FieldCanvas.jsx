import { useEffect, useRef, useState } from "react";
export default function FieldCanvas({
  config,
  onFrame,
  onInteract,
  api,
  studio = false,
  onUnavailable,
}) {
  const canvas = useRef(null),
    latest = useRef({ config, onFrame, onInteract, onUnavailable });
  const [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    latest.current = { config, onFrame, onInteract, onUnavailable };
    api.current?.setConfig(config);
  }, [config, onFrame, onInteract, onUnavailable, api]);
  useEffect(() => {
    let cancelled = false,
      engine;
    const failure = (message) => {
      if (!cancelled) {
        setError(message);
        latest.current.onUnavailable?.();
      }
    };
    import("./fieldEngine.js")
      .then(({ createField }) => {
        if (cancelled) return;
        engine = createField(
          canvas.current,
          latest.current.config,
          (data) => latest.current.onFrame?.(data),
          (id) => latest.current.onInteract?.(id),
          failure,
          studio,
        );
        api.current = engine;
        setReady(true);
      })
      .catch(() =>
        failure("這個裝置目前無法開啟 3D 畫面。手帳和探索進度仍可使用。"),
      );
    return () => {
      cancelled = true;
      engine?.dispose();
      api.current = null;
    };
  }, [api, studio]);
  return (
    <div className={`field-render ${studio ? "field-render--studio" : ""}`}>
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label={
          studio
            ? "3D 造型預覽，拖曳旋轉人物"
            : "3D 星風原野，用方向鍵或 WASD 移動，E 互動，空白鍵跳躍。也可點地面走過去。"
        }
      />
      {!ready && !error && (
        <div className="field-loading">
          <i />
          <span>讓風帶你入場…</span>
        </div>
      )}
      {error && (
        <div className="field-fallback">
          <p>{error}</p>
          <button onClick={() => location.reload()}>重新載入</button>
        </div>
      )}
    </div>
  );
}
