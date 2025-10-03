import {
  DivisionRecord,
  DivisionResponse,
  MLBLeagueIds,
  PlayoffBracket,
  PlayoffGame,
  PlayoffGameStatus,
  PlayoffSeries,
  PlayoffTeam,
  StandingsResponse,
  StandingsResponseV2,
} from "../interfaces/interfaces.js";
import { DivisionEnum, MlbDivisionsEnum } from "../interfaces/enums.js";

import axiosPkg from "axios";
import cache from "./cache.js";
import { mlbApiHost } from "../interfaces/constants.js";
const axios = axiosPkg.default;

export function isDivisionsEnum(value: number): value is DivisionEnum {
  return Object.values(DivisionEnum).includes(value);
}

export const divisions = {
  200: {
    name: "American League West",
    id: 200,
  },
  201: {
    name: "American League East",
    id: 201,
  },
  202: {
    name: "American League Central",
    id: 202,
  },
  203: {
    name: "National League West",
    id: 203,
  },
  204: {
    name: "ANational League East",
    id: 204,
  },
  205: {
    name: "National League Central",
    id: 205,
  },
};

export function filterStandingsByLeague(
  filter: MLBLeagueIds,
  records: DivisionRecord[]
) {
  records = records.filter((r: DivisionRecord) => r.league.id === filter);
  return records;
}

export function filterStandingsByDivision(
  filter: DivisionEnum,
  records: DivisionRecord[]
) {
  if (filter == DivisionEnum.ANY) {
    return records;
  }

  const west = [
    MlbDivisionsEnum.AmericanLeagueWest,
    MlbDivisionsEnum.NationalLeagueWest,
  ];
  const east = [
    MlbDivisionsEnum.AmericanLeagueEast,
    MlbDivisionsEnum.NationalLeagueEast,
  ];
  const central = [
    MlbDivisionsEnum.AmericanLeagueCentral,
    MlbDivisionsEnum.NationalLeagueCentral,
  ];

  if (filter == DivisionEnum.WEST) {
    records = records.filter((division) => {
      return west.includes(division.division.id);
    });
  } else if (filter == DivisionEnum.EAST) {
    records = records.filter((division) => {
      return east.includes(division.division.id);
    });
  } else {
    records = records.filter((division) => {
      return central.includes(division.division.id);
    });
  }

  return records;
}

export async function fetchStandings(
  leagueId: MLBLeagueIds,
  seasonDt: Date
): Promise<StandingsResponseV2> {
  try {
    const dateStr = seasonDt.toISOString().split("T")[0];
    const combinedKey = `standings-${dateStr}-all`;
    const _cache = cache.getCache();

    let combined = _cache.get<StandingsResponseV2>(
      combinedKey
    ) as StandingsResponseV2;
    let data: StandingsResponseV2;

    if (!combined) {
      const year = seasonDt.getFullYear();
      const [resAL, resNL] = await Promise.all([
        axios.get<StandingsResponse>(`${mlbApiHost}/api/v1/standings`, {
          params: {
            leagueId: MLBLeagueIds.americanLeagueId,
            season: year,
            date: dateStr,
          },
        }),
        axios.get<StandingsResponse>(`${mlbApiHost}/api/v1/standings`, {
          params: {
            leagueId: MLBLeagueIds.nationalLeagueId,
            season: year,
            date: dateStr,
          },
        }),
      ]);

      const divisions = await fetchDivision();

      combined = {
        copyright: resAL.data.copyright,
        records: [...resAL.data.records, ...resNL.data.records],
        divisions: divisions.divisions,
      };

      cache.cacheData(combined, combinedKey);
    }

    data = Object.assign({}, combined);

    if (leagueId === MLBLeagueIds.all) {
      return data;
    }

    return {
      copyright: data.copyright,
      records: data.records,
      divisions: data.divisions,
    };
  } catch (e) {
    console.error("Error fetching standings ", e);
    return { copyright: "", records: [], divisions: [] };
  }
}

export async function fetchDivision(id?: number): Promise<DivisionResponse> {
  try {
    const key = `division`;
    const _cache = cache.getCache();
    const cachedData = _cache.get(key);

    if (cachedData) {
      return cachedData; // Returns cached data if available, reducing API calls.
    }

    const api = `${mlbApiHost}/api/v1/divisions`;
    const res = await axios.get(api);
    let data = res.data as DivisionResponse;
    cache.cacheData(data, key);

    if (id) {
      data.divisions = data.divisions.filter((d) => {
        return d.id === id;
      });
    }

    return data;
  } catch (e) {
    console.error("An error occurred while fetching division info. ", e);

    let data: DivisionResponse = {
      copyright: "",
      divisions: [],
    };
    return data;
  }
}

