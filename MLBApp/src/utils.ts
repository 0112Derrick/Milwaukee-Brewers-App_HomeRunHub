import {
  GameHeader,
  PlayByPlayResponse,
  PlayEvent,
  TeamSide,
} from "./interfaces";

export function groupPlays(plays: PlayEvent[]) {
  const map = new Map<string, PlayEvent[]>();
  for (const p of plays) {
    const key = `${p.inning}-${p.half}`;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  // Sort keys by inning asc, top before bottom
  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    const [ia, ha] = a.split("-");
    const [ib, hb] = b.split("-");
    const na = Number(ia);
    const nb = Number(ib);
    if (na !== nb) return na - nb;
    return ha === "Top" && hb === "Bottom" ? -1 : ha === hb ? 0 : 1;
  });
  return sortedKeys.map((k) => ({ key: k, plays: map.get(k)! }));
}

export function adaptPlays(resp: PlayByPlayResponse): PlayEvent[] {
  // If your server mirrors StatsAPI, allPlays is the history
  return (resp.allPlays ?? []).map((p) => {
    const half = p.about.isTopInning ? "Top" : "Bottom";
    const team: TeamSide = p.about.isTopInning ? "away" : "home";

    const resultText = p.result?.event || p.result?.description || "";
    const desc = p.result?.description || "";

    return {
      id: String(p.atBatIndex),
      inning: p.about.inning,
      half,
      team,
      count: `${p.count.balls}-${p.count.strikes}`,
      outsAfter: p.count.outs,
      result: resultText,
      description: desc,
      isScoringPlay: p.about.isScoringPlay ?? false,
      awayScore: p.result?.awayScore ?? 0,
      homeScore: p.result?.homeScore ?? 0,
    };
  });
}

export function adaptHeader(
  resp: PlayByPlayResponse,
  // pass these from your schedule page (via URL params or route state)
  teams: {
    awayName: string;
    awayAbbr: string;
    homeName: string;
    homeAbbr: string;
  }
): GameHeader {
  // Pick the last play as "current" if server didn't supply one
  const last = [...(resp.allPlays ?? [])].pop();
  const count = last?.count ?? { balls: 0, strikes: 0, outs: 0 };

  return {
    away: {
      name: teams.awayName,
      abbr: teams.awayAbbr,
      score: last?.result?.awayScore ?? 0,
    },
    home: {
      name: teams.homeName,
      abbr: teams.homeAbbr,
      score: last?.result?.homeScore ?? 0,
    },
    statusText: last
      ? `Inning ${last.about.inning} (${
          last.about.isTopInning ? "Top" : "Bottom"
        })`
      : "—",
    balls: count.balls,
    strikes: count.strikes,
    outs: count.outs,
  };
}
