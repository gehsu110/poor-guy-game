import { useId, useState, useEffect } from "react";
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
  const [headReady, setHeadReady] = useState(false);
  useEffect(() => {
    let active = true;
    const image = new window.Image();
    image.src = outfit.head;
    image
      .decode()
      .then(() => {
        if (active) setHeadReady(true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [outfit.head]);
  const prop = ATELIER_ATTACHMENTS[look?.prop];
  const { x, y, width, height, angle } = outfit.prop;
  const head = (
    <g
      transform="translate(425 65)"
      visibility={headReady ? "visible" : "hidden"}
    >
      <image
        href={outfit.head}
        width="800"
        height="600"
        clipPath={`url(#${id}-head)`}
      />
      {motion && (
        <image
          className="wind-rig-blink"
          href={outfit.blink}
          width="800"
          height="600"
          clipPath={`url(#${id}-eyes)`}
        />
      )}
    </g>
  );
  return (
    <svg
      className="wind-rig"
      viewBox={portrait ? "625 85 460 480" : "0 0 1696 2528"}
      role="img"
      aria-label={
        portrait
          ? "冒險者頭像"
          : outfit.sex === "male"
            ? "男生星風旅人"
            : "女生星風旅人"
      }
      data-motion={motion ? "on" : "off"}
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
          width="1696"
          height="2528"
        >
          <rect width="1696" height="2528" fill="white" />
          <path
            d={outfit.headClip}
            transform="translate(425 65)"
            fill="black"
          />
        </mask>
        <clipPath id={`${id}-lower`}>
          <rect y="1100" width="1696" height="1428" />
        </clipPath>
        <clipPath id={`${id}-upper`}>
          <rect width="1696" height="1100.5" />
        </clipPath>
      </defs>
      {!portrait && (
        <>
          <image
            href={outfit.poster}
            width="1696"
            height="2528"
            clipPath={`url(#${id}-lower)`}
          />
          <g className="wind-rig-breath">
            <g clipPath={`url(#${id}-upper)`}>
              <image
                href={outfit.poster}
                width="1696"
                height="2528"
                mask={headReady ? `url(#${id}-body)` : undefined}
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
                width="1696"
                height="2528"
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
      {portrait && head}
    </svg>
  );
}
