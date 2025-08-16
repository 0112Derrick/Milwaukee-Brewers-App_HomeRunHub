import { Base, BASEBALL_FIELD_COORDS } from "src/interfaces/baseballField.types";

export function BaseMarker({ base, label }: { base: Base; label?: string }) {
  const { x, y } = BASEBALL_FIELD_COORDS[base];

  // Adjust label position to prevent cutoff
  const labelOffset = base === "2B" ? -12 : -8;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-4}
        y={-4}
        width={8}
        height={8}
        transform="rotate(45)"
        fill="transparent"
        stroke="white"
        strokeWidth={1}
      />
      {!!label && (
        <text
          x={0}
          y={labelOffset}
          textAnchor="middle"
          fontSize={6}
          fill="#e5e7eb"
          style={{ userSelect: "none" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
