import {
  ScheduleResponse,
  StandingsResponseV2,
} from "src/interfaces/teams.types";
import { api } from "src/utils/utils";

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
    console.error(e);
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
  seasonDt: string,
  leagueId: number = 105
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
      },
      { signal: ac.signal }
    );

    return scheduleResp;
  } catch (e) {
    console.error(e);
    return null;
  }
}
