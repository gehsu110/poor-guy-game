import { useEffect, useRef, useState } from "react";
// A static illustration remains underneath until playback is ready.
export default function AnimatedLayer({
  src,
  enabled,
  transparent = false,
  className = "",
}) {
  const ref = useRef(null),
    unavailable = useRef(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let inView = true;
    const sync = () => {
      if (enabled && inView && !document.hidden && !unavailable.current)
        node.play().catch(() => setPlaying(false));
      else node.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      node.pause();
    };
  }, [enabled, src]);
  function verifyAlpha() {
    if (!transparent) return;
    const node = ref.current;
    try {
      // The top-left corner of every character clip is fully transparent.
      // Some decoders play VP9 but discard alpha; keep the poster in that case.
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(node, 0, 0, 1, 1, 0, 0, 1, 1);
      unavailable.current = ctx.getImageData(0, 0, 1, 1).data[3] > 10;
    } catch {
      unavailable.current = true;
    }
    if (unavailable.current) {
      node.pause();
      setPlaying(false);
    }
  }
  if (!enabled || !src) return null;
  return (
    <video
      ref={ref}
      className={`${className} ${playing ? "is-playing" : ""}`}
      src={src}
      autoPlay
      muted
      playsInline
      loop
      preload="metadata"
      onLoadedData={verifyAlpha}
      onPlaying={() => {
        if (!unavailable.current) setPlaying(true);
        else ref.current?.pause();
      }}
      onError={() => {
        unavailable.current = true;
        setPlaying(false);
      }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
