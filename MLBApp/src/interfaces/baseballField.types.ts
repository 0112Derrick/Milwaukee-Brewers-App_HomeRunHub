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
};

export type BaseballFieldHandle = {
  simulate: (args: FieldSimArgs) => void;
};

export type Base = "home" | "1B" | "2B" | "3B";
export type TeamSide = "home" | "away";

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

export const BASEBALL_FIELD_COORDS = {
  H: { x: 200, y: 340 },
  "1B": { x: 320, y: 220 },
  "2B": { x: 200, y: 100 },
  "3B": { x: 80, y: 220 },
  P: { x: 200, y: 210 },
  // some simple OF spots
  LF: { x: 70, y: 40 },
  CF: { x: 200, y: 20 },
  RF: { x: 330, y: 40 },
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