// --- Playoff standings (postseason) ---

export async function fetchPlayoffBracket(
  season: number
): Promise<PlayoffBracket | null> {
  const cacheKey = `postseason-${season}`;
  const c = cache.getCache();
  const cached = c.get<PlayoffBracket>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${mlbApiHost}/api/v1/schedule/postseason`;
    const params = {
      season,
      hydrate: "team,linescore",
    };
    const { data } = await axios.get(url, { params });

    if (!data?.dates?.length) return null;

    const seriesMap = new Map<string, PlayoffSeries>();

    // helpers for games
    const mapGameState = (detailed: string | undefined): PlayoffGameStatus => {
      const s = (detailed ?? "").toLowerCase();
      if (/final|completed|game over/.test(s)) return "final";
      if (/in[-\s]?progress|live/.test(s)) return "in_progress";
      return "scheduled";
    };
    const toIsoDate = (g: any, fallbackDate: string) =>
      (g.officialDate ?? g.gameDate ?? fallbackDate ?? "").slice(0, 10);

    for (const d of data.dates as any[]) {
      for (const g of (d.games ?? []) as any[]) {
        const roundDesc: string = g.seriesDescription ?? "";
        const round: PlayoffSeries["round"] = /wild card/i.test(roundDesc)
          ? "WC"
          : /division/i.test(roundDesc)
          ? "LDS"
          : /league championship|lcs/i.test(roundDesc)
          ? "LCS"
          : /world series|ws/i.test(roundDesc)
          ? "WS"
          : (undefined as any);
        if (!round) continue;

        const leagueId =
          g.teams?.home?.league?.id ?? g.teams?.away?.league?.id ?? undefined;

        const homeTeam: PlayoffTeam = {
          id: g.teams?.home?.team?.id,
          name: g.teams?.home?.team?.name,
          abbreviation: g.teams?.home?.team?.abbreviation,
          leagueId: g.teams?.home?.team?.league?.id,
        };
        const awayTeam: PlayoffTeam = {
          id: g.teams?.away?.team?.id,
          name: g.teams?.away?.team?.name,
          abbreviation: g.teams?.away?.team?.abbreviation,
          leagueId: g.teams?.away?.team?.league?.id,
        };

        const seriesId = makeSeriesKey(g, season);

        // infer best-of from round
        const bestOf: PlayoffSeries["bestOf"] =
          round === "WC" ? 3 : round === "LDS" ? 5 : 7;

        // series status
        const detailed = (g.status?.detailedState ?? "").toLowerCase();
        const status: PlayoffSeries["status"] = /final|completed/.test(detailed)
          ? "final"
          : /in progress|live|in-progress/.test(detailed)
          ? "in_progress"
          : "scheduled";

        // series wins (prefer linescore seriesWins)
        const winsHome =
          g.linescore?.teams?.home?.seriesWins ??
          g.teams?.home?.wins ??
          g.teams?.home?.leagueRecord?.wins ??
          0;
        const winsAway =
          g.linescore?.teams?.away?.seriesWins ??
          g.teams?.away?.wins ??
          g.teams?.away?.leagueRecord?.wins ??
          0;

        // ensure series exists
        let series = seriesMap.get(seriesId);
        if (!series) {
          series = {
            id: seriesId,
            round,
            leagueId,
            bestOf,
            status,
            startDate: toIsoDate(g, d.date),
            winsHome,
            winsAway,
            home: homeTeam,
            away: awayTeam,
            games: [],
          };
          seriesMap.set(seriesId, series);
        } else {
          // update rolling wins & status as later games arrive
          series.winsHome = Math.max(series.winsHome, winsHome);
          series.winsAway = Math.max(series.winsAway, winsAway);
          if (series.status !== "final") {
            series.status =
              status === "final"
                ? "final"
                : status === "in_progress"
                ? "in_progress"
                : series.status;
          }
          const dt = toIsoDate(g, d.date);
          if (series.startDate && dt && dt < series.startDate) {
            series.startDate = dt;
          }
        }

        // map this game → PlayoffGame
        const gamePk: number = g.gamePk;
        const game: PlayoffGame = {
          gamePk,
          date: toIsoDate(g, d.date),
          state: mapGameState(g.status?.detailedState),
          seriesGameNumber: g.seriesGameNumber ?? g.seriesGameNumber, // usually present
          gameNumber: g.gameNumber, // may be undefined
          venue: g.venue?.name,
          homeId: g.teams?.home?.team?.id,
          awayId: g.teams?.away?.team?.id,
          homeScore:
            typeof g.teams?.home?.score === "number"
              ? g.teams.home.score
              : g.linescore?.teams?.home?.runs ?? null,
          awayScore:
            typeof g.teams?.away?.score === "number"
              ? g.teams.away.score
              : g.linescore?.teams?.away?.runs ?? null,
        };

        // de-dupe by gamePk
        if (!series.games.some((gm) => gm.gamePk === gamePk)) {
          series.games.push(game);
        }
      }
    }

    // finalize & sort
    const out: PlayoffBracket = {
      season,
      series: Array.from(seriesMap.values())
        .map((s) => ({
          ...s,
          games: s.games.sort((a, b) => {
            const an = a.seriesGameNumber ?? 99;
            const bn = b.seriesGameNumber ?? 99;
            if (an !== bn) return an - bn;
            return a.date.localeCompare(b.date);
          }),
        }))
        .sort((a, b) => {
          const order: Record<PlayoffSeries["round"], number> = {
            WC: 1,
            LDS: 2,
            LCS: 3,
            WS: 4,
          };
          return order[a.round] - order[b.round];
        }),
    };

    cache.cacheData(out, cacheKey);
    return out;
  } catch (err) {
    console.error("Failed to fetch postseason bracket:", err);
    return null;
  }
}

// --- helpers ---
const inferRound = (desc: string): "WC" | "LDS" | "LCS" | "WS" | undefined =>
  /wild card/i.test(desc)
    ? "WC"
    : /division/i.test(desc)
    ? "LDS"
    : /league championship|lcs/i.test(desc)
    ? "LCS"
    : /world series|ws/i.test(desc)
    ? "WS"
    : undefined;

const inferLeagueId = (g: any, desc: string): 103 | 104 | undefined => {
  // prefer real teams
  const lid =
    g?.teams?.home?.team?.league?.id ?? g?.teams?.away?.team?.league?.id;
  if (lid === 103 || lid === 104) return lid as 103 | 104;
  // fallbacks from code/description
  const code = g?.seriesCode as string | undefined; // ALWC, ALDS, ALCS, NLDS, NLCS, WS
  if (code?.startsWith("AL")) return 103;
  if (code?.startsWith("NL")) return 104;
  if (/\bAL\b/i.test(desc)) return 103;
  if (/\bNL\b/i.test(desc)) return 104;
  return undefined;
};

const cleanToken = (s?: string) =>
  (s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bAL\b/g, "American League")
    .replace(/\bNL\b/g, "National League")
    .replace(/\bWPCT\b/gi, "Winning %")
    .replace(/\bALCS\b/g, "American League Championship Series")
    .replace(/\bNLCS\b/g, "National League Championship Series");

const participantToken = (t: any): string => {
  // prefer stable team id
  const id = t?.team?.id;
  if (id) return `T:${id}`;
  // else use readable placeholder (e.g., "American League Higher Seed", "Winner ALWC 1")
  const name = t?.team?.name || t?.name || "";
  return `P:${cleanToken(name) || "TBD"}`;
};

// Normalized, stable key per series
function makeSeriesKey(g: any, season: number) {
  const code: string | undefined = g.seriesCode; // "ALWC","NLDS","ALCS","NLCS","WS"
  const num: number | undefined = g.seriesNumber; // often 1..2 for WC/LDS
  const desc: string = g.seriesDescription ?? "";
  const round = inferRound(desc);
  const leagueId = inferLeagueId(g, desc);

  // WS: only 1
  if (code === "WS" || round === "WS") return `${season}-WS`;

  // LCS: exactly one per league
  if (code === "ALCS" || (round === "LCS" && leagueId === 103))
    return `${season}-ALCS`;
  if (code === "NLCS" || (round === "LCS" && leagueId === 104))
    return `${season}-NLCS`;

  // WC/LDS: need TWO series per league
  // If API gives seriesNumber, keep using it (best signal)
  if (
    (code === "ALWC" ||
      code === "NLWC" ||
      code === "ALDS" ||
      code === "NLDS") &&
    num != null
  ) {
    return `${season}-${code}-${num}`;
  }

  // Participant-aware fallback: use the (home,away) participants to distinguish both series,
  // even when teams are placeholders (e.g., "Higher Seed" vs "Winner ALWC 1").
  const roundTag =
    round === "WC"
      ? leagueId === 103
        ? "ALWC"
        : "NLWC"
      : round === "LDS"
      ? leagueId === 103
        ? "ALDS"
        : "NLDS"
      : `RND-${round ?? "X"}`;

  const homeTok = participantToken(g?.teams?.home);
  const awayTok = participantToken(g?.teams?.away);

  // order-independent pair so home/away swaps don't fork a new series
  const pair = [homeTok, awayTok].sort().join("|");

  return `${season}-${roundTag}-${pair}`;
}
