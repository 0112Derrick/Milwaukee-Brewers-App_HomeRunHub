import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BaseballFieldHandle,
  FieldSimArgs,
  RunnerMovement,
  Base,
  PlayEvent,
} from "src/interfaces/baseballField.types";

export function toRunnerMovements(play: PlayEvent): RunnerMovement[] {
  const raw = play.runnersRaw ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  if (!arr.length) return [];

  return arr.map((r): RunnerMovement => {
    const id = String(r.details.runner.id);
    const m = r.movement;
    const from = normalizeBase(m.start ?? m.originBase);
    // If runner scored and no `end`, treat as home
    const scored = r.details?.isScoringEvent === true;
    const out = m.isOut === true;
    const to =
      normalizeBase(m.end) ??
      (out ? normalizeBase(m.outBase) : undefined) ??
      (scored ? "home" : undefined) ??
      from ??
      "home";

    return { id, from, to, out };
  });
}

export function outsRecordedOnPlay(play: PlayEvent): number {
  const raw = play.runnersRaw ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.reduce((sum, r) => sum + (r.movement?.isOut ? 1 : 0), 0);
}

export function normalizeBase(value: unknown): Base | undefined {
  if (!value) return undefined;
  // common cases you’ll see:
  if (typeof value === "string") {
    const v = value.toUpperCase();
    if (v.includes("HOME")) return "home";
    if (v.includes("1")) return "1B";
    if (v.includes("2")) return "2B";
    if (v.includes("3")) return "3B";
  }
  // some feeds use numbers 0/1/2/3 or "1B"/"2B"/"3B"
  if (typeof value === "number") {
    if (value === 0) return "home";
    if (value === 1) return "1B";
    if (value === 2) return "2B";
    if (value === 3) return "3B";
  }
  return undefined;
}

export function RunnerPin({
  x,
  y,
  label,
  color = "#0ea5e9", // cyan-500ish
}: {
  x: number;
  y: number;
  label?: string;
  color?: string;
}) {
  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={10}
        fill={color}
        stroke="white"
        strokeWidth={2}
        initial={{ scale: 0.8, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
      />
      {label ? (
        <motion.text
          x={x}
          y={y - 14}
          textAnchor="middle"
          fontSize={10}
          fill="#0f172a" // slate-900
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.text>
      ) : null}
    </g>
  );
}

export const BaseballField = forwardRef<BaseballFieldHandle>((_, ref) => {
  // internal state that drives animations (bases, outs, etc.)
  const [outs, setOuts] = useState(0);
  const [bases, setBases] = useState<{
    "1B": boolean;
    "2B": boolean;
    "3B": boolean;
  }>({ "1B": false, "2B": false, "3B": false });
  const animTimer = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    simulate: ({ runners, outsRecorded }: FieldSimArgs) => {
      if (animTimer.current) cancelAnimationFrame(animTimer.current);

      // Apply runner moves
      setBases((prev) => {
        const next = { ...prev };
        // clear 'to' bases first to prevent double-occupancy
        for (const m of runners)
          if (m.to && m.to !== "home") (next as any)[m.to] = false;
        // clear 'from' (runner leaves)
        for (const m of runners)
          if (m.from && m.from !== "home") (next as any)[m.from] = false;
        // set arrivals (ignore home)
        for (const m of runners)
          if (m.to && m.to !== "home") (next as any)[m.to] = true;
        return next;
      });

      setOuts((o) => o + (outsRecorded ?? 0));
    },
  }));

  return (
    <div className="relative w-full max-w-md aspect-square rounded-lg bg-emerald-900/40 border">
      {/* super basic diamond */}
      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" className="w-4/5">
          {/* diamond */}
          <polygon
            points="50,10 90,50 50,90 10,50"
            fill="none"
            stroke="white"
          />
          {/* bases */}
          <MoveBase x={50} y={10} active={false} label="Home" />
          <MoveBase x={90} y={50} active={bases["1B"]} label="1B" />
          <MoveBase x={50} y={90} active={bases["2B"]} label="2B" />
          <MoveBase x={10} y={50} active={bases["3B"]} label="3B" />
        </svg>
      </div>
      <div className="absolute right-2 top-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
        Outs: {outs}
      </div>
    </div>
  );
});

function MoveBase({
  x,
  y,
  active,
  label,
}: {
  x: number;
  y: number;
  active: boolean;
  label: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-4}
        y={-4}
        width={8}
        height={8}
        transform="rotate(45)"
        fill={active ? "#22c55e" : "transparent"}
        stroke="white"
      />
      <title>{label}</title>
    </g>
  );
}
