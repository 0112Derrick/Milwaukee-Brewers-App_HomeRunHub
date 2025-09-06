import {
  BoxscoreResponse,
  GameContentResponse,
  LiveFeedResponse,
  mlbApiHost,
  MlbGame,
  PlayByPlayResponse,
  ScheduleResponse,
  SportsLeagueId,
} from "../interfaces/interfaces.js";
import axiosPkg from "axios";
import { fetchSchedule } from "./schedules.js";
import cache from "./cache.js";
const axios = axiosPkg.default;

export async function fetchGameLineScore(gamePk: number): Promise<any> {
  try {
    const resp = await axios.get<LiveFeedResponse>(
      `${mlbApiHost}/api/v1.1/game/${gamePk}/feed/live`
    );

    return resp.data;
  } catch (e) {
    console.error(e);
    return { copyright: "", innings: [] };
  }
}

export async function fetchGameContent(gamePk: number): Promise<any> {
  try {
    const resp = await axios.get<GameContentResponse>(
      `${mlbApiHost}/api/v1/game/${gamePk}/content`
    );

    if (resp.status !== 200 || !resp.data.media) {
      return null;
    }

    return resp.data;
  } catch (e) {
    console.error(e);
    return { copyright: "", innings: [] };
  }
}

export async function fetchBoxScores(
  leagueId: SportsLeagueId,
  gamePk: number,
  gameDt: Date
): Promise<BoxscoreResponse> {
  try {
    let resp = {
      copyright: "",
      teams: {
        away: null,
        home: null,
      },
    };
    const date = new Date(gameDt);

    const schedule = await fetchSchedule(leagueId, date, gameDt);

    const foundGame = findGameByGamePk(schedule, gamePk);

    if (foundGame) {
      const _cache = cache.getCache();
      const key = `boxscore-${foundGame.gamePk}`;
      const cachedData = _cache.get(key);

      if (cachedData) {
        resp = cachedData;
      } else {
        const api = `${mlbApiHost}/api/v1/game/${foundGame.gamePk}/boxscore`;

        const boxscore = await axios.get(api);
        resp = boxscore.data;

        cache.cacheData(boxscore.data, key);
      }
    }

    return resp;
  } catch (e) {
    console.error("An error occurred while fetching team standings. ", e);

    let resp = {
      copyright: "",
      teams: {
        away: null,
        home: null,
      },
    };
    return resp;
  }
}

export async function fetchPlayByPlay(
  leagueId: SportsLeagueId,
  gamePk: number,
  gameDt: Date
): Promise<PlayByPlayResponse> {
  try {
    let resp: PlayByPlayResponse = {
      copyright: "",
      allPlays: [],
      currentPlays: [],
      scoringPlays: [],
      playsByInning: [],
    };

    const date = new Date(gameDt);
    const schedule = await fetchSchedule(leagueId, date, date);

    const foundGame = findGameByGamePk(schedule, gamePk);

    if (foundGame) {
      const _cache = cache.getCache();
      const key = `playbyplay-${foundGame.gamePk}`;
      const cachedData = _cache.get(key);

      if (cachedData) {
        resp = cachedData;
      } else {
        const api = `${mlbApiHost}/api/v1/game/${foundGame.gamePk}/playByPlay`;

        const playByPlay = await axios.get(api);
        cache.cacheData(playByPlay.data, key, 30000);
        resp = playByPlay.data;
      }
    }

    return resp;
  } catch (e) {
    console.error("An error occurred while fetching team standings. ", e);

    let resp: PlayByPlayResponse = {
      copyright: "",
      allPlays: [],
      currentPlays: [],
      scoringPlays: [],
      playsByInning: [],
    };

    return resp;
  }
}

export async function checkMlbStory(gamePk: number) {
  const videoHref = `https://www.mlb.com/stories/game/${gamePk}`;
  let result = false;
  try {
    const apiRes = await axios.get(videoHref);
    // console.log(`Status: ${apiRes.status} | Result: ${apiRes.data}`);
    if (apiRes.status < 400) {
      result = true;
    } else {
      result = false;
    }
  } catch (e) {
    result = false;
  }

  return result;
}

export function findGameByGamePk(
  schedule: ScheduleResponse,
  gamePk: number
): MlbGame | undefined {
  for (const dateObj of schedule.dates) {
    for (const game of dateObj.games) {
      if (game.gamePk == gamePk) {
        return game;
      }
    }
  }

  return undefined;
}
