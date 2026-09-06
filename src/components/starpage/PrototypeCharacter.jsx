import { useEffect, useId, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ITEM_BY_ID, normalizeLook } from "../../game/catalog";
import "./character.css";

export function LittleFriend({ kind = "owl", className = "" }) {
  return (
    <svg
      className={`little-friend ${className}`}
      viewBox="0 0 150 160"
      role="img"
      aria-label={kind === "cat" ? "收據信差貓" : "書頁小鴞"}
    >
      <ellipse cx="75" cy="143" rx="39" ry="7" fill="#5e6c53" opacity=".15" />
      <g
        className="friend-body"
        stroke="#66564b"
        strokeWidth="2.6"
        strokeLinejoin="round"
      >
        {kind === "cat" && (
          <path
            d="M103 120Q145 134 130 91Q125 79 119 90Q116 99 124 105Q132 124 106 116"
            fill="#dfb184"
          />
        )}
        <path
          d="M44 121L43 140Q52 149 63 139L63 127M87 128L87 141Q103 149 109 138L105 120"
          fill="#ca9a6a"
        />
        <path
          d="M37 81Q24 105 35 133Q74 151 113 133Q124 104 110 80Z"
          fill={kind === "cat" ? "#e6bf93" : "#8faa95"}
        />
        <path
          d="M48 98Q39 126 75 137Q109 127 99 98"
          fill="#fff0d4"
          stroke="none"
        />
        <path
          d="M37 48L32 20Q45 16 56 31Q77 23 96 32L118 21L113 59"
          fill={kind === "cat" ? "#deb489" : "#987358"}
        />
        <path
          d="M30 64Q29 31 74 29Q121 29 122 67Q126 104 76 109Q28 107 30 64"
          fill={kind === "cat" ? "#f1d0a4" : "#c89d72"}
        />
        {kind !== "cat" && (
          <>
            <path
              d="M76 44Q49 30 37 53Q27 85 58 94L76 84L91 95Q126 83 113 53Q101 31 76 44"
              fill="#fff0d7"
            />
            <path d="M71 76L80 76L75 85Z" fill="#d9a044" />
          </>
        )}
        <g className="friend-eyes" fill="#413d44" stroke="none">
          <ellipse cx="55" cy="68" rx="5" ry="8" />
          <ellipse cx="96" cy="68" rx="5" ry="8" />
          <circle cx="57" cy="65" r="1.7" fill="#fff9e9" />
          <circle cx="98" cy="65" r="1.7" fill="#fff9e9" />
        </g>
        <ellipse
          cx="44"
          cy="83"
          rx="7"
          ry="4"
          fill="#d88f81"
          opacity=".6"
          stroke="none"
        />
        <ellipse
          cx="107"
          cy="83"
          rx="7"
          ry="4"
          fill="#d88f81"
          opacity=".6"
          stroke="none"
        />
        {kind === "cat" && (
          <path
            d="M71 78L79 78L75 83M66 86Q72 90 75 83Q81 90 86 85"
            fill="#bd8978"
          />
        )}
        <path
          d="M35 103Q76 119 114 104L102 119L79 112L63 130L53 113Z"
          fill="#759780"
        />
        <path
          d="M34 115Q25 103 29 97Q42 94 49 117M114 113Q128 96 123 91Q110 96 104 112"
          fill={kind === "cat" ? "#e6bf93" : "#8eaa94"}
        />
        <path d="M57 115L91 115L96 134L60 139Z" fill="#ab7755" />
        <path d="M58 115L79 128L91 116" fill="#c59264" />
      </g>
    </svg>
  );
}

