import {
  PlayByPlayMatchup,
  PlayByPlayResult,
  PlayByPlayRunners,
} from "./interfaces";

export type FieldSimArgs = {
  team: "home" | "away";
  description: string;
  runners: RunnerMovement[];
  outsRecorded: number;
  rbi?: number;

  balls?: number; // 0–3
  strikes?: number; // 0–2
  awayScore?: number; // snapshot at time of play
  homeScore?: number; // snapshot at time of play
};

export type BaseballFieldHandle = {
  simulate: (args: FieldSimArgs) => void;
};

export type Base = "home" | "1B" | "2B" | "3B";
export type TeamSide = "home" | "away";
export type RunnersState = Record<string, Base>;

export type PlayEvent = {
  id: string;
  inning: number;
  half: "top" | "bottom";
  team: "home" | "away";
  result: string; // e.g. "single", "strikeout"
  description: string;
  count?: string; // like "3-2"
  outsAfter?: number;
  awayScore?: number;
  homeScore?: number;
  isScoringPlay: boolean;

  // carry raw objects so the row can read what it needs:
  resultObj?: PlayByPlayResult;
  matchup?: Pick<PlayByPlayMatchup, "batter">;

  runnersRaw?: PlayByPlayRunners[];
};

export const BASEBALL_FIELD_COORDS: Record<Base, { x: number; y: number }> = {
  home: { x: 50, y: 90 },
  "1B": { x: 90, y: 50 },
  "2B": { x: 50, y: 10 },
  "3B": { x: 10, y: 50 },
};

export type RunnerMovement = {
  id: string;
  from?: Base | null;
  to: Base | "home";
  out?: boolean;
};

export type PitchEvent =
  | "ball"
  | "called_strike"
  | "swinging_strike"
  | "foul"
  | "in_play_out"
  | "in_play_hit"
  | "pickoff"
  | "none";

export type PlayAction = {
  team: TeamSide;
  description?: string;
  pitch?: PitchEvent;
  runners?: RunnerMovement[];
  outsRecorded?: number;
  rbi?: number;
};

export type FieldState = {
  // base occupancy: map base -> runnerId
  bases: Partial<Record<Base, string>>;
  // batter and pitcher ids (optional, mostly for labels)
  batterId?: string;
  pitcherId?: string;

  balls?: number;
  strikes?: number;
  outs?: number;
};

export type BaseballFieldProps = {
  className?: string;
  /**
   * Controlled-ish current field state. You can keep this in parent or let this component mutate local state.
   */
  initialState?: FieldState;
  /**
   * Animate a single play. You can call this from parent via ref, or pass the play via props and change key.
   */
  onAfterAnimate?: (next: FieldState) => void;
};
