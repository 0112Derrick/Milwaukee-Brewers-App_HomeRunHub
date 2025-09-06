import { PlayerResponse } from "src/interfaces/generated.player.types";
import { RosterResponse } from "src/interfaces/interfaces";
import { TeamsResponse } from "src/interfaces/teams.types";
import { api } from "src/utils/utils";

export async function getTeamsResp(ac: AbortController, teamId: number = 158) {
  try {
    const scheduleEndPoint = `teams?id=` + teamId;

    const scheduleResp = await api.get<TeamsResponse>(scheduleEndPoint, {
      signal: ac.signal,
    });

    return scheduleResp;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getRosterResp(
  ac: AbortController,
  teamId: number = 114,
  seasonDt: string
) {
  try {
    const scheduleEndPoint = `mlb/roster`;
    if (!seasonDt) {
      seasonDt = new Date().toISOString();
    }

    const scheduleResp = await api.post<RosterResponse>(
      scheduleEndPoint,
      {
        teamId,
        seasonDt,
      },
      { signal: ac.signal }
    );

    return scheduleResp;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getPlayerResp(ac: AbortController, id: number) {
  try {
    const playerEndPoint = `mlb/players/${id}`;
    if (!id) {
      return null;
    }

    const resp = await api.get<PlayerResponse>(playerEndPoint, {
      signal: ac.signal,
    });

    return resp;
  } catch (e) {
    console.error(e);
    return null;
  }
}
