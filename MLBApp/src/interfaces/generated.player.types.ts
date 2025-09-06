import { Stats } from "./interfaces";

// Generated from http://localhost:8080/mlb/players/605288
export interface PlayerResponse {
  copyright: string;
  people: Person[];
}

export interface Person {
  active: boolean;
  batSide: BatSide;
  birthCity: string;
  birthCountry: string;
  birthDate: string;
  birthStateProvince: string;
  boxscoreName: string;
  currentAge: number;
  draftYear: number;
  firstLastName: FirstLastName;
  firstName: string;
  fullFMLName: string;
  fullLFMName: string;
  fullName: FirstLastName;
  gender: string;
  height: string;
  id: number;
  initLastName: string;
  isPlayer: boolean;
  isVerified: boolean;
  lastFirstName: string;
  lastInitName: string;
  lastName: string;
  link: PersonLink;
  middleName: string;
  mlbDebutDate: string;
  nameFirstLast: FirstLastName;
  nameSlug: string;
  nickName: string;
  pitchHand: BatSide;
  primaryNumber: string;
  primaryPosition: Position;
  stats: StatElement[];
  strikeZoneBottom: number;
  strikeZoneTop: number;
  useLastName: string;
  useName: string;
  weight: number;
}

export interface BatSide {
  code: Code;
  description: string;
}

export type Code = string;

export type FirstLastName = string;

export type PersonLink = string;

export interface Position {
  abbreviation: string;
  code: string;
  name: string;
  type: string;
}

export interface StatElement {
  exemptions: any[];
  group: Group;
  splits: Split[];
  type: Group;
}

export interface Group {
  displayName: string;
}

export interface Split {
  gameType: Code;
  league?: League;
  numLeagues?: number;
  numTeams?: number;
  player: Player;
  position?: Position;
  season?: string;
  sport: Sport;
  stat: SplitStat;
  team?: League;
}

export interface League {
  id: number;
  link: LeagueLink;
  name: LeagueName;
}

export type LeagueLink = string;

export type LeagueName = string;

export interface Player {
  fullName: FirstLastName;
  id: number;
  link: PersonLink;
}

export interface Sport {
  abbreviation: SportAbbreviation;
  id: number;
  link: SportLink;
}

export type SportAbbreviation = string;

export type SportLink = string;

export interface SplitStat {
  airOuts?: number;
  assists?: number;
  atBats?: number;
  atBatsPerHomeRun?: string;
  avg?: string;
  babip?: string;
  balks?: number;
  baseOnBalls?: number;
  battersFaced?: number;
  blownSaves?: number;
  catchersInterference?: number;
  caughtStealing?: number;
  caughtStealingPercentage?: string;
  chances?: number;
  completeGames?: number;
  doublePlays?: number;
  doubles?: number;
  earnedRuns?: number;
  era?: string;
  errors?: number;
  fielding?: string;
  games?: number;
  gamesFinished?: number;
  gamesPitched?: number;
  gamesPlayed: number;
  gamesStarted?: number;
  groundIntoDoublePlay?: number;
  groundOuts?: number;
  groundOutsToAirouts?: string;
  hitBatsmen?: number;
  hitByPitch?: number;
  hits?: number;
  hitsPer9Inn?: string;
  holds?: number;
  homeRuns?: number;
  homeRunsPer9?: string;
  inheritedRunners?: number;
  inheritedRunnersScored?: number;
  innings?: string;
  inningsPitched?: string;
  intentionalWalks?: number;
  leftOnBase?: number;
  losses?: number;
  numberOfPitches?: number;
  obp?: string;
  ops?: string;
  outs?: number;
  pickoffs?: number;
  pitchesPerInning?: string;
  plateAppearances?: number;
  position?: Position;
  putOuts?: number;
  rangeFactorPer9Inn?: string;
  rangeFactorPerGame?: string;
  rbi?: number;
  runs?: number;
  runsScoredPer9?: string;
  sacBunts?: number;
  sacFlies?: number;
  saveOpportunities?: number;
  saves?: number;
  shutouts?: number;
  slg?: string;
  stolenBasePercentage?: string;
  stolenBases?: number;
  strikeOuts?: number;
  strikePercentage?: string;
  strikeoutWalkRatio?: string;
  strikeoutsPer9Inn?: string;
  strikes?: number;
  throwingErrors?: number;
  totalBases?: number;
  triplePlays?: number;
  triples?: number;
  walksPer9Inn?: string;
  whip?: string;
  wildPitches?: number;
  winPercentage?: string;
  wins?: number;
  passedBall?: number;
}

export type PlayerStat = SplitStat | Stats;

export function isStat(stat: PlayerStat): stat is SplitStat {
  return (stat as SplitStat).leftOnBase !== undefined;
}
