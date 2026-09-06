import { ATELIER_SCENE, ATELIER_SCENE_MOTION } from "../../atelierAssets";
import { useReducedMotion } from "framer-motion";
import { useApp } from "../../useAppStore";
import AnimatedLayer from "./AnimatedLayer";
export default function AtelierBackdrop() {
  const { state } = useApp();
  const reduced =
    useReducedMotion() || state.profile?.preferences?.reduceMotion;
  const animate =
    !reduced && !navigator.connection?.saveData && !state.entryDraft;
  return (
    <div className="wind-backdrop" aria-hidden="true">
      <img className="wind-scene" src={ATELIER_SCENE} alt="" />
      <AnimatedLayer
        src={ATELIER_SCENE_MOTION}
        enabled={animate}
        className="wind-scene wind-scene-motion"
      />
      <div className="wind-scene-shade" />
      <div className="wind-scene-light" />
      <div className="wind-sea-motes">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
    </div>
  );
}
