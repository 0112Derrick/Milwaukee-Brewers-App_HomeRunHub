import axiosPkg from "axios";
import { ScheduleResponse, SportsLeagueId } from "../interfaces/interfaces.js";
import cache from "./cache.js";
import { mlbApiHost } from "../interfaces/constants.js";
const axios = axiosPkg.default;

export async function fetchSchedule(
  leagueId: SportsLeagueId,
  startDt: Date,
  endDate: Date
): Promise<ScheduleResponse> {
  const startDay = new Date(startDt).toISOString().split("T").at(0);

  const endDay = new Date(endDate).toISOString().split("T").at(0);

  const api = `${mlbApiHost}/api/v1/schedule?sportId=${leagueId}&startDate=${startDay}&endDate=${endDay}`;

  try {
    const key = `schedule-${startDay}-${endDay}`;
    const _cache = cache.getCache();
    const cachedData = _cache.get(key);

    if (cachedData) {
      return cachedData; // Returns cached data if available, reducing API calls.
    }

    const res = await axios.get(api);
    cache.cacheData(res.data, key);

    return res.data;
  } catch (e) {
    console.error("An error occurred while fetching team schedule. ", e);
    return {
      copyright: "",
      dates: [],
      totalItems: 0,
      totalEvents: 0,
      totalGames: 0,
      totalGamesInProgress: 0,
    };
  }
}

type ScheduleOpts = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  // 'regular' => R only, 'postseason' => F,D,L,W only, 'all' => both
  phase?: "regular" | "postseason" | "all";
};

export async function fetchTeamScheduleBySeason(
  teamId: number,
  season: number,
  opts: ScheduleOpts = {}
) {
  const {
    startDate = `${season}-01-01`,
    endDate = `${season}-12-31`,
    phase = "all",
  } = opts;

  const gameTypes =
    phase === "regular"
      ? "R"
      : phase === "postseason"
      ? "F,D,L,W"
      : "R,F,D,L,W";

  const api =
    `${mlbApiHost}/api/v1/schedule` +
    `?sportId=1` +
    `&teamId=${teamId}` +
    `&startDate=${startDate}` +
    `&endDate=${endDate}` +
    `&gameTypes=${encodeURIComponent(gameTypes)}` +
    `&hydrate=linescore,decisions,teams`;

  const key = `schedule-${teamId}-${season}-${startDate}-${endDate}-${gameTypes}`;
  const c = cache.getCache();
  const cached = c.get(key);
  if (cached) return cached;

  try {
    const res = await axios.get(api);
    cache.cacheData(res.data, key);

    // If you *only* want playoff games and this came back empty, fall back to postseason endpoint
    if (
      phase !== "regular" &&
      (!res.data?.totalGames || res.data.totalGames === 0)
    ) {
      const psApi =
        `${mlbApiHost}/api/v1/schedule/postseason` +
        `?sportId=1&teamId=${teamId}&season=${season}` +
        `&hydrate=linescore,decisions,teams`;
      const ps = await axios.get(psApi); // same hydrate is supported
      // cache separately so you don’t refetch
      cache.cacheData(ps.data, `${key}-ps`);
      return ps.data;
    }

    return res.data;
  } catch (e) {
    console.error("An error occurred while fetching team schedule. ", e);
    return {
      copyright: "",
      dates: [],
      totalItems: 0,
      totalEvents: 0,
      totalGames: 0,
      totalGamesInProgress: 0,
    };
  }
}
