import { GameContentResponse } from "src/interfaces/generated.game-content.types";
import { api } from "src/utils/utils";

export async function getGameContentResp(ac: AbortController, gamePk: number) {
  try {
    const endpoint = `mlb/game-content`;

    if (!gamePk) {
      alert("GamePk is missing.");
      return;
    }

    const resp = await api.post<GameContentResponse>(
      endpoint,
      {
        gamePk,
      },
      { signal: ac.signal }
    );

    return resp;
  } catch (e) {
    return null;
  }
}
