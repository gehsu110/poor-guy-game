import { useEffect, useState } from "react";
import { loadCharacterImages } from "./characterImages";

export default function useCharacterImages(sources) {
  const key = JSON.stringify([...new Set(sources.filter(Boolean))].sort());
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    loadCharacterImages(JSON.parse(key)).then(
      () => {
        if (active) setResult({ key, status: "ready" });
      },
      () => {
        if (active) setResult({ key, status: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [key]);
  // Changing a selection cannot reuse readiness from the previous set of parts.
  return result?.key === key ? result.status : "loading";
}
