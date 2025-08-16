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

function BaseMarker({ base, label }: { base: Base; label?: string }) {
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

export function RunnerPin({
  x,
  y,
  fromX,
  fromY,
  runnerId,
  color = "#0ea5e9",
  isAnimating = false,
}: {
  x: number;
  y: number;
  fromX?: number;
  fromY?: number;
  runnerId: string;
  color?: string;
  isAnimating?: boolean;
}) {
  return (
    <motion.g
      key={runnerId}
      initial={
        fromX !== undefined && fromY !== undefined
          ? { x: fromX, y: fromY, scale: 0.8, opacity: 0.9 }
          : { x, y, scale: 0.8, opacity: 0.9 }
      }
      animate={{
        x,
        y,
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0.6,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: isAnimating ? 1.2 : 0.5,
      }}
    >
      <motion.circle
        cx={0}
        cy={0}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      {/* Runner number inside the pin */}
      <motion.text
        x={0}
        y={2}
        textAnchor="middle"
        fontSize={7}
        fill="white"
        fontWeight="bold"
        style={{ userSelect: "none" }}
      >
        {runnerId.slice(-1)} {/* Show last character of runner ID */}
      </motion.text>
    </motion.g>
  );
}

// BaseballField.tsx
export const BaseballField = forwardRef<BaseballFieldHandle>((_, ref) => {
  const [outs, setOuts] = useState(0);
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [score, setScore] = useState<{ away?: number; home?: number }>({});
  const [runners, setRunners] = useState<RunnersState>({});
  const [previousRunners, setPreviousRunners] = useState<RunnersState>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimer = useRef<NodeJS.Timeout | null>(null);

  const hardReset = () => {
    if (animTimer.current) {
      clearTimeout(animTimer.current);
      animTimer.current = null;
    }
    setOuts(0);
    setBalls(0);
    setStrikes(0);
    setScore({});
    setRunners({});
    setPreviousRunners({});
    setIsAnimating(false);
  };

  const animateRunnerMovements = (
    moves: RunnerMovement[],
    nextRunners: RunnersState,
    gameState: any
  ) => {
    setIsAnimating(true);
    setPreviousRunners({ ...runners });

    // Start the animation
    setRunners(nextRunners);

    // Update game state after animation starts
    animTimer.current = setTimeout(() => {
      setOuts(gameState.outsRecorded ?? 0);
      setBalls(gameState.balls ?? 0);
      setStrikes(gameState.strikes ?? 0);
      setScore({ away: gameState.awayScore, home: gameState.homeScore });
      setIsAnimating(false);
      setPreviousRunners({});
    }, 1300); // Slightly longer than animation duration
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
      const nextRunners: RunnersState = {};

      // Only add runners who end up on base (not out, not scored)
      for (const m of moves) {
        if (!m.out && m.to !== "home") {
          nextRunners[m.id] = m.to as "1B" | "2B" | "3B";
        }
      }

      // Animate the movements
      animateRunnerMovements(moves, nextRunners, {
        outsRecorded,
        balls,
        strikes,
        awayScore,
        homeScore,
      });
    },
  }));

  // Get current and previous positions for animation
  const getRunnerPositions = () => {
    const positions: Array<{
      runnerId: string;
      x: number;
      y: number;
      fromX?: number;
      fromY?: number;
    }> = [];

    // Add current runners
    Object.entries(runners).forEach(([runnerId, base]) => {
      const { x, y } = BASEBALL_FIELD_COORDS[base];
      const previousBase = previousRunners[runnerId];
      let fromX, fromY;

      if (previousBase && previousBase !== base) {
        const prevCoords = BASEBALL_FIELD_COORDS[previousBase];
        fromX = prevCoords.x;
        fromY = prevCoords.y;
      }

      positions.push({ runnerId, x, y, fromX, fromY });
    });

    return positions;
  };

  const runnerPositions = getRunnerPositions();

  return (
    <div className="relative w-full max-w-md aspect-square rounded-lg bg-emerald-900/40 border">
      {/* Diamond */}
      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
          {/* Field outline */}
          <polygon
            points="50,10 90,50 50,90 10,50"
            fill="none"
            stroke="white"
            strokeWidth={1}
          />

          {/* Base markers - no longer highlight when occupied */}
          <BaseMarker base="home" label="Home" />
          <BaseMarker base="1B" label="1B" />
          <BaseMarker base="2B" label="2B" />
          <BaseMarker base="3B" label="3B" />

          {/* Runner pins with animation */}
          <AnimatePresence mode="popLayout">
            {runnerPositions.map(({ runnerId, x, y, fromX, fromY }) => (
              <RunnerPin
                key={runnerId}
                x={x}
                y={y}
                fromX={fromX}
                fromY={fromY}
                runnerId={runnerId}
                isAnimating={isAnimating}
              />
            ))}
          </AnimatePresence>
        </svg>
      </div>

      {/* HUD: outs / count / score */}
      <div className="absolute left-2 top-2 flex gap-2">
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
          Outs: {outs}
        </span>
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
          Count: {balls ?? "-"}-{strikes ?? "-"}
        </span>
      </div>
      <div className="absolute right-2 top-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
        Score: {score.away ?? "-"} - {score.home ?? "-"}
      </div>

      {/* Animation indicator */}
      {isAnimating && (
        <div className="absolute bottom-2 left-2 text-xs bg-blue-600/80 text-white px-2 py-1 rounded">
          ⚾ Play in progress...
        </div>
      )}
    </div>
  );
});
