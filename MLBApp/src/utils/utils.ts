import { mlbTeamsDetails } from "src/data/teamData";
import { PlayEvent } from "../interfaces/baseballField.types";
import {
  GameHeader,
  GameStatusBucket,
  MlbGame,
  PlayByPlayResponse,
  TeamMeta,
} from "../interfaces/interfaces";

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

export function formatYMDLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parse "YYYY-MM-DD" as a local Date at local midnight.
 * @param ymd - Date string in "YYYY-MM-DD"
 * @param asString - If true, returns a locale string instead of a Date
 * @param options - Intl.DateTimeFormat options to customize output
 */
/** Parse "YYYY-MM-DD" or ISO date as a local Date at local midnight.
 *  If `format` is true, return a localized string instead.
 */
export function parseYMDLocal(
  ymd: string,
  format = false,
  opts?: Intl.DateTimeFormatOptions
): Date | string {
  // Try YYYY-MM-DD first
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);

  let d: Date;
  if (m) {
    const year = Number(m[1]);
    const monthIndex = Number(m[2]) - 1; // 0-based
    const day = Number(m[3]);
    d = new Date(year, monthIndex, day);
  } else {
    // fall back to full date parsing (MLB uses ISO strings like 2025-09-15T17:00:00Z)
    d = new Date(ymd);
  }

  if (format) {
    try {
      return d.toLocaleString(undefined, opts ?? { timeStyle: "short" });
    } catch {
      return d.toLocaleString();
    }
  }

  return d;
}

export function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
export function formatYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function parseYYYYMMDD(s?: string): Date | undefined {
  if (!s) return;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return;
  return new Date(y, m - 1, d);
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

export function createGameHeader() {
  return {
    away: {
      team: {
        id: 0,
        name: "",
        abbr: undefined,
      },
      score: null,
      logoUrl: undefined,
    },
    home: {
      team: {
        id: 0,
        name: "",
        abbr: undefined,
      },
      score: null,
      logoUrl: undefined,
    },
    statusText: "",
    count: {
      balls: 0,
      strikes: 0,
      outs: 0,
    },
  };
}

export function seasonYear(today = new Date()) {
  // MLB season spans spring -> fall; Jan/Feb are the prior season.
  const m = today.getMonth(); // 0-based
  return m <= 1 ? today.getFullYear() - 1 : today.getFullYear();
}

export function candidateStandingsDates(today = new Date()): string[] {
  const dates: string[] = [];
  // Try today, then the last 7 days
  for (let i = 0; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const strDt = formatYYYYMMDD(d);
    dates.push(strDt);
  }
  // Safe late-season anchors for the current season (avoid hard-coded "end dates")
  const sy = seasonYear(today);
  const anchors = [
    `${sy}-10-31`,
    `${sy}-10-15`,
    `${sy}-10-01`,
    `${sy}-09-30`,
    `${sy}-09-29`,
    `${sy}-09-28`,
    `${sy}-09-27`,
    `${sy}-09-26`,
    `${sy}-09-25`,
  ];
  // for (let i = 0; i <= 7; i++) {
  //   const d = new Date(`${2025}-09-29`);
  //   d.setDate(today.getDate() - i);
  //   const strDt = formatYYYYMMDD(d);
  //   dates.push(strDt);
  // }
  for (const a of anchors) dates.push(a);
  // Deduplicate while preserving order
  const uniqueDates = Array.from(new Set(dates));
  return uniqueDates;
}

export function saveItemLocalStorage(key: string, data: string) {
  localStorage.setItem(key, data);
}

export function getItemLocalStorage(key: string) {
  return localStorage.getItem(key);
}

export function removeItemLocalStorage(key: string) {
  localStorage.removeItem(key);
}

export const withAlpha = (hexOrRgb: string, a = 0.4) => {
  // supports #RGB, #RRGGBB, rgb()
  if (hexOrRgb.startsWith("#")) {
    let h = hexOrRgb.slice(1);
    if (h.length === 3)
      h = h
        .split("")
        .map((x) => x + x)
        .join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (hexOrRgb.startsWith("rgb(")) {
    return hexOrRgb.replace("rgb(", "rgba(").replace(")", `, ${a})`);
  }
  return hexOrRgb; // let browser handle other formats
};

export function getTeamColor(team: string) {
  const teamDetail = mlbTeamsDetails.find((_team) =>
    _team.team.includes(team ?? "")
  );

  return teamDetail?.color;
}
