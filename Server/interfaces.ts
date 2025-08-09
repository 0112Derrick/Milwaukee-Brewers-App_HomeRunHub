export enum MLBLeagueIds {
  nationalLeagueId = 104,
  americanLeagueId = 103,
  all = 105,
}

export enum SportsLeagueId {
  MLB = 1,
  AAA = 11,
  AA = 12,
  APlus = 13,
  A = 14,
  ROK = 16,
  WIN = 17,
  MINORS = 21,
  IND = 23,
  COLLEGE = 22,
  INTC = 508,
  INEighteenAndUnder = 509,
  INSixteenAndUnder = 510,
  HS = 586,
}

// Type definitions for a general team and MLB-specific team details.;
export type team = {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  leage: string; // TODO - Spelling error, should be "league".
  division: string;
};

export type MlbTeamApp = {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  league: string;
  division: string;
};

export type mlbTeams = Array<MlbTeamApp>;

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
  leagueRecord: RecordStats;
  lastUpdated: string; // ISO date string
  records: RecordsBreakdown;
  runsAllowed: number;
  runsScored: number;
  divisionChamp: boolean;
  divisionLeader: boolean;
  wildCardLeader?: boolean;
  hasWildcard: boolean;
  clinched: boolean;
  eliminationNumber: string;
  eliminationNumberSport: string;
  eliminationNumberLeague: string;
  eliminationNumberDivision: string;
  eliminationNumberConference: string;
  wildCardEliminationNumber: string;
  magicNumber?: string;
  wins: number;
  losses: number;
  runDifferential: number;
  winningPercentage: string;
}

export interface Link {
  link: string;
}

