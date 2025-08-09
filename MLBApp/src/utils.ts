import {
  GameHeader,
  PlayByPlayResponse,
  PlayEvent,
  TeamMeta,
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
  return resp.allPlays.map((p) => ({
    id: String(p.atBatIndex),
    inning: p.about.inning,
    half: p.about.halfInning, // "top" | "bottom"
    team: p.about.isTopInning ? "away" : "home",
    result: p.result.eventType || p.result.event,
    description: p.result.description,
    count: `${p.count.balls}-${p.count.strikes}`,
    outsAfter: p.count.outs,
    awayScore: p.result.awayScore,
    homeScore: p.result.homeScore,
    isScoringPlay: p.about.isScoringPlay,
    resultObj: p.result,
    matchup: { batter: p.matchup?.batter },
  }));
}

export function adaptHeader(
  pbp: PlayByPlayResponse,
  meta: { away: TeamMeta; home: TeamMeta; statusText: string }
): GameHeader {
  // Use the latest play you have to get current score and count
  const last =
    pbp.currentPlays?.[pbp.currentPlays.length - 1] ??
    pbp.allPlays?.[pbp.allPlays.length - 1];

  const scoreAway = last?.result?.awayScore ?? null;
  const scoreHome = last?.result?.homeScore ?? null;

  return {
    away: {
      team: { id: meta.away.id, name: meta.away.name, abbr: meta.away.abbr },
      score: scoreAway,
      logoUrl: meta.away.logoUrl,
    },
    home: {
      team: { id: meta.home.id, name: meta.home.name, abbr: meta.home.abbr },
      score: scoreHome,
      logoUrl: meta.home.logoUrl,
    },
    statusText: meta.statusText,
    count: last?.count ?? { balls: 0, strikes: 0, outs: 0 },
  };
}

export const capitalizeFirstLetter = (str: string) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};
