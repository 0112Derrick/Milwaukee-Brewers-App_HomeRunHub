import {
  DivisionRecord,
  DivisionResponse,
  mlbApiHost,
  MLBLeagueIds,
  StandingsResponse,
  StandingsResponseV2,
} from "../interfaces/interfaces.js";
import { DivisionsEnum } from "../interfaces/enums.js";

import axiosPkg from "axios";
import cache from "./cache.js";
const axios = axiosPkg.default;

export function isDivisionsEnum(value: number): value is DivisionsEnum {
  return Object.values(DivisionsEnum).includes(value);
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

export function filterStandingsByDivision(
  filter: DivisionsEnum,
  records: DivisionRecord[]
) {
  records = records.filter((division) => {
    division.division.id !== filter;
  });
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

    if (leagueId === MLBLeagueIds.all) {
      return combined;
    }

    return {
      copyright: combined.copyright,
      records: combined.records.filter(
        (r: DivisionRecord) => r.league.id === leagueId
      ),
      divisions: combined.divisions,
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
