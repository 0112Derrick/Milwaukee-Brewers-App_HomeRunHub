import {
  BoxscoreResponse,
  LiveFeedResponse,
  PlayByPlayResponse,
} from "src/interfaces/interfaces";
import { api } from "src/utils/axios";

export async function getPlayByPlayResp(
  ac: AbortController,
  gamePk: number,
  gameDt: string
) {
  try {
    const endpoint = `mlb/playbyplay`;

    if (!gamePk || !gameDt) {
      alert("GamePk or GameDt is missing.");
      return;
    }

    const resp = await api.post<PlayByPlayResponse>(
      endpoint,
      {
        gamePk,
        gameDt,
      },
      { signal: ac.signal }
    );

    return resp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}

export async function getBoxscoreResp(
  ac: AbortController,
  gamePk: number,
  gameDt: string
) {
  try {
    const endpoint = `mlb/boxscore`;

    if (!gamePk || !gameDt) {
      alert("GamePk or GameDt is missing.");
      return;
    }

    const resp = await api.post<BoxscoreResponse>(
      endpoint,
      {
        gamePk,
        gameDt,
      },
      { signal: ac.signal }
    );

    return resp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}

export async function getLinescoreResp(ac: AbortController, gamePk: number) {
  try {
    const endpoint = `mlb/linescore`;

    if (!gamePk) {
      alert("GamePk is missing.");
      return;
    }

    const resp = await api.post<LiveFeedResponse>(
      endpoint,
      {
        gamePk,
      },
      { signal: ac.signal }
    );

    return resp;
  } catch (e) {
    // console.error(e);
    return null;
  }
}
