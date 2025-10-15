import { useEffect, useRef } from "react";

export default function MovingAnimation() {
  const motionRef = useRef<SVGAnimateMotionElement | null>(null);

  useEffect(() => {
    motionRef.current?.beginElement(); // nastartuje animaci okamžitě
  }, []);

  return (
    <svg
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="roadPath" d="M 500,150 A 350,350 0 1,1 499,150" fill="none" />
      </defs>

      {/* silnice: r=350, stroke=60 => vnější hrana na r=380 */}
      <circle cx="500" cy="500" r="350" fill="none" stroke="#56A4A0" strokeWidth="60" opacity="0.1" />

      {/* Každý domek posunut na r = 380 + výška_domečku (aby základna ležela na vnější hraně) */}
      <g transform="translate(500, 500) rotate(-90)">
        <g transform="translate(0, -450) translate(-30, 0)">{/* 350 + 30 + 70 */}
          <rect x="0" y="0" width="60" height="70" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 30,-20 60,0" fill="#56A4A0" opacity="0.5" />
          <rect x="10" y="12" width="12" height="14" fill="#fff" opacity="0.4" />
          <rect x="35" y="12" width="12" height="14" fill="#fff" opacity="0.4" />
          <rect x="10" y="32" width="12" height="14" fill="#fff" opacity="0.4" />
          <rect x="35" y="32" width="12" height="14" fill="#fff" opacity="0.4" />
          <rect x="23" y="52" width="14" height="18" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(-60)">
        <g transform="translate(0, -440) translate(-28, 0)">{/* 350 + 30 + 60 */}
          <rect x="0" y="0" width="56" height="60" fill="#56A4A0" opacity="0.3" />
          <rect x="0" y="0" width="56" height="4" fill="#56A4A0" opacity="0.5" />
          <rect x="8" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="22" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="36" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="8" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="22" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="36" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="21" y="44" width="14" height="16" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(-30)">
        <g transform="translate(0, -430) translate(-25, 0)">{/* 350 + 30 + 50 */}
          <rect x="0" y="0" width="50" height="50" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 25,-15 50,0" fill="#56A4A0" opacity="0.5" />
          <rect x="8" y="10" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="29" y="10" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="8" y="27" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="29" y="27" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="18" y="36" width="14" height="14" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(0)">
        <g transform="translate(0, -445) translate(-32, 0)">{/* 350 + 30 + 65 */}
          <rect x="0" y="0" width="64" height="65" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 32,-18 64,0" fill="#56A4A0" opacity="0.5" />
          <rect x="10" y="14" width="12" height="13" fill="#fff" opacity="0.4" />
          <rect x="26" y="14" width="12" height="13" fill="#fff" opacity="0.4" />
          <rect x="42" y="14" width="12" height="13" fill="#fff" opacity="0.4" />
          <rect x="10" y="31" width="12" height="13" fill="#fff" opacity="0.4" />
          <rect x="42" y="31" width="12" height="13" fill="#fff" opacity="0.4" />
          <rect x="24" y="47" width="16" height="18" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(30)">
        <g transform="translate(0, -435) translate(-26, 0)">{/* 350 + 30 + 55 */}
          <rect x="0" y="0" width="52" height="55" fill="#56A4A0" opacity="0.3" />
          <rect x="0" y="0" width="52" height="4" fill="#56A4A0" opacity="0.5" />
          <rect x="7" y="9" width="11" height="12" fill="#fff" opacity="0.4" />
          <rect x="21" y="9" width="11" height="12" fill="#fff" opacity="0.4" />
          <rect x="35" y="9" width="11" height="12" fill="#fff" opacity="0.4" />
          <rect x="7" y="24" width="11" height="12" fill="#fff" opacity="0.4" />
          <rect x="35" y="24" width="11" height="12" fill="#fff" opacity="0.4" />
          <rect x="19" y="39" width="14" height="16" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(60)">
        <g transform="translate(0, -448) translate(-30, 0)">{/* 350 + 30 + 68 */}
          <rect x="0" y="0" width="60" height="68" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 30,-22 60,0" fill="#56A4A0" opacity="0.5" />
          <rect x="9" y="16" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="37" y="16" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="9" y="35" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="37" y="35" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="23" y="53" width="14" height="15" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(90)">
        <g transform="translate(0, -438) translate(-28, 0)">{/* 350 + 30 + 58 */}
          <rect x="0" y="0" width="56" height="58" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 28,-16 56,0" fill="#56A4A0" opacity="0.5" />
          <rect x="8" y="12" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="28" y="12" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="8" y="29" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="28" y="29" width="13" height="13" fill="#fff" opacity="0.4" />
          <rect x="20" y="44" width="16" height="14" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(120)">
        <g transform="translate(0, -452) translate(-24, 0)">{/* 350 + 30 + 72 */}
          <rect x="0" y="0" width="48" height="72" fill="#56A4A0" opacity="0.3" />
          <rect x="0" y="0" width="48" height="4" fill="#56A4A0" opacity="0.5" />
          <rect x="6" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="19" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="32" y="10" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="6" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="19" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="32" y="26" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="6" y="42" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="32" y="42" width="10" height="12" fill="#fff" opacity="0.4" />
          <rect x="17" y="58" width="14" height="14" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(150)">
        <g transform="translate(0, -442) translate(-30, 0)">{/* 350 + 30 + 62 */}
          <rect x="0" y="0" width="60" height="62" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 30,-19 60,0" fill="#56A4A0" opacity="0.5" />
          <rect x="10" y="14" width="14" height="14" fill="#fff" opacity="0.4" />
          <rect x="36" y="14" width="14" height="14" fill="#fff" opacity="0.4" />
          <rect x="10" y="32" width="14" height="14" fill="#fff" opacity="0.4" />
          <rect x="36" y="32" width="14" height="14" fill="#fff" opacity="0.4" />
          <rect x="23" y="48" width="14" height="14" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(180)">
        <g transform="translate(0, -436) translate(-27, 0)">{/* 350 + 30 + 56 */}
          <rect x="0" y="0" width="54" height="56" fill="#56A4A0" opacity="0.3" />
          <rect x="0" y="0" width="54" height="4" fill="#56A4A0" opacity="0.5" />
          <rect x="7" y="10" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="21" y="10" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="35" y="10" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="7" y="24" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="21" y="24" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="35" y="24" width="11" height="11" fill="#fff" opacity="0.4" />
          <rect x="20" y="39" width="14" height="17" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(210)">
        <g transform="translate(0, -430) translate(-26, 0)">{/* 350 + 30 + 50 */}
          <rect x="0" y="0" width="52" height="50" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 26,-17 52,0" fill="#56A4A0" opacity="0.5" />
          <rect x="8" y="11" width="13" height="12" fill="#fff" opacity="0.4" />
          <rect x="31" y="11" width="13" height="12" fill="#fff" opacity="0.4" />
          <rect x="8" y="27" width="13" height="12" fill="#fff" opacity="0.4" />
          <rect x="31" y="27" width="13" height="12" fill="#fff" opacity="0.4" />
          <rect x="19" y="35" width="14" height="15" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      <g transform="translate(500, 500) rotate(240)">
        <g transform="translate(0, -444) translate(-29, 0)">{/* 350 + 30 + 64 */}
          <rect x="0" y="0" width="58" height="64" fill="#56A4A0" opacity="0.3" />
          <polygon points="0,0 29,-21 58,0" fill="#56A4A0" opacity="0.5" />
          <rect x="9" y="15" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="35" y="15" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="9" y="34" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="35" y="34" width="14" height="15" fill="#fff" opacity="0.4" />
          <rect x="22" y="50" width="14" height="14" fill="#56A4A0" opacity="0.6" />
        </g>
      </g>

      {/* Dodávka */}
      <g id="van">
        <rect x="-15" y="-8" width="30" height="16" fill="#56A4A0" rx="2" />
        <rect x="-10" y="-8" width="8" height="12" fill="#56A4A0" opacity="0.8" />
        <circle cx="-8" cy="8" r="3" fill="#333" />
        <circle cx="8" cy="8" r="3" fill="#333" />
        <animateMotion
          ref={motionRef}
          dur="12s"
          begin="indefinite"
          repeatCount="indefinite"
          rotate="auto"
          path="M500,150 A350,350 0 1,1 499,150"
        />
      </g>
    </svg>
  );
}
