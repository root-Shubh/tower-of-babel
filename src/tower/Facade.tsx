import type { Floor } from "../content/schema";

type Architecture = Floor["architecture"];

/**
 * One storey of the Tower, drawn as SVG. The building material and detailing change with
 * the floor's architecture so the climb shows knowledge growing more complex: rough stone
 * at the base, then timber and clay, brick and bronze, classical columns, medieval arches,
 * iron girders, glass curtain walls and, at the top, sleek research panels.
 *
 * All drawing is local and resolution-independent; nothing is loaded from outside.
 */
export function Facade({ architecture }: { architecture: Architecture }) {
  return (
    <svg
      className={`facade facade--${architecture}`}
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {DRAWINGS[architecture]}
    </svg>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const DRAWINGS: Record<Architecture, React.ReactElement> = {
  stone: (
    <g>
      <rect width="400" height="120" fill="#8a7f6f" />
      {range(4).map((row) =>
        range(7).map((col) => {
          const offset = row % 2 ? 28 : 0;
          const w = 50 + ((row * 7 + col * 13) % 22);
          return (
            <rect
              key={`${row}-${col}`}
              x={col * 60 - offset}
              y={row * 30 + 2}
              width={w}
              height="26"
              rx="6"
              fill={(row + col) % 3 ? "#9a8f7d" : "#7d7262"}
              stroke="#5f564a"
              strokeWidth="2"
            />
          );
        }),
      )}
      <path d="M170 120 V70 Q200 40 230 70 V120 Z" fill="#2d2620" />
      <rect x="190" y="88" width="20" height="10" fill="#e2943f" opacity="0.85" />
    </g>
  ),
  "wood-and-clay": (
    <g>
      <rect width="400" height="120" fill="#b98a5e" />
      <rect width="400" height="16" fill="#8b6a3b" />
      {range(9).map((i) => (
        <rect key={i} x={i * 50 - 4} y="16" width="10" height="104" fill="#6b4a2b" />
      ))}
      <rect y="62" width="400" height="8" fill="#6b4a2b" />
      {[80, 280].map((x) => (
        <rect key={x} x={x} y="32" width="34" height="22" fill="#3a2a1a" />
      ))}
      <rect x="180" y="76" width="40" height="44" fill="#3a2a1a" />
    </g>
  ),
  "brick-and-bronze": (
    <g>
      <rect width="400" height="120" fill="#a4573b" />
      {range(10).map((row) =>
        range(11).map((col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 40 - (row % 2 ? 20 : 0)}
            y={row * 12}
            width="38"
            height="10"
            fill={(row * 3 + col) % 4 ? "#ad6043" : "#94503a"}
          />
        )),
      )}
      <rect width="400" height="10" fill="#b08d57" />
      <rect y="110" width="400" height="10" fill="#b08d57" />
      <path d="M176 120 V66 H224 V120 Z" fill="#2f2219" />
      <rect x="176" y="60" width="48" height="6" fill="#c9a56b" />
    </g>
  ),
  classical: (
    <g>
      <rect width="400" height="120" fill="#e5dece" />
      <rect width="400" height="18" fill="#cfc6b2" />
      <rect y="16" width="400" height="4" fill="#b8ae98" />
      {range(9).map((i) => (
        <g key={i}>
          <rect x={18 + i * 44} y="24" width="22" height="88" fill="#f2ede1" />
          {range(3).map((f) => (
            <rect key={f} x={22 + i * 44 + f * 6} y="28" width="2" height="80" fill="#d6cdb8" />
          ))}
          <rect x={14 + i * 44} y="20" width="30" height="6" fill="#d9d0bb" />
          <rect x={14 + i * 44} y="110" width="30" height="6" fill="#d9d0bb" />
        </g>
      ))}
      <rect y="116" width="400" height="4" fill="#b8ae98" />
    </g>
  ),
  medieval: (
    <g>
      <rect width="400" height="120" fill="#968f80" />
      {range(5).map((row) => (
        <rect key={row} y={row * 24 + 22} width="400" height="1.5" fill="#7c7567" />
      ))}
      {range(5).map((i) => (
        <path
          key={i}
          d={`M${30 + i * 80} 104 V56 Q${50 + i * 80} 22 ${70 + i * 80} 56 V104 Z`}
          fill="#2b2b33"
          stroke="#6e6759"
          strokeWidth="4"
        />
      ))}
      {range(5).map((i) => (
        <rect key={i} x={48 + i * 80} y="58" width="4" height="46" fill="#6e6759" />
      ))}
      {range(20).map((i) => (
        <rect key={i} x={i * 20} y="0" width="12" height="10" fill="#857e70" />
      ))}
    </g>
  ),
  industrial: (
    <g>
      <rect width="400" height="120" fill="#4b4f55" />
      {range(8).map((i) => (
        <g key={i} stroke="#6b7078" strokeWidth="4">
          <line x1={i * 50} y1="8" x2={i * 50 + 50} y2="112" />
          <line x1={i * 50 + 50} y1="8" x2={i * 50} y2="112" />
        </g>
      ))}
      <rect width="400" height="8" fill="#363a3f" />
      <rect y="112" width="400" height="8" fill="#363a3f" />
      {range(9).map((i) => (
        <rect key={i} x={i * 50 - 4} y="0" width="8" height="120" fill="#2c2f33" />
      ))}
      {range(9).map((i) =>
        [14, 106].map((y) => (
          <circle key={`${i}-${y}`} cx={i * 50} cy={y} r="2.5" fill="#9aa0a8" />
        )),
      )}
      {[120, 270].map((x) => (
        <rect key={x} x={x} y="40" width="40" height="40" fill="#e0a64b" opacity="0.7" />
      ))}
    </g>
  ),
  modern: (
    <g>
      <rect width="400" height="120" fill="#7ea4b5" />
      {range(10).map((i) => (
        <rect key={i} x={i * 40} y="0" width="3" height="120" fill="#d7e3e8" />
      ))}
      {range(4).map((i) => (
        <rect key={i} x="0" y={i * 30} width="400" height="3" fill="#d7e3e8" />
      ))}
      <path d="M0 0 L140 0 L60 120 L0 120 Z" fill="#ffffff" opacity="0.12" />
      <path d="M220 0 L260 0 L180 120 L140 120 Z" fill="#ffffff" opacity="0.1" />
    </g>
  ),
  advanced: (
    <g>
      <rect width="400" height="120" fill="#22303d" />
      {range(6).map((i) => (
        <rect
          key={i}
          x={i * 68 + 6}
          y="10"
          width="60"
          height="100"
          rx="8"
          fill="#2c3e50"
          stroke="#3e5468"
        />
      ))}
      <rect y="58" width="400" height="2" fill="#8fd3ff" opacity="0.8" />
      {range(6).map((i) => (
        <circle key={i} cx={i * 68 + 36} cy="34" r="5" fill="#8fd3ff" opacity="0.6" />
      ))}
    </g>
  ),
};
