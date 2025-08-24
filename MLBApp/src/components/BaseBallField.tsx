import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BaseballFieldHandle,
  BASEBALL_FIELD_COORDS,
  RunnersState,
  Base,
  PlannedRunner,
  BASE_PRIORITY,
  HOP_STAGGER_MS,
  HOP_DURATION_MS,
  BASE_DRAW_ORDER,
} from "src/interfaces/baseballField.types";
import { BaseMarker } from "./BaseMarker";
import { RunnerPin } from "./RunnerPin";
import {
  advancePath,
  consolidatePlannedPaths,
  normalizeBase,
} from "src/repository/baseballField";

// BaseballField.tsx
export const BaseballField = forwardRef<BaseballFieldHandle>((_, ref) => {
  const [outs, setOuts] = useState(0);
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [score, setScore] = useState<{ away?: number; home?: number }>({});
  const [runners, setRunners] = useState<RunnersState>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFieldDisplayed, setIsFieldDisplayed] = useState(false);
  const [runnerDelays, setRunnerDelays] = useState<Record<string, number>>({});
  const [playId, setPlayId] = useState("");
  const initialPositions: RunnersState = {};
  const START_SEED_MS = 500;

  const animTimer = useRef<number | null>(null);

  const hardReset = () => {
    if (animTimer.current) {
      window.clearTimeout(animTimer.current);
      animTimer.current = null;
    }
    setOuts(0);
    setBalls(0);
    setStrikes(0);
    setScore({});
    setRunners({});
    setRunnerDelays({});
    setIsAnimating(false);
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
      playId,
    }) => {
      if (!moves?.length) {
        setOuts(outsRecorded ?? 0);
        setBalls(balls ?? 0);
        setStrikes(strikes ?? 0);
        setScore({ away: awayScore, home: homeScore });
        return;
      }

      setPlayId(playId);
      // Build a planned path per runner
      const planned: PlannedRunner[] = moves.map((m) => {
        const start: Base = normalizeBase(m.from) ?? "home"; // if unknown, start from home (batter)
        const endRaw: Base | undefined = normalizeBase(m.to);

        const end: Base =
          m.out && normalizeBase((m as any).outBase)
            ? (m as any).outBase
            : endRaw ?? "home";

        const path = advancePath(start, end);
        const removeOnFinish = m.out === true || end === "home";
        return {
          id: m.id,
          path,
          jersey: m.player?.jerseyNumber,
          removeOnFinish,
        };
      });

      const consolidated = consolidatePlannedPaths(planned);

      setIsAnimating(true);

      // Start with runners at their *starting* bases (if they’re already on base)
      // We only render pins for runners who haven't finished. During animation, keep them visible.
      let stepIndex = 0;
      const maxSteps = Math.max(
        ...planned.map((r) => Math.max(0, r.path.length - 1)),
        0
      );

      const step = () => {
        const framePositions: RunnersState = {};
        const delays: Record<string, number> = {};
        let anyRemaining = false;
        const finishedThisStep: PlannedRunner[] = [];

        for (const r of consolidated) {
          const curIdx = Math.min(stepIndex, r.path.length - 1);
          const nextIdx = Math.min(stepIndex + 1, r.path.length - 1);
          const toBase = r.path[nextIdx];

          // Place runner at the destination for this hop.
          framePositions[r.jersey ?? r.id] = toBase;

          // Stagger by where they are leaving FROM this hop
          const fromBase = r.path[curIdx];
          delays[r.jersey ?? r.id] = BASE_PRIORITY[fromBase] * HOP_STAGGER_MS;

          if (nextIdx > curIdx) anyRemaining = true;
          if (nextIdx === r.path.length - 1) finishedThisStep.push(r);
        }

        setRunnerDelays(delays);
        setRunners(framePositions);

        if (anyRemaining && stepIndex < maxSteps) {
          const maxDelay = Math.max(0, ...Object.values(delays));
          const totalMs = maxDelay + HOP_DURATION_MS;
          animTimer.current = window.setTimeout(() => {
            stepIndex += 1;
            step();
          }, totalMs);
        } else {
          // done animating this play
          const lingerMs = 220;

          // Ensure final positions are displayed (including scorers/outs)
          setRunners(framePositions);

          animTimer.current = window.setTimeout(() => {
            setRunners((prev) => {
              const copy = { ...prev };
              for (const r of finishedThisStep) {
                if (r.removeOnFinish) delete copy[r.jersey ?? r.id];
              }
              return copy;
            });
            setOuts(outsRecorded ?? 0);
            setBalls(balls ?? 0);
            setStrikes(strikes ?? 0);
            setScore({ away: awayScore, home: homeScore });
            setIsAnimating(false);
          }, lingerMs);
        }
      };

      for (const r of planned) {
        initialPositions[r.jersey ?? r.id] = r.path[0]; // show where they start
      }
      setRunners(initialPositions);

      setRunners(initialPositions);

      // Kick the step loop *after* the seed has painted
      window.setTimeout(() => {
        stepIndex = 0;
        step();
      }, START_SEED_MS);
    },
    setIsFieldDisplayed,
    isFieldDisplayed,
  }));

  return (
    <div
      className={`relative ${
        isFieldDisplayed ? "block" : "hidden"
      } w-full bg-emerald-900/40 border sm:self-center md:max-w-md md:aspect-square lg:self-auto `}
    >
      <div className="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
          {/* diamond */}
          <polygon
            points="50,10 90,50 50,90 10,50"
            fill="none"
            stroke="white"
            strokeWidth={1}
          />

          {/* bases */}
          <BaseMarker base="home" label="Home" />
          <BaseMarker base="1B" label="1B" />
          <BaseMarker base="2B" label="2B" />
          <BaseMarker base="3B" label="3B" />

          {/* runner pins */}
          <AnimatePresence mode="popLayout">
            {Object.entries(runners)
              .sort(([, a], [, b]) => BASE_DRAW_ORDER[a] - BASE_DRAW_ORDER[b])
              .map(([runnerId, base]) => {
                const { x, y } = BASEBALL_FIELD_COORDS[base];
                return (
                  <RunnerPin
                    key={`${playId}-${runnerId}`}
                    runnerId={runnerId}
                    label={runnerId.length > 2 ? runnerId.slice(1) : runnerId}
                    delay={runnerDelays[runnerId] ?? 0}
                    x={x}
                    y={y}
                    isAnimating={isAnimating}
                    color={isAnimating ? "#f59e0b" : "#0ea5e9"}
                  />
                );
              })}
          </AnimatePresence>
        </svg>
      </div>

      {/* HUD */}
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

      {isAnimating && (
        <div className="absolute bottom-2 left-2 text-xs bg-blue-600/80 text-white px-2 py-1 rounded">
          ⚾ Play in progress...
        </div>
      )}
    </div>
  );
});
