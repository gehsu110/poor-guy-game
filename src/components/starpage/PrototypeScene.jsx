import { useId } from "react";
export function GardenObject({ kind }) {
  return (
    <svg
      viewBox="0 0 110 150"
      role="img"
      aria-label={kind === "lantern" ? "晚安星燈" : "書窗蕨葉"}
    >
      <ellipse cx="55" cy="136" rx="36" ry="6" fill="#716348" opacity=".17" />
      {kind === "lantern" ? (
        <g stroke="#7b684d" strokeWidth="3" strokeLinejoin="round">
          <path d="M27 61L80 61L73 123L34 123Z" fill="#f0d48d" />
          <path
            d="M55 72L60 84L73 86L62 96L64 109L53 102L42 109L44 96L35 87L48 84Z"
            fill="#fff0b3"
            stroke="none"
          />
          <path
            d="M24 61L43 43L66 43L84 61ZM33 123L75 123L79 132L28 132Z"
            fill="#a3a184"
          />
          <path
            d="M43 44Q38 21 54 22Q72 23 65 44M37 65L42 120M72 65L68 120"
            fill="none"
          />
        </g>
      ) : (
        <g stroke="#7a7255" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M31 103L80 103L74 131Q55 142 38 131Z" fill="#bf9975" />
          <path d="M27 98L84 98L81 110L29 110Z" fill="#d3b28a" />
          <g fill="#90a17e">
            <path d="M54 98Q14 79 21 46Q58 52 54 98M55 96Q84 82 88 46Q61 53 55 96M55 92Q36 42 61 15Q79 58 55 92M51 101Q8 107 11 81Q40 76 51 101M58 102Q93 105 99 79Q73 71 58 102" />
          </g>
          <path
            d="M55 100L61 29M51 99L28 61M59 99L83 59"
            fill="none"
            stroke="#6c856a"
          />
        </g>
      )}
    </svg>
  );
}
export default function IllustratedScene({
  theme = "courtyard",
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const forest = theme === "forest";
  return (
    <svg
      className={`illustrated-scene ${className}`}
      viewBox="0 0 440 640"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x2="0" y2="1">
          <stop stopColor={forest ? "#c4d3c0" : "#ece3c5"} />
          <stop offset="1" stopColor="#fbefcb" />
        </linearGradient>
        <linearGradient id={`${uid}-ground`} x2="0" y2="1">
          <stop stopColor="#d0c7a0" />
          <stop offset="1" stopColor="#ece0be" />
        </linearGradient>
        <radialGradient id={`${uid}-light`}>
          <stop stopColor="#fff5d6" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff5d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path fill={`url(#${uid}-sky)`} d="M0 0H440V640H0Z" />
      <circle cx="279" cy="80" r="48" fill="#fff5d3" opacity=".78" />
      <g fill="#b0bea0" opacity=".5">
        <path d="M0 234Q60 135 118 246Q190 120 245 234Q357 119 440 230V450H0Z" />
        <path d="M0 171Q13 66 51 77Q94 93 90 227M368 251Q348 99 406 67Q448 72 455 184" />
      </g>
      {!forest && (
        <g stroke="#a7956f" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M38 263L220 97L405 263L384 294L57 294Z" fill="#929682" />
          <path
            d="M59 269L220 124L385 269"
            fill="none"
            stroke="#bdbea1"
            strokeWidth="6"
          />
          <path d="M79 276H362V506H79Z" fill="#ddcdab" />
          <path d="M87 277H350V296H87Z" fill="#c4b593" stroke="none" />
          <path
            d="M168 507V340Q168 278 220 276Q274 278 274 340V507Z"
            fill="#bba989"
          />
          <path
            d="M181 508V346Q181 295 220 292Q262 295 262 346V507Z"
            fill="#797e70"
          />
          <path
            d="M190 347V505H252V347Q250 310 220 307Q192 307 190 347"
            fill="#949783"
          />
          <path d="M208 319V502M233 318V502" fill="none" stroke="#788372" />
          <path d="M186 353H258" stroke="#b7b08d" strokeWidth="5" />
          <circle cx="240" cy="420" r="5" fill="#dbbc72" />
          <path d="M94 329H143V395H94ZM298 329H347V395H298Z" fill="#879991" />
          <path
            d="M118 329V395M94 360H143M322 329V395M298 360H347"
            fill="none"
            stroke="#d1ba8b"
            strokeWidth="5"
          />
          <path d="M90 395H148V405H90ZM294 395H351V405H294Z" fill="#b3a480" />
          <g fill="none" stroke="#c3b693" opacity=".7">
            <path d="M78 311H156M283 311H362M79 439H160M282 439H362M103 311V329M331 311V329M114 416V439M320 416V439M81 460H160M283 460H362M111 461V485M332 461V485M168 335L183 340M174 309L191 320M193 286L199 303M235 281L231 299M260 294L249 311" />
          </g>
          <path d="M151 499H286L302 514H138Z" fill="#beb393" />
          <path d="M133 514H307L325 530H116Z" fill="#d8cbab" />
          <path d="M207 197L220 174L234 197L222 220Z" fill="#e2c17c" />
          <circle cx="220" cy="197" r="4" fill="#fff1c9" stroke="none" />
          <path
            d="M126 293Q136 307 137 319M304 293Q293 306 295 319"
            fill="none"
            stroke="#7a8370"
          />
          <path
            d="M131 310L146 309L148 329L133 330ZM287 309L303 310L301 329L286 329Z"
            fill="#eacf8c"
          />
        </g>
      )}
      {forest && (
        <g stroke="#7b8267" strokeWidth="3">
          <path
            d="M34 535Q107 296 93 90L55 68Q81 254 -13 398Z"
            fill="#a4a080"
          />
          <path
            d="M347 513Q346 232 389 48L419 59Q388 252 458 492Z"
            fill="#a4a080"
          />
          <path d="M112 457Q113 327 226 325Q327 328 327 457Z" fill="#a2b092" />
          <path d="M185 457V399Q221 355 251 399V457Z" fill="#748a77" />
          <g fill="#bec5a0" stroke="none">
            <ellipse cx="110" cy="252" rx="63" ry="35" />
            <ellipse cx="360" cy="231" rx="57" ry="40" />
            <ellipse cx="334" cy="339" rx="44" ry="29" />
          </g>
        </g>
      )}
      <path
        d="M0 511Q116 483 210 525Q354 491 440 515V640H0Z"
        fill={`url(#${uid}-ground)`}
      />
      <path
        d="M167 515Q104 552 100 640H356Q294 563 273 515Z"
        fill="#e4d9b7"
        opacity=".9"
      />
      <g fill="none" stroke="#b6ae8d" strokeWidth="1.8" opacity=".5">
        <path d="M129 554Q220 567 309 553M115 592Q228 605 339 594M99 628Q222 642 355 628M182 554L176 594M261 562L275 600M217 604L216 635M200 525L201 555" />
      </g>
      <g fill="#98aa83">
        <path d="M0 530Q24 473 82 520Q96 449 126 492Q142 535 100 548L0 560ZM326 540Q332 491 361 502Q384 463 419 488L449 530V571Z" />
        <path d="M0 180Q-9 110 22 82Q-3 24 51 9Q95 -40 120 24Q149 50 115 86Q125 119 71 133Q51 183 0 180" />
        <path d="M335 2Q345 -32 387 -7Q435 -8 464 38L459 126Q413 146 401 106Q358 107 358 69Q320 55 335 2" />
      </g>
      <g fill="#b7c394">
        <ellipse cx="41" cy="37" rx="40" ry="26" />
        <ellipse cx="83" cy="72" rx="28" ry="22" />
        <ellipse cx="406" cy="40" rx="50" ry="28" />
        <ellipse cx="368" cy="16" rx="32" ry="25" />
      </g>
      <g fill="#f6ecc9">
        <circle cx="42" cy="527" r="4" />
        <circle cx="49" cy="520" r="4" />
        <circle cx="55" cy="528" r="4" />
        <circle cx="355" cy="528" r="4" />
        <circle cx="361" cy="520" r="4" />
        <circle cx="368" cy="527" r="4" />
      </g>
      <g stroke="#879373" strokeWidth="2" fill="none">
        <path d="M24 571L26 550M22 557L13 551M27 558L35 549M405 583L401 558M401 570L410 560M402 575L394 568" />
      </g>
      <ellipse
        cx="247"
        cy="290"
        rx="201"
        ry="270"
        fill={`url(#${uid}-light)`}
      />
      <g className="scene-dust" fill="#fff5d2" opacity=".7">
        <circle cx="56" cy="243" r="2" />
        <circle cx="341" cy="303" r="2" />
        <circle cx="309" cy="178" r="2.5" />
        <circle cx="82" cy="408" r="2" />
      </g>
    </svg>
  );
}
export function ForestSpirit({ hit = false, defeated = false }) {
  return (
    <svg
      className={`forest-spirit ${hit ? "is-hit" : ""} ${defeated ? "is-friend" : ""}`}
      viewBox="0 0 220 220"
      role="img"
      aria-label={defeated ? "重新找回笑容的書頁精靈" : "被迷霧困住的書頁精靈"}
    >
      <ellipse cx="110" cy="194" rx="60" ry="9" fill="#657252" opacity=".15" />
      <g
        className="spirit-body"
        stroke="#778169"
        strokeWidth="3"
        strokeLinejoin="round"
      >
        <path
          d="M51 113Q40 72 80 60Q81 29 109 37Q135 19 141 59Q184 65 179 116Q208 145 171 174Q120 202 65 182Q21 164 51 113"
          fill="#b7c6a0"
        />
        <path
          d="M67 154Q106 129 156 155Q156 181 111 184Q70 180 67 154"
          fill="#dce0b9"
          stroke="none"
        />
        <path d="M102 59Q94 19 123 15Q142 30 102 59" fill="#91a989" />
        <path
          d="M76 64Q104 55 135 64"
          fill="none"
          stroke="#dce4bb"
          strokeWidth="5"
        />
        <path
          d="M50 137Q28 130 30 142Q31 152 50 151M174 138Q195 128 196 143Q193 154 177 154"
          fill="#b7c6a0"
        />
        {defeated ? (
          <path
            d="M72 111Q81 98 91 111M129 111Q140 98 150 111"
            fill="none"
            stroke="#565d52"
            strokeWidth="4"
          />
        ) : (
          <g fill="#565d52" stroke="none">
            <ellipse cx="82" cy="111" rx="6" ry="9" />
            <ellipse cx="140" cy="111" rx="6" ry="9" />
            <circle cx="84" cy="108" r="2" fill="#fff6d8" />
            <circle cx="142" cy="108" r="2" fill="#fff6d8" />
          </g>
        )}
        <path
          d={defeated ? "M100 134Q112 150 123 133" : "M104 137Q112 130 120 137"}
          fill="none"
          stroke="#8e8368"
        />
        <ellipse cx="67" cy="129" rx="10" ry="5" fill="#d0a88d" stroke="none" />
        <ellipse
          cx="154"
          cy="129"
          rx="10"
          ry="5"
          fill="#d0a88d"
          stroke="none"
        />
      </g>
    </svg>
  );
}
