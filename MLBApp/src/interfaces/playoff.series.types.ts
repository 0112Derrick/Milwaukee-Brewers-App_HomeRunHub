import { League } from "./interfaces";

export interface PlayoffSeries {
  id: string;
  round: Round;
  bestOf: number;
  status: Status;
  startDate: string; //ISO date string
  winsHome: number;
  winsAway: number;
  home: {
    id: number;
    name: string;
    abbreviation: string;
    leagueId: League;
  };
  away: {
    id: number;
    name: string;
    abbreviation: string;
    leagueId: League;
  };
  games: PlayoffGame[];
}

export type PlayoffGameStatus = "scheduled" | "in_progress" | "final";

export type PlayoffGame = {
  gamePk: number;
  date: string; // ISO, e.g. "2025-10-12"
  state: PlayoffGameStatus; // mapped from detailedState
  seriesGameNumber?: number; // e.g. 1..7
  gameNumber?: number; // schedule’s gameNumber (not always present)
  venue?: string;

  // Teams & score at game time
  homeId: number | undefined;
  awayId: number | undefined;
  homeScore: number | null; // null for not-started
  awayScore: number | null; // null for not-started
};

type Status = "final" | "in_progress" | "scheduled";
type Round = "WC" | "LDS" | "LCS" | "WS";
export type BracketPayload = {
  season: number;
  series: PlayoffSeries[];
};

export type BracketTeam = {
  id: number;
  name: string;
  seed?: number;
  logoUrl?: string;
  record?: string;
  eliminated?: boolean;
};

export type PlayoffBracketProps = {
  bracket: {
    season: number;
    series: PlayoffSeries[];
  };
};
