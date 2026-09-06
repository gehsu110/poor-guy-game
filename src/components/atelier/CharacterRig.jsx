import { useId } from "react";
import layout from "../../character/wind-rig-layout.json";
import useCharacterImages from "./useCharacterImages";
import { characterAttachment } from "../../atelierAssets";
import AnimatedCharacter from "./AnimatedCharacter";
import { attachmentPivot } from "../../character/attachmentGeometry.js";

// One source coordinate system: clothing → prop → fingers, and a registered
// head variant with its fitted hat. All attachments share their parent's motion.
export default function CharacterRig({
  outfit,
  look,
  motion,
  portrait = false,
}) {
  const id = useId().replaceAll(":", "");
  const prop = portrait ? null : characterAttachment(outfit, look);
  const status = useCharacterImages([outfit.poster, outfit.head, prop?.src]);
  const ready = status === "ready";
  const blinkReady =
    useCharacterImages(motion ? [outfit.blink] : []) === "ready";
  const { canvas, head: headFrame, portrait: portraitFrame } = layout;
  const view = portrait
    ? `${portraitFrame.x} ${portraitFrame.y} ${portraitFrame.width} ${portraitFrame.height}`
    : `0 0 ${canvas.width} ${canvas.height}`;
  const { x, y, width, height, angle } = prop ?? outfit.prop;
  const pivot = attachmentPivot(prop ?? outfit.prop);
  const accessory = prop && (
    <image
      href={prop.src}
      x={x}
      y={y}
      width={width}
      height={height}
      transform={`rotate(${angle} ${pivot.x} ${pivot.y})`}
    />
  );
  const label = portrait
    ? "冒險者頭像"
    : outfit.sex === "male"
      ? "男生星風旅人"
      : "女生星風旅人";
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
    <div className="wind-rig-host">
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
        data-motion="off"
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
            {prop?.replaceHand && <path d={prop.replaceHand} fill="black" />}
          </mask>
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
            {prop?.behindBody && accessory}
            <image
              href={outfit.poster}
              width={canvas.width}
              height={canvas.height}
              mask={`url(#${id}-body)`}
            />
            <g>
              {!prop?.behindBody && accessory}
              {prop?.handInFront && (
                <image
                  href={outfit.poster}
                  width={canvas.width}
                  height={canvas.height}
                  clipPath={`url(#${id}-hand)`}
                />
              )}
              {head}
            </g>
          </>
        )}
        {ready && portrait && head}
        {status === "error" && (
          <title>造型暫時無法載入，顯示完整基礎人物</title>
        )}
      </svg>
      {ready && motion && !portrait && (
        <AnimatedCharacter
          key={`${outfit.poster}:${outfit.head}:${prop?.src ?? "none"}`}
          outfit={outfit}
          attachment={prop}
          label={label}
        />
      )}
    </div>
  );
}
