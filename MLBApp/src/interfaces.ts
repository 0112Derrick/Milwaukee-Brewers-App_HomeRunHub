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
