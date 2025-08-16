import {
  PlayEvent,
  RunnerMovement,
  Base,
} from "src/interfaces/baseballField.types";

export function toRunnerMovements(play: PlayEvent): RunnerMovement[] {
  const raw = play.runnersRaw ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  if (!arr.length) return [];

  return arr.map((r): RunnerMovement => {
    const id = String(r.details.runner.id);
    const m = r.movement;
    m.start = m.start ?? "home";
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
