import axiosPkg from "axios";
import cache from "./cache.js";
import {
  mlbApiHost,
  mlbTeams,
  RosterResponse,
} from "../interfaces/interfaces.js";
import { Database } from "../jsonManager.js";
import { formatYYYYMMDD } from "./utils.js";
import {
  Person,
  PlayerResponse,
} from "../interfaces/generated.player.types.js";
const axios = axiosPkg.default;

export function organizeMLBTeams(data: mlbTeams) {
  let organizedMlbTeams: mlbTeams = [];

  const americanTeams = data.filter(
    (team) => team.league === "American League"
  );

  const americanCentral = americanTeams.filter((team) => {
    return team.division.includes("Central");
  });

  const americanEast = americanTeams.filter((team) => {
    return team.division.includes("East");
  });

  const americanWest = americanTeams.filter((team) => {
    return team.division.includes("West");
  });

  const nationalTeams = data.filter(
    (team) => team.league === "National League"
  );

  const nationalCentral = nationalTeams.filter((team) => {
    return team.division.includes("Central");
  });

  const nationalEast = nationalTeams.filter((team) => {
    return team.division.includes("East");
  });

  const nationalWest = nationalTeams.filter((team) => {
    return team.division.includes("West");
  });

  // Filters and organizes teams by league and division.
  organizedMlbTeams = organizedMlbTeams.concat(
    americanCentral,
    americanEast,
    americanWest,
    nationalCentral,
    nationalEast,
    nationalWest
  );

  return organizedMlbTeams;
}

// Fetches data from an API, caches it, and organizes it based on team league and division.
export async function fetchTeams(): Promise<{ teams: mlbTeams; error: any }> {
  const key = "mlbTeams";
  const _cache = cache.getCache();
  const cachedData = _cache.get(key);
  if (cachedData) {
    return { teams: cachedData, error: null }; // Returns cached data if available, reducing API calls.
  }

  try {
    const data = await Database.readMlbTeams();
    const organizedMlbTeams = organizeMLBTeams(data);
    cache.cacheData(organizedMlbTeams, key, 600000);
    return { teams: organizedMlbTeams, error: null };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request timed-out:", error.message);
    }

    return { teams: null, error: error };
  }
}

export async function fetchRoster(
  teamId: number,
  date: Date
): Promise<RosterResponse> {
  try {
    const rosterDate = formatYYYYMMDD(date); // <-- important
    const season = date.getUTCFullYear();

    const key = `roster-${teamId}-${rosterDate}`; // <-- cache by day
    const cached = cache.getCache().get(key);
    if (cached) return cached;

    const params = new URLSearchParams({
      rosterType: "active", // or "40Man", etc.
      date: rosterDate, // <-- ask for past roster
      hydrate: `person(stats(group=[hitting,pitching],type=season,season=${season}))`,
    });

    const url = `${mlbApiHost}/api/v1/teams/${teamId}/roster?${params.toString()}`;
    const { data } = await axios.get<RosterResponse>(url);

    cache.cacheData(data, key);
    return data;
  } catch (e) {
    console.error("An error occurred while fetching roster info.", e);
    return { copyright: "", roster: [] };
  }
}

export async function fetchPlayer(id: number) {
  try {
    const hydrate = encodeURIComponent(
      "stats(group=[hitting,pitching,fielding],type=[career,yearByYear])"
    );
    const url = `${mlbApiHost}/api/v1/people/${id}?hydrate=${hydrate}`;

    const key = `player-${id}`;
    const c = cache.getCache().get(key);
    if (c) return c;

    const { data } = await axios.get<PlayerResponse>(url);

    cache.cacheData(data, key);
    return data;
  } catch (e) {
    console.error("An error occurred while fetching player info.", e);
    // Return the proper shape
    return { copyright: "", people: [] as Person[] };
  }
}
