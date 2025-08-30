import { MlbGameDates, ResourceLink } from "./interfaces";

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
  Standings,
  Roster,
  Schedule,
}

export interface TeamsResponse {
  teams?: MlbTeamDataI[];
  options: string[];
  message?: string;
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

export interface StandingsResponse {
  copyright: string;
  records: DivisionRecord[];
}

export interface ScheduleResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: MlbGameDates[];
}

export interface StandingsResponseV2 extends StandingsResponse {
  divisions: Division[];
}
