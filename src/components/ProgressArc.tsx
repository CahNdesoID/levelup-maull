import { T } from "../constants/theme";

/** Concentric half-circle gauges. `pct` is 0–100. */
export const ProgressArc = ({ pct }: { pct: number }) => {
  const rings = [
    { r: 88, sw: 14, fg: T.success, p: pct },
    { r: 70, sw: 11, fg: T.yellow, p: Math.min(pct + 14, 100) },
    { r: 54, sw: 9, fg: T.lav, p: pct * 0.62 },
  ];

  return (
    <svg viewBox="0 0 220 124" width="210" height="116" role="img" aria-label={`${pct}% complete`}>
      {rings.map(({ r, sw, fg, p }) => {
        const arc = Math.PI * r;
        const path = `M${110 - r} 108 A${r} ${r} 0 0 1 ${110 + r} 108`;
        return (
          <g key={r}>
            <path d={path} fill="none" stroke="#E6E0D4" strokeWidth={sw} strokeLinecap="round" />
            <path
              d={path}
              fill="none"
              stroke={fg}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${(p / 100) * arc} ${arc}`}
            />
          </g>
        );
      })}
      <text
        x="110"
        y="100"
        textAnchor="middle"
        style={{
          fontFamily: "'Bricolage Grotesque',sans-serif",
          fontWeight: 800,
          fontSize: 30,
          fill: T.green,
        }}
      >
        {pct}%
      </text>
    </svg>
  );
};
