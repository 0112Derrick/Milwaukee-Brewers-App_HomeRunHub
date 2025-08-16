import axios from "axios";
import { PlayEvent } from "./interfaces/baseballField.types";
import {
  GameHeader,
  GameStatusBucket,
  MlbGame,
  PlayByPlayResponse,
  TeamMeta,
} from "./interfaces/interfaces";

export const capitalizeFirstLetter = (str: string) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

// Optional helper to derive a team logo if you don’t pass one
export const teamLogoUrl = (
  teamId: number,
  theme: "dark" | "light" = "dark",
  variant: "cap" | "primary" = "cap"
) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;

export function groupPlays(plays: PlayEvent[]) {
  const map = new Map<string, PlayEvent[]>();
  for (const p of plays) {
    const key = `${p.inning}-${p.half}`;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  // Sort keys by inning asc, top before bottom
  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    const [ia, ha] = a.split("-");
    const [ib, hb] = b.split("-");
    const na = Number(ia);
    const nb = Number(ib);
    if (na !== nb) return na - nb;
    return ha === "Top" && hb === "Bottom" ? -1 : ha === hb ? 0 : 1;
  });
  return sortedKeys.map((k) => ({ key: k, plays: map.get(k)! }));
}

export function adaptPlays(resp: PlayByPlayResponse): PlayEvent[] {
  return resp.allPlays.map((p) => ({
    id: String(p.atBatIndex),
    inning: p.about.inning,
    half: p.about.halfInning, // "top" | "bottom"
    team: p.about.isTopInning ? "away" : "home",
    result: p.result.eventType || p.result.event,
    description: p.result.description,
    count: `${p.count.balls}-${p.count.strikes}`,
    outsAfter: p.count.outs,
    awayScore: p.result.awayScore,
    homeScore: p.result.homeScore,
    isScoringPlay: p.about.isScoringPlay,
    resultObj: p.result,
    matchup: { batter: p.matchup?.batter },
    runnersRaw: Array.isArray(p.runners)
      ? p.runners
      : p.runners
      ? [p.runners]
      : [],
  }));
}

export function adaptHeader(
  pbp: PlayByPlayResponse,
  meta: { away: TeamMeta; home: TeamMeta; statusText: string }
): GameHeader {
  // Use the latest play you have to get current score and count
  const last =
    pbp.currentPlays?.[pbp.currentPlays.length - 1] ??
    pbp.allPlays?.[pbp.allPlays.length - 1];

  const scoreAway = last?.result?.awayScore ?? null;
  const scoreHome = last?.result?.homeScore ?? null;

  return {
    away: {
      team: { id: meta.away.id, name: meta.away.name, abbr: meta.away.abbr },
      score: scoreAway,
      logoUrl: meta.away.logoUrl,
    },
    home: {
      team: { id: meta.home.id, name: meta.home.name, abbr: meta.home.abbr },
      score: scoreHome,
      logoUrl: meta.home.logoUrl,
    },
    statusText: last
      ? `Inning ${last.about.inning} (${
          last.about.isTopInning ? "Top" : "Bottom"
        })`
      : "—",
    count: last?.count ?? { balls: 0, strikes: 0, outs: 0 },
  };
}

export function mlbGameStatus(detailedState: string): GameStatusBucket {
  const s = detailedState.toLowerCase();

  if (s.includes("final") || s === "game over" || s.includes("completed"))
    return "final";
  if (s.includes("postponed") || s.includes("canceled")) return "postponed";
  if (s.includes("suspend")) return "suspended";
  if (s.includes("delay")) return "delayed"; // "Rain Delay", "Delayed Start"
  if (s.includes("in progress")) return "live";
  if (s.includes("warmup") || s.includes("pre-game") || s.includes("pregame"))
    return "pregame";
  if (s.includes("scheduled") || s.includes("tbd")) return "scheduled";
  return "other";
}

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export function formatYMDLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" as a local Date at local midnight. */
export function parseYMDLocal(ymd: string): Date {
  // Basic guard
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw new Error(`Invalid YMD: ${ymd}`);
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1; // 0-based
  const day = Number(m[3]);
  return new Date(year, monthIndex, day); // local time, not UTC
}

const RANK: Record<GameStatusBucket, number> = {
  live: 0,
  pregame: 1,
  final: 2,
  scheduled: 3,
  delayed: 4,
  suspended: 5,
  postponed: 6,
  other: 7,
};

export const sortGamesArr = (
  arr: MlbGame[],
  sort: GameStatusBucket = "live"
) => {
  const games = [...arr];
  games.sort((a, b) => {
    const stA = mlbGameStatus(a?.status?.detailedState ?? "");
    const stB = mlbGameStatus(b?.status?.detailedState ?? "");

    // Boost the selected bucket
    const rankA = (stA === sort ? -100 : 0) + (RANK[stA] ?? 999);
    const rankB = (stB === sort ? -100 : 0) + (RANK[stB] ?? 999);

    if (rankA !== rankB) return rankA - rankB;

    // tie-break: start time
    return new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime();
  });
  return games;
};