export default function PrototypeCharacter({
  look,
  action = "idle",
  reduced = false,
  interactive = false,
  className = "",
  portrait = false,
  onGreet,
}) {
  const uid = useId().replace(/:/g, "");
  const selected = normalizeLook(look);
  const [greeting, setGreeting] = useState(false);
  const systemReduced = useReducedMotion();
  useEffect(() => {
    if (!greeting) return;
    const timer = setTimeout(() => setGreeting(false), 1800);
    return () => clearTimeout(timer);
  }, [greeting]);
  const tone = ITEM_BY_ID[selected.top]?.look ?? "mint";
  const braid = ITEM_BY_ID[selected.hair]?.look === "braid";
  const skirt = ITEM_BY_ID[selected.bottom]?.look === "skirt";
  const hat = ITEM_BY_ID[selected.hat]?.look;
  const wand = ITEM_BY_ID[selected.prop]?.look === "wand";
  const colors =
    tone === "courier"
      ? ["#d5a260", "#edc58b", "#f4e6c9"]
      : tone === "star"
        ? ["#777391", "#a09bb7", "#eadfcb"]
        : ["#7f9f8b", "#aec4a9", "#ece2c8"];
  const quiet = reduced || systemReduced;
  const content = (
    <svg
      viewBox={portrait ? "83 75 194 203" : "0 0 360 500"}
      className="rig-svg"
      role="img"
      aria-label={`${braid ? "可可雙辮" : "栗色短髮"}、${ITEM_BY_ID[selected.top]?.name}、${ITEM_BY_ID[selected.bottom]?.name}的冒險者`}
      data-look={Object.values(selected).filter(Boolean).join(" ")}
    >
      <defs>
        <linearGradient id={`${uid}-skin`} x2=".3" y2="1">
          <stop stopColor="#fff0d6" />
          <stop offset="1" stopColor="#f0c49f" />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x2=".7" y2="1">
          <stop stopColor={braid ? "#9f745a" : "#b28a62"} />
          <stop offset="1" stopColor="#725344" />
        </linearGradient>
        <linearGradient id={`${uid}-cloth`} x2=".7" y2="1">
          <stop stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[0]} />
        </linearGradient>
        <linearGradient id={`${uid}-boot`} x2="0" y2="1">
          <stop stopColor="#9c7454" />
          <stop offset="1" stopColor="#654c40" />
        </linearGradient>
      </defs>
      {!portrait && (
        <ellipse
          cx="180"
          cy="465"
          rx="65"
          ry="10"
          fill="#746846"
          opacity=".17"
        />
      )}
      <g
        stroke="#725b49"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g data-slot="bottom">
          <path
            d="M140 351L144 420Q153 431 167 422L172 352M187 352L193 422Q207 432 220 419L222 350"
            fill={`url(#${uid}-skin)`}
          />
          <path
            d="M142 401L145 428L165 428L168 401M191 401L195 428L218 428L220 401"
            fill="#f0e3c8"
          />
          {skirt ? (
            <>
              <path
                d="M140 321L117 375Q181 399 239 375L218 321Z"
                fill="#8c9781"
              />
              <path
                d="M149 335L143 380M168 335L166 385M192 335L196 385M212 335L225 379"
                fill="none"
                stroke="#697e70"
              />
              <path d="M124 370Q180 388 233 370" fill="none" stroke="#c1c8a7" />
            </>
          ) : (
            <>
              <path
                d="M137 322L135 376Q151 385 172 377L181 347L190 377Q208 384 229 375L221 323Z"
                fill="#696d85"
              />
              <path d="M138 369L173 371M190 371L226 368" stroke="#9d9fac" />
              <path d="M154 333L153 353M210 333L211 351" fill="none" />
            </>
          )}
          <path
            d="M143 420L168 420L168 446Q168 453 154 455L124 455Q117 448 128 441L141 435Z"
            fill={`url(#${uid}-boot)`}
          />
          <path
            d="M193 420L220 419L222 437Q242 443 241 451L235 456L203 456Q193 454 193 446Z"
            fill={`url(#${uid}-boot)`}
          />
          <path
            d="M124 455L166 455M197 456L237 456"
            stroke="#584c42"
            strokeWidth="5"
          />
          <path
            d="M147 429L159 429M144 436L158 436M202 429L214 429M203 437L218 437"
            stroke="#d7b484"
            strokeWidth="2.2"
          />
        </g>
        <g data-slot="top">
          <path
            d="M131 269Q178 249 224 270L231 333Q181 351 129 333Z"
            fill={`url(#${uid}-cloth)`}
          />
          <path d="M171 260L191 260L198 322L178 330L165 319Z" fill="#f4e6cb" />
          <path d="M178 281L181 328" stroke="#d4bea0" />
          <path
            d="M130 325Q180 339 229 324L230 337Q179 350 129 337Z"
            fill={tone === "courier" ? "#9f7856" : "#6d7c75"}
          />
          <path
            d="M138 291L158 294L157 314Q143 319 137 309Z"
            fill={colors[1]}
          />
          <path
            d="M204 293L222 290L221 309Q213 319 204 314Z"
            fill={colors[1]}
          />
          {tone === "star" && (
            <g fill="#e7c98d" strokeWidth="1">
              <path d="M143 275L145 282L152 284L146 288L145 294L141 288L136 285L141 281Z" />
              <path d="M211 319L213 323L217 324L214 327L211 333L209 327L205 324L210 323Z" />
            </g>
          )}
        </g>
        <g transform="translate(132 275)">
          <g className="rig-arm rig-arm-left" data-slot="left-sleeve">
            <path
              d="M-4 -6Q-20 -8 -23 11L-21 55Q-12 65 -1 58L6 12Z"
              fill={`url(#${uid}-cloth)`}
            />
            <path d="M-22 47L1 48L1 60L-20 60Z" fill={colors[2]} />
            <path
              d="M-19 60Q-23 76 -11 79Q2 80 3 66L0 60Z"
              fill={`url(#${uid}-skin)`}
            />
            <path d="M-8 64L-7 72" fill="none" strokeWidth="1.7" />
          </g>
        </g>
        <g transform="translate(223 276)">
          <g className="rig-arm rig-arm-right" data-slot="right-sleeve">
            <path
              d="M-5 -8Q15 -9 21 12L17 50Q6 58 -4 48L-8 12Z"
              fill={`url(#${uid}-cloth)`}
            />
            <path d="M-4 41L19 43L17 55L-4 54Z" fill={colors[2]} />
            <g data-slot="prop">
              {wand ? (
                <>
                  <path d="M7 75L26 12" stroke="#9c7951" strokeWidth="7" />
                  <path
                    d="M29 9Q9 -11 31 -26Q22 -9 43 -3Q39 9 29 9"
                    fill="#dfbf74"
                  />
                  <path
                    className="rig-spell-star"
                    d="M34 -33L38 -26L46 -25L39 -20L38 -12L33 -19L26 -19L30 -25Z"
                    fill="#f3d58b"
                    stroke="none"
                  />
                </>
              ) : (
                <>
                  <path d="M-18 36L22 30L28 72L-13 79Z" fill="#77768e" />
                  <path d="M-13 78L29 71L29 77L-12 85Z" fill="#f2e3c3" />
                  <path
                    d="M-17 37L-12 80"
                    fill="none"
                    stroke="#d9bd83"
                    strokeWidth="5"
                  />
                  <path
                    d="M4 43L7 49L14 51L8 55L7 62L2 57L-4 55L1 50Z"
                    fill="#e7c785"
                    strokeWidth="1.6"
                  />
                  <path d="M17 35L21 66" stroke="#b1a8b3" strokeWidth="1.7" />
                </>
              )}
            </g>
            <path
              d="M-2 54Q-11 51 -12 59Q-12 70 1 72Q9 70 11 64Q9 55 4 58L0 60Z"
              fill={`url(#${uid}-skin)`}
            />
          </g>
        </g>
        <g data-slot="collar">
          <path
            d="M142 253L126 268L152 286L176 269L202 286L231 267L213 253Z"
            fill={tone === "courier" ? "#e8c27e" : colors[1]}
          />
          <path d="M149 253L157 272L178 268L199 273L207 253" fill="#fff0d6" />
          <path
            d="M177 266L165 291L180 286L191 294L186 266Z"
            fill={tone === "mint" ? "#677f75" : "#886653"}
          />
          <circle cx="181" cy="270" r="5" fill="#e4bb6d" />
        </g>
        <g transform="translate(180 195)">
          <g className="rig-head">
            <g data-slot="hair-back">
              <path
                d="M-71 -35Q-72 -88 -13 -96Q44 -105 73 -52Q97 13 64 60L-61 63Q-91 34 -71 -35"
                fill={`url(#${uid}-hair)`}
              />
              {braid && (
                <>
                  <path
                    className="rig-braid-left"
                    d="M-66 10Q-95 33 -71 48Q-94 64 -71 78Q-89 96 -65 108L-49 105Q-41 94 -57 78Q-38 65 -57 47Q-40 27 -66 10"
                    fill={`url(#${uid}-hair)`}
                  />
                  <path
                    className="rig-braid-right"
                    d="M66 9Q91 29 71 47Q94 63 73 78Q91 95 65 106L51 103Q44 94 58 79Q39 64 58 48Q42 28 66 9"
                    fill={`url(#${uid}-hair)`}
                  />
                  <path
                    d="M-73 96L-49 99L-53 111L-70 108M52 97L73 95L73 108L54 110"
                    fill="#ac838b"
                  />
                </>
              )}
            </g>
            <path
              d="M-72 -3Q-89 -10 -88 8Q-86 26 -67 23M71 -3Q91 -10 88 11Q85 28 67 23"
              fill={`url(#${uid}-skin)`}
            />
            <path
              d="M-68 -30Q-52 -71 -1 -64Q57 -69 70 -25L65 28Q53 69 0 72Q-57 68 -67 25Z"
              fill={`url(#${uid}-skin)`}
            />
            <path
              d="M-66 -10Q-49 -25 -44 -50Q-24 -34 -12 -52Q-2 -18 17 -17L14 -43Q36 -16 66 -11L68 -32Q55 -77 0 -78Q-56 -76 -66 -43Z"
              fill={`url(#${uid}-hair)`}
            />
            <path
              d="M-58 -47Q-57 -13 -68 9L-69 -34M60 -48Q57 -18 69 11L70 -35"
              fill={`url(#${uid}-hair)`}
            />
            <path
              d="M-48 -56Q-29 -74 -7 -68M17 -65Q41 -63 52 -43"
              fill="none"
              stroke="#d0a577"
              strokeWidth="4"
              opacity=".5"
            />
            <path
              d="M-43 -2Q-32 -9 -22 -3M22 -3Q35 -9 45 -1"
              fill="none"
              stroke="#7b5d4b"
              strokeWidth="3"
            />
            <g className="rig-eyes" fill="#4c4559" stroke="none">
              <ellipse cx="-32" cy="19" rx="9.5" ry="15" />
              <ellipse cx="33" cy="19" rx="9.5" ry="15" />
              <ellipse cx="-30" cy="27" rx="5" ry="5.5" fill="#897281" />
              <ellipse cx="35" cy="27" rx="5" ry="5.5" fill="#897281" />
              <circle cx="-29" cy="13" r="3.7" fill="#fff9e9" />
              <circle cx="36" cy="13" r="3.7" fill="#fff9e9" />
              <circle cx="-35" cy="23" r="1.6" fill="#d6c8c0" />
              <circle cx="30" cy="23" r="1.6" fill="#d6c8c0" />
            </g>
            <path
              d="M-42 9L-47 5M41 9L46 5"
              fill="none"
              stroke="#574654"
              strokeWidth="2"
            />
            <ellipse
              cx="-48"
              cy="38"
              rx="13"
              ry="6.5"
              fill="#e69d8e"
              opacity=".48"
              stroke="none"
            />
            <ellipse
              cx="49"
              cy="38"
              rx="13"
              ry="6.5"
              fill="#e69d8e"
              opacity=".48"
              stroke="none"
            />
            <path
              d="M-7 45Q0 52 8 44"
              fill="none"
              stroke="#aa7666"
              strokeWidth="2.5"
            />
            <path d="M-2 32L0 34" stroke="#daa68a" strokeWidth="3" />
            <g data-slot="hat">
              {hat === "beret" && (
                <>
                  <path
                    d="M-72 -64Q-71 -99 -28 -109Q-5 -134 14 -120Q38 -118 61 -98Q79 -82 65 -65L13 -76L-28 -72Z"
                    fill="#f0e2c1"
                  />
                  <path
                    d="M-66 -65Q-4 -89 62 -64L65 -55Q-1 -76 -65 -54Z"
                    fill="#d9c6a1"
                  />
                  <path
                    d="M-52 -82Q-41 -101 -20 -101"
                    fill="none"
                    stroke="#fff5dc"
                    strokeWidth="5"
                  />
                  <path
                    d="M34 -101L38 -90L50 -88L42 -80L42 -67L31 -73L20 -67L21 -79L13 -87L27 -90Z"
                    fill="#d9b264"
                    strokeWidth="2"
                  />
                </>
              )}
              {hat === "ribbon" && (
                <>
                  <path
                    d="M38 -63Q35 -87 60 -91L65 -67Q83 -92 100 -77L79 -52L71 -38L59 -59Z"
                    fill="#a08091"
                  />
                  <path d="M61 -64L60 -80M72 -63L89 -74" stroke="#d8b8b9" />
                  <ellipse cx="65" cy="-60" rx="9" ry="8" fill="#ba9a9e" />
                </>
              )}
              {hat === "leaf" && (
                <>
                  <path
                    d="M-58 -70Q-58 -121 -4 -121Q47 -121 57 -71Z"
                    fill="#9ba889"
                  />
                  <path
                    d="M-81 -66Q-77 -80 -52 -82L58 -82Q96 -68 69 -55L-65 -54Z"
                    fill="#c0c5a1"
                  />
                  <path
                    d="M0 -120Q-8 -146 12 -149Q25 -140 0 -120M1 -120Q23 -141 36 -132Q30 -116 1 -120"
                    fill="#7d9876"
                  />
                </>
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
  const props = {
    className: `layered-character ${className}`,
    "data-action": greeting ? "greet" : action,
    "data-quiet": quiet || portrait ? "true" : "false",
  };
  return interactive ? (
    <button
      {...props}
      type="button"
      aria-label="和角色打招呼"
      onClick={() => {
        setGreeting(true);
        onGreet?.();
      }}
    >
      {content}
    </button>
  ) : (
    <div {...props}>{content}</div>
  );
}
