import { useId } from "react";
import layout from "../../character/wind-rig-layout.json";
import useCharacterImages from "./useCharacterImages";
import { ATELIER_ATTACHMENTS } from "../../atelierAssets";

// One source coordinate system: clothing → prop → fingers, and a registered
// head variant with its fitted hat. All attachments share their parent's motion.
export default function CharacterRig({
  outfit,
  look,
  motion,
  portrait = false,
}) {
  const id = useId().replaceAll(":", "");
  const prop = portrait ? null : ATELIER_ATTACHMENTS[look?.prop];
  const status = useCharacterImages([outfit.poster, outfit.head, prop?.src]);
  const ready = status === "ready";
  const blinkReady =
    useCharacterImages(motion ? [outfit.blink] : []) === "ready";
  const { canvas, head: headFrame, portrait: portraitFrame, waistY } = layout;
  const view = portrait
    ? `${portraitFrame.x} ${portraitFrame.y} ${portraitFrame.width} ${portraitFrame.height}`
    : `0 0 ${canvas.width} ${canvas.height}`;
  const { x, y, width, height, angle } = outfit.prop;
  const head = (
    <g transform={`translate(${headFrame.x} ${headFrame.y})`}>
      <image
        href={outfit.head}
        width={headFrame.width}
        height={headFrame.height}
        clipPath={`url(#${id}-head)`}
      />
      {motion && blinkReady && (
        <image
          className="wind-rig-blink"
          href={outfit.blink}
          width={headFrame.width}
          height={headFrame.height}
          clipPath={`url(#${id}-eyes)`}
        />
      )}
    </g>
  );
  return (
    <svg
      className="wind-rig"
      viewBox={view}
      role="img"
      aria-label={
        portrait
          ? "冒險者頭像"
          : outfit.sex === "male"
            ? "男生星風旅人"
            : "女生星風旅人"
      }
      data-motion={ready && motion ? "on" : "off"}
      data-assets={status}
      aria-busy={status === "loading"}
    >
      <defs>
        <clipPath id={`${id}-head`}>
          <path d={outfit.headClip} />
        </clipPath>
        <clipPath id={`${id}-hand`}>
          <path d={outfit.hand} />
        </clipPath>
        <clipPath id={`${id}-eyes`}>
          {outfit.eyes.map(([cx, cy, rx, ry, rotation], i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          ))}
        </clipPath>
        <mask
          id={`${id}-body`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={canvas.width}
          height={canvas.height}
        >
          <rect width={canvas.width} height={canvas.height} fill="white" />
          <path
            d={outfit.headClip}
            transform={`translate(${headFrame.x} ${headFrame.y})`}
            fill="black"
          />
        </mask>
        <clipPath id={`${id}-lower`}>
          <rect
            y={waistY}
            width={canvas.width}
            height={canvas.height - waistY}
          />
        </clipPath>
        <clipPath id={`${id}-upper`}>
          <rect width={canvas.width} height={waistY + 0.5} />
        </clipPath>
      </defs>
      {!ready && (
        <image
          href={outfit.poster}
          width={canvas.width}
          height={canvas.height}
        />
      )}
      {ready && !portrait && (
        <>
          <image
            href={outfit.poster}
            width={canvas.width}
            height={canvas.height}
            clipPath={`url(#${id}-lower)`}
          />
          <g className="wind-rig-breath">
            <g clipPath={`url(#${id}-upper)`}>
              <image
                href={outfit.poster}
                width={canvas.width}
                height={canvas.height}
                mask={`url(#${id}-body)`}
              />
            </g>
            {prop && (
              <image
                href={prop.src}
                x={x}
                y={y}
                width={width}
                height={height}
                transform={`rotate(${angle} ${x + width / 2} ${y + 60})`}
              />
            )}
            {prop && (
              <image
                href={outfit.poster}
                width={canvas.width}
                height={canvas.height}
                clipPath={`url(#${id}-hand)`}
              />
            )}
            <g
              className="wind-rig-head"
              style={{ transformOrigin: outfit.neckPivot }}
            >
              {head}
            </g>
          </g>
        </>
      )}
      {ready && portrait && head}
      {status === "error" && <title>造型暫時無法載入，顯示完整基礎人物</title>}
    </svg>
  );
}