export interface ResourceLink {
  id: number;
  link: string;
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

export interface TeamInfo extends ResourceLink {
  name: string;
}

export interface IDLink {
  id: number;
  link: string;
}

export interface IdNameLink {
  id: number;
  name: string;
  link: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface StandingsResponse {
  copyright: string;
  records: DivisionRecord[];
}

export interface DivisionRecord {
  standingsType: string;
  league: ResourceLink;
  division: ResourceLink;
  sport: ResourceLink;
  lastUpdated: string; // ISO date string
  teamRecords: TeamRecord[];
}

export interface StandingsResponseV2 extends StandingsResponse {
  divisions: Division[];
}

export interface Streak {
  streakType: string;
  streakNumber: number;
  streakCode: string;
}

export interface RecordStats {
  wins: number;
  losses: number;
  ties: number;
  pct: string;
}

export interface RecordsBreakdown {
  splitRecords: SplitRecord[];
  divisionRecords: DivisionPerformance[];
  overallRecords: SplitRecord[];
  leagueRecords: LeaguePerformance[];
  expectedRecords: ExpectedPerformance[];
}

export interface SplitRecord {
  wins: number;
  losses: number;
  type: string;
  pct: string;
}

export interface DivisionPerformance {
  wins: number;
  losses: number;
  pct: string;
  division: ResourceLink & { name: string };
}

export interface LeaguePerformance {
  wins: number;
  losses: number;
  pct: string;
  league: ResourceLink & { name: string };
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

export interface ExpectedPerformance {
  wins: number;
  losses: number;
  type: string;
  pct: string;
}

export interface MlbGameDates {
  date: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  games: MlbGame[];
}

export interface MlbGame {
  gamePk: number;
  gameGuid: string;
  link: string;
  gameType: string;
  season: string;
  gameDate: string;
  officialDate: string;
  status: MlbGameStatus;
  teams: MlbGamesTeam;
  venue: IdNameLink;
  seriesGameNumber: number;
  seriesDescription: string;
  scheduledInnings: number;
  reverseHomeAwayStatus: boolean;
  rescheduledFromDate: string; //string date yy-mm-dd
  rescheduledFrom: string; //ISO string
  recordSource: string;
  publicFacing: boolean;
  inningBreakLength: number;
  ifNecessaryDescription: string;
  ifNecessary: "Y" | "N";
  gamesInSeries: number;
  gamedayType: string;
  gameNumber: number;
  doubleHeader: string;
  description: string;
  dayNight: "day" | "night";
  content: {
    link: string;
  };
  calendarEventID: string;
  tiebreaker: string;
}

export interface GameStats {
  leagueRecord: TeamPerformance;
  score: number;
  team: IdNameLink;
  isWinner: boolean;
  splitSquad: boolean;
  seriesNumber: number;
}

export interface MlbGamesTeam {
  away: GameStats;
  home: GameStats;
  venue: IdNameLink;
  content: Link;
  isTie: boolean;
  gameNumber: number;
  publicFacing: boolean;
  doubleHeader: string;
  gamedayType: string;
  tiebreaker: string;
  calendarEventID: string;
  seasonDisplay: string;
  dayNight: "day" | "night";
  scheduledInnings: number;
  reverseHomeAwayStatus: boolean;
  inningBreakLength: number;
  gameInSeries: number;
  seriesGameNumber: number;
  seriesDescription: string;
  recordSource: string;
  ifNecessary: string;
  ifNecessaryDescription: string;
}

export interface MlbGameStatus {
  abstractGameState: string;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
  abstractGameCode: string;
}

export interface ScheduleResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: MlbGameDates[];
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

export interface DivisionResponse {
  copyright: string;
  divisions: Division[];
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
    stats: [
      {
        type: {
          displayName: string;
        };
        group: {
          displayName: string;
        };
        exemptions: [];
        splits: [
          {
            season: string;
            stat: {
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
            };
            team: {
              id: number;
              name: string;
              link: string;
            };
            player: {
              id: number;
              fullName: string;
              link: string;
            };
            league: {
              id: number;
              name: string;
              link: string;
            };
            sport: {
              id: number;
              link: string;
              abbreviation: string;
            };
            gameType: string;
          }
        ];
      }
    ];
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

export interface LiveFeedResponse {
  metaData: {
    wait: number;
    timeStamp: string; //date string {year}{month}{day}_{timestamp}
    gameEvents: string[];
    logicalEvents: string[];
  };
  liveData: {
    plays: {
      allPlays: {
        result: {
          type: string;
          event: string;
          eventType: string;
          description: string;
          rbi: number;
          awayScore: number;
          homeScore: number;
          isOut: boolean;
        };
        about: {
          atBatIndex: number;
          halfInning: string;
          isTopInning: boolean;
          inning: number;
          startTime: string; //ISO string
          endTime: string; //ISO string
          isComplete: boolean;
          isScoringPlay: boolean;
          hasReview: boolean;
          hasOut: boolean;
          captivatingIndex: number;
        };
        count: {
          balls: number;
          strikes: number;
          outs: number;
        };
        matchup: {
          batter: idNameLink2;
          batSide: {
            code: string;
            description: string;
          };
          pitcher: idNameLink2;
          pitchHand: {
            code: string;
            description: string;
          };
          postOnFirst: idNameLink2;
          batterHotColdZones: BatterHotColdZonesStatsPlayByPlay[];
          pitcherHotColdZones: any[];
          splits: {
            batter: string;
            pitcher: string;
            menOnBase: string;
          };
        };
        pitchIndex: number[];
        actionIndex: number[];
        runnerIndex: number[];
        runners: {
          movement: {
            originBase: string;
            start: string;
            end: string;
            outBase: string;
            isOut: any;
            outNumber: any;
          };
          details: {
            event: string;
            eventType: string;
            movementReason: any;
            runner: idNameLink2;
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
        }[];
        playEvents: {
          details: {
            description: "Status Change - Pre-Game";
            event: "Game Advisory";
            eventType: "game_advisory";
            awayScore: 0;
            homeScore: 0;
            isScoringPlay: false;
            isOut: false;
            hasReview: false;
          };
          count: {
            balls: 0;
            strikes: 0;
            outs: 0;
          };
          index: 0;
          startTime: "2025-08-08T20:51:25.833Z";
          endTime: "2025-08-08T23:43:11.680Z";
          isPitch: false;
          type: "action";
          player: {
            id: 596019;
            link: "/api/v1/people/596019";
          };
        }[];
        playEndTime: "2025-08-09T00:11:55.265Z";
        atBatIndex: 0;
      };
      currentPlay: {
        result: {
          type: string;
          event: string;
          eventType: string;
          description: string;
          rbi: number;
          awayScore: number;
          homeScore: number;
          isOut: boolean;
        };
        about: {
          atBatIndex: number;
          halfInning: string;
          isTopInning: boolean;
          inning: number;
          startTime: string; //ISO string
          endTime: string; //ISO string
          isComplete: boolean;
          isScoringPlay: boolean;
          hasReview: boolean;
          hasOut: boolean;
          captivatingIndex: number;
        };
        count: { balls: number; strikes: number; outs: number };
        matchup: {
          batter: idNameLink2;
          batSide: codeDescription;
          pitcher: idNameLink2;
          pitchHand: codeDescription;
          batterHotColdZoneStats: {
            stats: {
              type: {
                displayName: string;
              };
              group: {
                displayName: string;
              };
              exemptions: any[];
              splits: {
                stat: {
                  name: string;
                  zones: zoneColorTempValue[];
                };
              }[];
            }[];
          };
          batterHotColdZones: zoneColorTempValue[];
          pitcherHotColdZones: any[];
          splits: {
            batter: string;
            pitcher: string;
            menOnBase: string;
          };
        };
        pitchIndex: number[];
        actionIndex: number[];
        runnerIndex: number[];
        runners: {
          movement: {
            originBase: any;
            start: any;
            end: string;
            outBase: any;
            isOut: boolean;
            outNumber: any;
          };
          details: {
            event: string;
            eventType: string;
            movementReason: any;
            runner: idNameLink2;
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
        }[];
        playEvents: {
          details: {
            description: string;
            event: string;
            eventType: string;
            awayScore: number;
            homeScore: number;
            isScoringPlay: boolean;
            isOut: boolean;
            hasReview: boolean;
          };
          count: {
            balls: number;
            strikes: number;
            outs: number;
          };
          index: number;
          startTime: string; // ISO
          endTime: string;
          isPitch: false; // ISO
          type: string;
        }[];
        reviewDetails: {
          isOverturned: boolean;
          inProgress: boolean;
          reviewType: string;
          challengeTeamId: number;
        };
        playEndTime: string; //ISO string
        atBatIndex: number;
      }[];
      scoringPlays: number[];
      playsByInning: {
        startIndex: number;
        endIndex: number;
        top: number[];
        bottom: number[];
        hits: {
          away: {
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
            };
            inning: number;
            pitcher: idNameLink2;
            batter: idNameLink2;
            coordinates: {
              x: number;
              y: number;
            };
            type: string;
            description: string;
          }[];
          home: {
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
            };
            inning: number;
            pitcher: idNameLink2;
            batter: idNameLink2;
            coordinates: {
              x: number;
              y: number;
            };
            type: string;
            description: string;
          }[];
        };
      }[];
    };
    linescore: {
      currentInning: number;
      currentInningOrdinal: string;
      inningState: string;
      inningHalf: string;
      isTopInning: boolean;
      scheduledInnings: number;
      innings: {
        num: number;
        ordinalNum: string;
        home: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
        away: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
      }[];
      teams: {
        home: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
        away: {
          runs: number;
          hits: number;
          errors: number;
          leftOnBase: number;
        };
      };
      defense: {
        pitcher: idNameLink2;
        catcher: idNameLink2;
        first: idNameLink2;
        second: idNameLink2;
        third: idNameLink2;
        shortstop: idNameLink2;
        left: idNameLink2;
        center: idNameLink2;
        right: idNameLink2;
        batter: idNameLink2;
        onDeck: idNameLink2;
        inHole: idNameLink2;
        battingOrder: number;
        team: IdNameLink;
      };
      offense: {
        batter: idNameLink2;
        onDeck: idNameLink2;
        inHole: idNameLink2;
        pitcher: idNameLink2;
        battingOrder: number;
        team: IdNameLink;
      };
      balls: number;
      strikes: number;
      outs: number;
    };
    boxscore: {
      teams: object;
      officials: { officials: idNameLink2; officialType: string }[];
      info: any[];
      pitchingNotes: any[];
      topPerformers: any[];
    };
    decisions: {
      winner: idNameLink2;
      loser: idNameLink2;
      save: idNameLink2;
    };
    leaders: {
      hitDistance: object;
      hitSpeed: object;
      pitchSpeed: object;
    };
  };
}

interface zoneColorTempValue {
  zone: string;
  color: string;
  temp: string;
  value: string;
}
