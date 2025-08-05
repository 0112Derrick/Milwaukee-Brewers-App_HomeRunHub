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
  wins: number;
  losses: number;
  runDifferential: number;
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
