import {
  ScheduleResponse,
  StandingsResponseV2,
} from "src/interfaces/interfaces";
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
