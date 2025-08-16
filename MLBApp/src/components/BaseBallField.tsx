import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BaseballFieldHandle,
  RunnerMovement,
  Base,
  PlayEvent,
  BASEBALL_FIELD_COORDS,
  RunnersState,
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

function BaseMarker({
  base,
  active,
  label,
}: {
  base: Base;
  active?: boolean;
  label?: string;
}) {
  const { x, y } = BASEBALL_FIELD_COORDS[base];
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
        strokeWidth={1}
      />
      {!!label && (
        <text
          x={0}
          y={-8}
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

export function RunnerPin({
  x,
  y,
  label,
  color = "#0ea5e9",
}: {
  x: number;
  y: number;
  label?: string;
  color?: string;
}) {
  return (
    <g>
      <motion.circle
        layout
        cx={x}
        cy={y}
        r={7}
        fill={color}
        stroke="white"
        strokeWidth={2}
        initial={{ scale: 0.8, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
      />
      {label ? (
        <motion.text
          layout
          x={x}
          y={y - 12}
          textAnchor="middle"
          fontSize={8}
          fill="#0f172a"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ userSelect: "none" }}
        >
          {label}
        </motion.text>
      ) : null}
    </g>
  );
}

// BaseballField.tsx
export const BaseballField = forwardRef<BaseballFieldHandle>((_, ref) => {
  const [outs, setOuts] = useState(0);
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [score, setScore] = useState<{ away?: number; home?: number }>({});
  const [runners, setRunners] = useState<RunnersState>({});
  const [occupied, setOccupied] = useState({
    "1B": false,
    "2B": false,
    "3B": false,
  });
  const animTimer = useRef<number | null>(null);

  const hardReset = () => {
    if (animTimer.current) cancelAnimationFrame(animTimer.current);
    setOuts(0);
    setBalls(0);
    setStrikes(0);
    setScore({});
    setRunners({});
    setOccupied({ "1B": false, "2B": false, "3B": false });
  };

  useImperativeHandle(ref, () => ({
    reset: hardReset,
    simulate: ({
      runners: moves,
      outsRecorded,
      balls,
      strikes,
      awayScore,
      homeScore,
    }) => {
      hardReset();

      const nextRunners: RunnersState = {};
      const nextOcc = { "1B": false, "2B": false, "3B": false };

      for (const m of moves) {
        if (!m.out && m.to !== "home") {
          nextRunners[m.id] = m.to as "1B" | "2B" | "3B";
          nextOcc[m.to as "1B" | "2B" | "3B"] = true;
        }
      }

      animTimer.current = requestAnimationFrame(() => {
        setRunners(nextRunners);
        setOccupied(nextOcc);
        setOuts(outsRecorded ?? 0);
        setBalls(balls ?? 0);
        setStrikes(strikes ?? 0);
        setScore({ away: awayScore, home: homeScore });
      });
    },
  }));

  return (
    <div className="relative w-full max-w-md aspect-square rounded-lg bg-emerald-900/40 border">
      {/* diamond */}
      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" className="w-4/5">
          <polygon
            points="50,10 90,50 50,90 10,50"
            fill="none"
            stroke="white"
            strokeWidth={1}
          />
          <BaseMarker base="home" label="Home" />
          <BaseMarker base="1B" active={occupied["1B"]} label="1B" />
          <BaseMarker base="2B" active={occupied["2B"]} label="2B" />
          <BaseMarker base="3B" active={occupied["3B"]} label="3B" />
          <AnimatePresence initial={false}>
            {Object.entries(runners).map(([id, base]) => {
              const { x, y } = BASEBALL_FIELD_COORDS[base];
              return <RunnerPin key={id} x={x} y={y} label={base} />;
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* HUD: outs / count / score */}
      <div className="absolute left-2 top-2 flex gap-2">
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
          Outs: {outs}
        </span>
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
          Count: B {balls ?? "-"} • S {strikes ?? "-"}
        </span>
      </div>
      <div className="absolute right-2 top-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
        Score: {score.away ?? "-"}–{score.home ?? "-"}
      </div>
    </div>
  );
});
