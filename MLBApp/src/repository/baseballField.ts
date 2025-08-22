import {
  PlayEvent,
  RunnerMovement,
  Base,
  BASES,
} from "src/interfaces/baseballField.types";
import { BoxscoreTeam, PlayerIdKey } from "src/interfaces/interfaces";

export function toRunnerMovements(
  play: PlayEvent,
  lineups: { home: BoxscoreTeam | undefined; away: BoxscoreTeam | undefined }
): RunnerMovement[] {
  const raw = play.runnersRaw ?? [];

  const arr = Array.isArray(raw) ? raw : [raw];
  if (!arr.length) return [];

  return arr.map((r): RunnerMovement => {
    const id = String(r.details.runner.id);
    const player = lineups[play.team]?.players[`ID${id}` as PlayerIdKey];
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

    return { id, from, to, out, player };
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

export function advancePath(fromBase: Base, toBase: Base): Base[] {
  // Walk forward around the diamond until we include 'toBase'
  const path: Base[] = [];
  let i = BASES.indexOf(fromBase);
  if (i < 0) i = 0; // default to home
  if (fromBase) {
    path.push(fromBase);
  }
  // Always move at least one hop (so home->1B animates)
  do {
    i = (i + 1) % BASES.length;
    path.push(BASES[i]);
  } while (path[path.length - 1] !== toBase);
  return path;
}
