import { PlayoffSeries } from "src/interfaces/playoff.series.types";
import {
  ScheduleResponse,
  StandingsResponseV2,
} from "src/interfaces/teams.types";
import { api } from "src/utils/axios";

export async function getScheduleResp(
  ac: AbortController,
  startDt: string,
  endDt: string = ""
) {
  try {
    const scheduleEndPoint = `mlb/schedule`;
    if (!startDt || !ac) {
      return null;
    }

    if (!endDt) {
      endDt = startDt;
    }

    const scheduleResp = await api.post<ScheduleResponse>(
      scheduleEndPoint,
      {
        startDt: startDt,
        endDt: endDt,
      },
      { signal: ac.signal }
    );

    return scheduleResp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}

export async function getTeamScheduleResp(
  ac: AbortController,
  teamId: number = 158,
  season: number = new Date().getFullYear()
) {
  try {
    const scheduleEndPoint = `mlb/schedule?teamId=${teamId}&season=${season}`;

    const scheduleResp = await api.get<ScheduleResponse>(scheduleEndPoint, {
      signal: ac.signal,
    });

    return scheduleResp;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getStandingsResp(
  ac: AbortController,
  seasonDt: string | null,
  leagueId: number = 105,
  divisionId: number = 0
) {
  try {
    const scheduleEndPoint = `mlb/standings`;
    if (!seasonDt) {
      seasonDt = new Date().toISOString();
    }

    const scheduleResp = await api.post<StandingsResponseV2>(
      scheduleEndPoint,
      {
        seasonDt,
        leagueId,
        divisionId,
      },
      { signal: ac.signal }
    );

    return scheduleResp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}

export async function getPlayoffBracketResp(
  ac: AbortController | null,
  season: number,
  leagueId: number
) {
  let result: { season: number; series: PlayoffSeries[] } = {
    season,
    series: [],
  };
  try {
    result = await (
      await api.get(`/mlb/playoffs/bracket`, {
        signal: ac?.signal,
        params: { season, leagueId },
      })
    ).data;
  } catch (e) {
    // console.error(e);
  }
  return result;
}
