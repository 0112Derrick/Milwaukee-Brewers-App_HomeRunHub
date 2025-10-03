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

export async function fetchTeamScheduleBySeason(
  teamId: number,
  season: number
) {
  try {
    const api =
      mlbApiHost +
      `/api/v1/schedule?sportId=1&teamId=${teamId}&season=${season}&gameTypes=R,F,D,L,W&hydrate=linescore,decisions,teams`;
    // R=Regular, F/D/L/W=Postseason rounds (optional)

    const key = `schedule-${teamId}-${season}`;
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
