import { useEffect, useRef, useState } from "react";
import layout from "../../character/wind-rig-layout.json";
import { clothFields } from "../../character/clothMotion";
import { loadCharacterImages } from "./characterImages";
import { createCharacterTexture } from "./composeCharacter";
import { createClothRenderer } from "./clothRenderer";

export default function AnimatedCharacter({ outfit, attachment, label }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  // Stable input snapshot: speech bubbles do not restart the idle animation.
  const input = JSON.stringify({ outfit, attachment });
  useEffect(() => {
    const canvas = ref.current;
    const { outfit: look, attachment: prop } = JSON.parse(input);
    let active = true;
    let frameId;
    let renderer;
    let resize;
    const lost = (event) => {
      event.preventDefault();
      active = false;
      cancelAnimationFrame(frameId);
      setReady(false);
    };
    const restored = () => setGeneration((value) => value + 1);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    const sources = [
      ...new Set([look.poster, look.head, prop?.src].filter(Boolean)),
    ];
    loadCharacterImages(sources)
      .then((decoded) => {
        if (!active) return;
        const images = new Map(sources.map((src, i) => [src, decoded[i]]));
        const texture = createCharacterTexture(look, prop, images);
        renderer = createClothRenderer(
          canvas,
          layout.canvas,
          clothFields(look.sex, look.top),
          look.neckPivot.split(" ").map(parseFloat),
          prop,
        );
        if (!renderer) return;
        const fit = () => {
          const rect = canvas.getBoundingClientRect();
          const ratio = Math.min(
            Math.max(window.devicePixelRatio || 1, 1.5),
            1.75,
            1400 / Math.max(rect.height, 1),
          );
          canvas.width = Math.max(1, Math.round(rect.width * ratio));
          canvas.height = Math.max(1, Math.round(rect.height * ratio));
        };
        fit();
        resize = new ResizeObserver(fit);
        resize.observe(canvas);
        renderer.upload(texture.draw());
        renderer.draw(0);
        setReady(true);
        loadCharacterImages([look.blink])
          .then(([blink]) => {
            if (active) images.set(look.blink, blink);
          })
          .catch(() => {});
        const start = performance.now();
        let previous = 0;
        let wasBlinking = false;
        const tick = (now) => {
          if (!active) return;
          if (now - previous >= 1000 / 30) {
            previous = now;
            const seconds = (now - start) / 1000;
            const blinking = seconds % 6.2 > 5.75 && seconds % 6.2 < 5.88;
            if (blinking !== wasBlinking) {
              renderer.upload(texture.draw(blinking));
              wasBlinking = blinking;
            }
            renderer.draw(seconds);
          }
          frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
      })
      .catch(() => {
        if (active) setReady(false);
      });
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      resize?.disconnect();
      renderer?.dispose();
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [input, generation]);
  return (
    <canvas
      ref={ref}
      className="wind-rig-canvas"
      data-ready={ready ? "true" : "false"}
      role="img"
      aria-label={label}
      aria-hidden={!ready}
    />
  );
}
