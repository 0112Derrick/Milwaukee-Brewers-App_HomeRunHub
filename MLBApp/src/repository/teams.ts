import { mlbTeamsDetails } from "src/data/teamData";
import { PlayerResponse } from "src/interfaces/generated.player.types";
import { TransactionsResponse } from "src/interfaces/generated.transactions.types";
import { Division, League, RosterResponse } from "src/interfaces/interfaces";
import {
  MlbTeamDataI,
  MlbTeamDataModifiedI,
  TeamsResponse,
} from "src/interfaces/teams.types";
import { api } from "src/utils/axios";
import { formatYYYYMMDD } from "src/utils/utils";

export async function getTeamResp(ac: AbortController, teamId: number = 158) {
  try {
    const scheduleEndPoint = `teams?id=` + teamId;

    const scheduleResp = await api.get<TeamsResponse>(scheduleEndPoint, {
      signal: ac.signal,
    });

    return scheduleResp;
  } catch (e) {
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
    // console.error(e);
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
    // console.error(e);
    return null;
  }
}

export async function getTeamsResp(
  ac: AbortController,
  start: number,
  itemsPerPage: number,
  searchTerm: string = "",
  league?: League,
  division?: Division
): Promise<{ totalTeams: number; teams: MlbTeamDataModifiedI[] }> {
  try {
    // Constructing query parameters based on inputs and pagination.
    let params = `start=${start}&limit=${itemsPerPage}`;

    if (Number.isInteger(parseInt(searchTerm))) {
      params += `&id=${searchTerm}`;
    } else if (searchTerm) {
      params += `&name=${searchTerm}`;
    }

    if (league && league !== League.ANY) {
      params += `&league=${league}`;
    }

    if (division) {
      params += `&division=${division}`;
    }

    const endpoint = `teams?${params}`;

    const resp = await api.get<{
      teams: MlbTeamDataI[];
      options: string[];
      maxLen: number;
    }>(endpoint, {
      signal: ac.signal,
    });
    let teams: MlbTeamDataModifiedI[] = [];

    if (resp.status == 200) {
      for (let i = 0; i < (resp.data.teams as MlbTeamDataI[]).length; i++) {
        let team = resp.data.teams[i] as MlbTeamDataModifiedI;

        let color = mlbTeamsDetails.find(
          (mlbTeam) => team.name.toLowerCase() === mlbTeam.team.toLowerCase()
        )?.color;

        if (color) team.color = color;
        teams.push(team);
      }
    }

    const maxLen = resp.data.maxLen ?? 0;

    return { totalTeams: maxLen, teams: teams };
  } catch (e) {
    // console.error(e);
    return { totalTeams: 0, teams: [] };
  }
}

export async function getTransactionsResp(
  ac: AbortController,
  {
    startDt,
    endDt,
    limit,
    order = "desc",
    teamId,
  }: {
    startDt?: string;
    endDt?: string;
    order?: "desc" | "asc";
    limit?: number;
    teamId?: number;
  }
) {
  try {
    const endpoint = `mlb/transactions`;

    if (!startDt) {
      startDt = formatYYYYMMDD(new Date());
    }

    if (!endDt) {
      endDt = startDt;
    }

    const resp = await api.post<TransactionsResponse>(
      endpoint,
      {
        startDt,
        endDt,
        limit,
        order,
        teamId,
      },
      {
        signal: ac.signal,
      }
    );

    return resp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}
