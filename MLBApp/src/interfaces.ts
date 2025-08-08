import { ColumnDef } from "@tanstack/react-table";

export interface MlbTeamDataI {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  league: string;
  division: string;
}

export interface MlbTeamDataModifiedI {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  league: string;
  division: string;
  color: string;
  city: string;
  state: string;
  worldSeriesTitles: number;
  founded: number;
  hallOfFamePlayers: number;
  url: string;
}

export enum TeamPages {
  Description,
  DivisionRanking,
  Roster,
}

export interface formDataI {
  name: string;
  message: string;
  email: string;
  reasonForContact: string;
}

interface idNameLink2 {
  id: number;
  fullName: string;
  link: string;
}

interface codeDescription {
  code: string;
  description: string;
}

export interface IDLink {
  id: number;
  link: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface IdNameLink {
  id: number;
  name: string;
  link: string;
}

export interface StandingsResponse {
  copyright: string;
  records: DivisionRecord[];
}

export interface StandingsResponseV2 extends StandingsResponse {
  divisions: Division[];
}

export interface Division {
  id: number;
  name: string;
  season: string;
  nameShort: string;
  link: string;
  abbreviation: string;
  league: {
    id: number;
    link: string;
  };
  sport: {
    id: number;
    link: string;
  };
  hasWildcard: boolean;
  sortOrder: number;
  numPlayoffTeams: number;
  active: boolean;
}

export interface DivisionRecord {
  standingsType: string;
  league: ResourceLink;
  division: ResourceLink;
  sport: ResourceLink;
  lastUpdated: string;
  teamRecords: TeamRecord[];
}

export interface TeamRecord {
  team: TeamInfo;
  season: string;
  streak: Streak;
  divisionRank: string;
  leagueRank: string;
  wildCardRank?: string;
  sportRank: string;
  gamesPlayed: number;
  gamesBack: string;
  wildCardGamesBack: string;
  leagueGamesBack: string;
  springLeagueGamesBack: string;
  sportGamesBack: string;
  divisionGamesBack: string;
  conferenceGamesBack: string;
  leagueRecord: {
    wins: number;
    losses: number;
    ties: number;
    pct: string;
  };
  lastUpdated: string;
  records: {
    splitRecords: {
      wins: number;
      losses: number;
      ties: number;
      pct: string;
    }[];
    divisionRecords: {
      wins: number;
      losses: number;
      pct: string;
      division: {
        id: number;
        name: string;
        link: string;
      };
    }[];
    overallRecords: {
      wins: number;
      losses: number;
      ties: number;
      pct: string;
    }[];
    leagueRecords: {
      wins: number;
      losses: number;
      pct: string;
      league: {
        id: number;
        name: string;
        link: string;
      };
    }[];
    expectedRecords: {
      wins: number;
      losses: number;
      type: string;
      pct: string;
    }[];
  };
  runsAllowed: number;
  runsScored: number;
  divisionChamp: boolean;
  divisionLeader: boolean;
  hasWildcard: boolean;
  clinched: boolean;
  eliminationNumber: string;
  eliminationNumberSport: string;
  eliminationNumberLeague: string;
  eliminationNumberDivision: string;
  eliminationNumberConference: string;
  wildCardEliminationNumber: string;
  magicNumber: string;
  wins: number;
  losses: number;
  runDifferential: number;
  winningPercentage: string;
}

interface ResourceLink {
  id: number;
  link: string;
  href?: string;
  name?: string;
}

interface TeamInfo {
  id: number;
  name: string;
  link: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
}

interface Streak {
  streakType: string;
  streakNumber: number;
  streakCode: string;
}

export interface TeamPerformance {
  wins: number;
  losses: number;
  pct: string;
}

export interface TeamPerformance2 {
  wins: number;
  losses: number;
  pct: string;
  ties: number;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export interface RosterResponse {
  copyright: string;
  roster: Player[];
}

export interface Player {
  person: {
    id: number;
    fullName: string;
    link: string;
    firstName: string;
    lastName: string;
    primaryNumber: string;
    birthDate: string;
    currentAge: number;
    birthCity: string;
    birthCountry: string;
    height: string;
    weight: number;
    active: boolean;
    primaryPosition: {
      code: string;
      name: string;
      type: string;
      abbreviation: string;
    };
    useName: string;
    useLastName: string;
    middleName: string;
    boxscoreName: string;
    gender: string;
    nameMatrilineal: string;
    isPlayer: boolean;
    isVerified: boolean;
    pronunciation: string;
    stats: PlayerStats[];
    mlbDebutDate: string;
    batSide: {
      code: string;
      description: string;
    };
    pitchHand: {
      code: string;
      description: string;
    };
    nameFirstLast: string;
    nameSlug: string;
    firstLastName: string;
    lastFirstName: string;
    lastInitName: string;
    initLastName: string;
    fullFMLName: string;
    fullLFMName: string;
    strikeZoneTop: number;
    strikeZoneBottom: number;
  };
  jerseyNumber: string;
  position: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  status: {
    code: string;
    description: string;
  };
  parentTeamId: number;
}

export interface PlayerStats {
  type: {
    displayName: string;
  };
  group: {
    displayName: string;
  };
  exemptions: [];
  splits: SplitRow[];
}

export interface Stats {
  gamesPlayed: number;
  gamesStarted: number;
  groundOuts: number;
  airOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  avg: string;
  atBats: number;
  obp: string;
  slg: string;
  ops: string;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  groundIntoDoublePlay: number;
  numberOfPitches: number;
  era: string;
  inningsPitched: string;
  wins: number;
  losses: number;
  saves: number;
  saveOpportunities: number;
  holds: number;
  blownSaves: number;
  earnedRuns: number;
  whip: string;
  battersFaced: number;
  outs: number;
  gamesPitched: number;
  completeGames: number;
  shutouts: number;
  strikes: number;
  strikePercentage: string;
  hitBatsmen: number;
  balks: number;
  wildPitches: number;
  pickoffs: number;
  totalBases: number;
  groundOutsToAirouts: string;
  winPercentage: string;
  pitchesPerInning: string;
  gamesFinished: number;
  strikeoutWalkRatio: string;
  strikeoutsPer9Inn: string;
  walksPer9Inn: string;
  hitsPer9Inn: string;
  runsScoredPer9: string;
  homeRunsPer9: string;
  inheritedRunners: number;
  inheritedRunnersScored: number;
  catchersInterference: number;
  sacBunts: number;
  sacFlies: number;
  atBatsPerHomeRun: string;
  babip: string;
  leftonbase: number;
  plateappearances: number;
  rbi: number;
}

export interface SplitRow {
  season: string;
  stat: Stats;
  team: { id: number; name: string; link: string };
  player: { id: number; fullName: string; link: string };
  league: { id: number; name: string; link: string };
  sport: { id: number; link: string; abbreviation: string };
  gameType: string;
}

// Extend your existing SplitRow with its parent type & group
export interface SplitRowExtended {
  type: string; // ps.type.displayName
  group: string; // ps.group.displayName
  season: string;
  stat: Stats;
  team: { id: number; name: string; link: string };
  player: { id: number; fullName: string; link: string };
  league: { id: number; name: string; link: string };
  sport: { id: number; abbreviation: string; link: string };
  gameType: string;
}

export type Half = "Top" | "Bottom";

export type RunnerMove = {
  from: number; // 1,2,3,0(home)
  to: number; // 1,2,3,4 (4 = home)
  scored?: boolean;
};

export type PbPTeamInfo = {
  name: string;
  abbr: string;
  logoUrl?: string;
  score: number;
};

export type TeamSide = "home" | "away";
export type PlayEvent = {
  id: string;
  inning: number;
  half: "Top" | "Bottom";
  team: TeamSide; // 'home'|'away'
  count: string; // "B-S"
  outsAfter: number;
  result: string; // from result.event or result.description
  description: string;
  isScoringPlay: boolean;
  awayScore: number;
  homeScore: number;
};

export type GameHeader = {
  away: { name: string; abbr: string; score: number };
  home: { name: string; abbr: string; score: number };
  statusText: string;
  balls: number;
  strikes: number;
  outs: number;
};

export type PlayByPlayProps = {
  /** If true, group into Accordion by inning (Top/Bottom). */
  groupByInning?: boolean;
  /** Max height for the scroll area (e.g. "70vh" or tailwind class override). */
  maxHeightClass?: string;
  /** Initial filter: "all" | "scoring" | "home" | "away" */
  initialFilter?: "all" | "scoring" | "home" | "away";
  /** Optional callback when a play is clicked */
  onPlayClick?: (play: PlayEvent) => void;
};

export interface PlayByPlayCurrentPlay {
  result: PlayByPlayResult;
  about: PlayByPlayAbout;
  count: PlayByPlayCount;
  matchup: PlayByPlayMatchupWithZoneStats;
  pitchIndex: number[];
  actionIndex: number[];
  runnerIndex: number[];
  runners: PlayByPlayRunners[];
  playEvents: {
    details: {
      call: {
        code: string;
        description: string;
      };
      description: string;
      code: string;
      ballColor: string;
      trailColor: string;
      isInPlay: boolean;
      isStrike: boolean;
      isBall: boolean;
      type: {
        code: string;
        description: string;
      };
      isOut: boolean;
      hasReview: boolean;
    };
    count: PlayByPlayCount;
    pitchData: {
      startSpeed: number;
      endSpeed: number;
      strikeZoneTop: number;
      strikeZoneBottom: number;
      strikeZoneWidth: number;
      strikeZoneDepth: number;
      coordinates: {
        aY: number;
        aZ: number;
        pfxX: number;
        pfxZ: number;
        pX: number;
        pZ: number;
        vX0: number;
        vY0: number;
        vZ0: number;
        x: number;
        y: number;
        x0: number;
        y0: number;
        z0: number;
        aX: number;
      };
      breaks: {
        breakAngle: number;
        breakLength: number;
        breakY: number;
        breakVertical: number;
        breakVerticalInduced: number;
        breakHorizontal: number;
        spinRate: number;
        spinDirection: number;
      };
      zone: number;
      typeConfidence: number;
      plateTime: number;
      extension: number;
    };
    index: number;
    playId: string;
    pitchNumber: number;
    startTime: Date;
    endTime: Date;
    isPitch: boolean;
    type: string;
  }[];
  playEndTime: string;
  atBatIndex: number;
}

export interface BatterHotColdZonesStatsPlayByPlay {
  batterHotColdZones: {
    stats: {
      type: {
        displayName: "hotColdZones";
      };
      group: {
        displayName: "hitting";
      };
      exemptions: any[];
      splits: {
        stat: {
          name: string;
          zones: {
            zone: string;
            color: string;
            temp: string;
            value: string;
          }[];
        };
      }[];
    }[];
  }[];
}

export interface PlayByPlayResult {
  type: string;
  event: string;
  eventType: string;
  description: string;
  rbi: number;
  awayScore: number;
  homeScore: number;
  isOut: boolean;
}

export interface PlayByPlayAbout {
  atBatIndex: number;
  halfInning: "top" | "bottom";
  isTopInning: boolean;
  inning: number;
  startTime: Date;
  endTime: Date;
  isComplete: boolean;
  isScoringPlay: boolean;
  hasReview: boolean;
  hasOut: boolean;
  captivatingIndex: number;
}

export interface PlayByPlayCount {
  balls: number;
  strikes: number;
  outs: number;
}

export interface PlayByPlayMatchup {
  batter: idNameLink2;
  batSide: codeDescription;
  pitcher: idNameLink2;
  pitchHand: codeDescription;
  batterHotColdZones: {
    zone: string;
    color: string;
    temp: string;
    value: string;
  }[];
  pitcherHotColdZones: {
    zone: string;
    color: string;
    temp: string;
    value: string;
  }[];
  splits: { batter: string; pitcher: string; menOnBase: string };
}

export interface PlayByPlayMatchupWithZoneStats extends PlayByPlayMatchup {
  batterHotColdZoneStats: BatterHotColdZonesStatsPlayByPlay;
}

export interface PlayByPlayRunners {
  movement: {
    originBase: any;
    start: any;
    end: any;
    outBase: string;
    isOut: boolean;
    outNumber: number;
  };
  details: {
    event: string;
    eventType: string;
    movementReason: any;
    runner: {
      id: number;
      fullName: string;
      link: string;
    };
    responsiblePitcher: any;
    isScoringEvent: boolean;
    rbi: boolean;
    earned: boolean;
    teamUnearned: boolean;
    playIndex: number;
  };
  credits: {
    player: {
      id: number;
      link: string;
    };
    position: {
      code: string;
      name: string;
      type: string;
      abbreviation: string;
    };
    credit: string;
  }[];
}

export interface PlayByPlayAllPlays {
  result: PlayByPlayResult;
  about: PlayByPlayAbout;
  count: PlayByPlayCount;
  matchup: PlayByPlayMatchup;
  pitchIndex: number[];
  actionIndex: number[];
  runnerIndex: number[];
  runners: PlayByPlayRunners;
  playEvents: {
    details: {
      description: string;
      event: string;
      eventType: string;
      awayScore: number;
      homeScore: number;
      isScoringPlay: false;
      isOut: false;
      hasReview: false;
    };
    count: {
      balls: number;
      strikes: number;
      outs: number;
    };
    index: number;
    startTime: Date;
    endTime: Date;
    isPitch: boolean;
    type: string;
    player: IDLink;
  }[];
  playEndTime: Date;
  atBatIndex: number;
}

export interface PlayByPlayByInning {
  startIndex: 62;
  endIndex: 64;
  top: number[];
  bottom: number[];
  hits: {
    away: BoxscoreTeam[];
    home: BoxscoreTeam[];
  };
}

export interface PlayByPlayResponse {
  copyright: string;
  allPlays: PlayByPlayAllPlays[];
  currentPlays: PlayByPlayCurrentPlay[];
  scoringPlays: number[];
  playsByInning: PlayByPlayByInning[];
}

export interface BoxscoreRecord {
  gamesPlayed: number;
  wildCardGamesback: string;
  leagueGamesBack: string;
  springLeagueGamesBack: string;
  sportGamesBack: string;
  divisionGamesBack: string;
  conferenceGamesBack: string;
  leagueRecord: TeamPerformance2;
  records: any;
  divisionLeader: boolean;
  wins: number;
  losses: number;
  winningPercentage: string;
}

export interface BoxscoreTeam {
  team: {
    springLeague: {
      id: number;
      name: string;
      link: string;
      abbreviation: string;
    };
    allStarStatus: string;
    id: number;
    name: string;
    link: string;
    season: number;
    venue: IdNameLink;
    springVenue: IDLink;
    teamCode: string;
    fileCode: string;
    abbreviation: string;
    teamName: string;
    locationName: string;
    firstYearOfPlay: string;
    league: IdNameLink;
    division: IdNameLink;
    sport: IdNameLink;
    shortName: string;
    record: BoxscoreRecord;
    franchiseName: string;
    clubName: string;
    active: boolean;
    teamStats: BoxscoreTeamStats;
    players: BoxscorePlayersMap;
    batters: number[];
    pitchers: number[];
    bench: number[];
    bullpen: number[];
    battingOrder: number[];
    info: {
      title: string;
      fieldList: LabelValue[];
    }[];
    note: LabelValue[];
  };
}
// 1) Define the shape of a single player’s boxscore entry
export interface PlayerBoxscoreEntry {
  person: {
    id: number;
    fullName: string;
    link: string;
    boxscoreName: string;
  };
  jerseyNumber: string;
  position: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  status: {
    code: string;
    description: string;
  };
  parentTeamId: number;
  stats: {
    batting: Record<string, never>; // empty object
    pitching: {
      note: string;
      summary: string;
      gamesPlayed: number;
      gamesStarted: number;
      flyOuts: number;
      groundOuts: number;
      airOuts: number;
      runs: number;
      doubles: number;
      triples: number;
      homeRuns: number;
      strikeOuts: number;
      baseOnBalls: number;
      intentionalWalks: number;
      hits: number;
      hitByPitch: number;
      atBats: number;
      caughtStealing: number;
      stolenBases: number;
      stolenBasePercentage: string;
      numberOfPitches: number;
      inningsPitched: string;
      wins: number;
      losses: number;
      saves: number;
      saveOpportunities: number;
      holds: number;
      blownSaves: number;
      earnedRuns: number;
      battersFaced: number;
      outs: number;
      gamesPitched: number;
      completeGames: number;
      shutouts: number;
      pitchesThrown: number;
      balls: number;
      strikes: number;
      strikePercentage: string;
      hitBatsmen: number;
      balks: number;
      wildPitches: number;
      pickoffs: number;
      rbi: number;
      gamesFinished: number;
      runsScoredPer9: string;
      homeRunsPer9: string;
      inheritedRunners: number;
      inheritedRunnersScored: number;
      catchersInterference: number;
      sacBunts: number;
      sacFlies: number;
      passedBall: number;
      popOuts: number;
      lineOuts: number;
    };
    fielding: {
      gamesStarted: number;
      caughtStealing: number;
      stolenBases: number;
      stolenBasePercentage: string;
      assists: number;
      putOuts: number;
      errors: number;
      chances: number;
      fielding: string;
      passedBall: number;
      pickoffs: number;
    };
  };
  seasonStats: {
    batting: {
      [K in keyof PlayerBoxscoreEntry["stats"]["pitching"]]?: number | string;
    };
    pitching: {
      [K in keyof PlayerBoxscoreEntry["stats"]["pitching"]]?: number | string;
    };
    fielding: {
      [K in keyof PlayerBoxscoreEntry["stats"]["fielding"]]?: number | string;
    };
  };
  gameStatus: {
    isCurrentBatter: boolean;
    isCurrentPitcher: boolean;
    isOnBench: boolean;
    isSubstitute: boolean;
  };
  allPositions: Array<{
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  }>;
}

// 2) Then type the map keyed by "ID" + playerId
export interface BoxscorePlayersMap {
  /** e.g. "ID664285", "ID111111", etc. */
  [key: `ID${number}`]: PlayerBoxscoreEntry;
}

export interface BoxscoreTeamStats {
  batting: {
    flyOuts: number;
    groundOuts: number;
    airOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    avg: string;
    atBats: number;
    obp: string;
    slg: string;
    ops: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    groundIntoDoublePlay: number;
    groundIntoTriplePlay: number;
    plateAppearances: number;
    totalBases: number;
    rbi: number;
    leftOnBase: number;
    sacBunts: number;
    sacFlies: number;
    catchersInterference: number;
    pickoffs: number;
    atBatsPerHomeRun: string;
    popOuts: number;
    lineOuts: number;
  };
  pitching: {
    flyOuts: number;
    groundOuts: number;
    airOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    atBats: number;
    obp: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    numberOfPitches: number;
    era: string;
    inningsPitched: string;
    saveOpportunities: number;
    earnedRuns: number;
    whip: string;
    battersFaced: number;
    outs: number;
    completeGames: number;
    shutouts: number;
    pitchesThrown: number;
    balls: number;
    strikes: number;
    strikePercentage: string;
    hitBatsmen: number;
    balks: number;
    wildPitches: number;
    pickoffs: number;
    groundOutsToAirouts: string;
    rbi: number;
    pitchesPerInning: string;
    runsScoredPer9: string;
    homeRunsPer9: string;
    inheritedRunners: number;
    inheritedRunnersScored: number;
    catchersInterference: number;
    sacBunts: number;
    sacFlies: number;
    passedBall: number;
    popOuts: number;
    lineOuts: number;
  };
  fielding: {
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    assists: number;
    putOuts: number;
    errors: number;
    chances: number;
    passedBall: number;
    pickoffs: number;
  };
}

export interface BoxscoreResponse {
  copyright: string;
  teams: {
    away: BoxscoreTeam;
    home: BoxscoreTeam;
  };
}
