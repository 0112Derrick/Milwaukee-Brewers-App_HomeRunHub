import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BaseballFieldHandle,
  RunnerMovement,
  BASEBALL_FIELD_COORDS,
  RunnersState,
} from "src/interfaces/baseballField.types";
import { BaseMarker } from "./BaseMarker";
import { RunnerPin } from "./RunnerPin";

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
