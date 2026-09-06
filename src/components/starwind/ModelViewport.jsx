import { useEffect, useRef, useState } from "react";
import "./starwind.css";
export default function ModelViewport({
  url,
  accessories,
  reduced = false,
  interactive = false,
  portrait = false,
  greet = 0,
  className = "",
  poster,
  controls = false,
}) {
  const canvas = useRef(null),
    api = useRef(null),
    latest = useRef(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    latest.current = {
      url,
      accessories,
      reduced,
      interactive,
      portrait,
      greet,
    };
    let cancelled = false;
    api.current
      ?.update(latest.current)
      .then((loaded) => {
        if (loaded && !cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url, accessories, reduced, interactive, portrait, greet]);
  useEffect(() => {
    let cancelled = false,
      stage;
    import("./modelStage.js")
      .then(({ createModelStage }) => {
        if (cancelled) return;
        stage = createModelStage(
          canvas.current,
          latest.current,
          () => {
            if (!cancelled) setStatus("ready");
          },
          (error) => {
            if (import.meta.env.DEV) console.warn("Starwind model:", error);
            if (!cancelled) setStatus("error");
          },
        );
        if (cancelled) stage.dispose();
        else api.current = stage;
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      stage?.dispose();
      api.current = null;
    };
  }, []);
  return (
    <div
      className={`starwind-viewport ${className}`}
      data-interactive={interactive}
      data-portrait={portrait}
    >
      {status !== "ready" && poster && (
        <img className="starwind-poster" src={poster} alt="星風旅人" />
      )}
      <canvas
        ref={canvas}
        className={status === "ready" ? "is-ready" : ""}
        role={interactive ? "button" : "img"}
        tabIndex={interactive ? 0 : undefined}
        aria-label={
          interactive ? "星風旅人，左右方向鍵旋轉，空白鍵打招呼" : "星風旅人"
        }
        onKeyDown={(event) => {
          if (!interactive) return;
          if (["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            if (event.key === "ArrowLeft") api.current?.rotate(-0.55);
            else if (event.key === "ArrowRight") api.current?.rotate(0.55);
            else api.current?.greet();
          }
        }}
      />
      {status === "loading" && !poster && (
        <span className="starwind-loading">正在準備造型…</span>
      )}
      {status === "error" && (
        <span className="starwind-loading">角色暫時載入失敗，請重新載入。</span>
      )}
      {controls && status === "ready" && (
        <div className="starwind-rotation-controls">
          <button
            onClick={() => api.current?.rotate(-0.55)}
            aria-label="向左轉動人物"
          >
            ↶
          </button>
          <span>拖曳查看細節</span>
          <button
            onClick={() => api.current?.rotate(0.55)}
            aria-label="向右轉動人物"
          >
            ↷
          </button>
        </div>
      )}
    </div>
  );
}
