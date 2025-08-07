import express from "express";
import cors from "cors";
import axios from "axios";
import cache from "memory-cache";
import { Database } from "./jsonManager.js";
import {
  BoxscoreResponse,
  DivisionRecord,
  DivisionResponse,
  MlbGame,
  MLBLeagueIds,
  MlbTeamApp,
  mlbTeams,
  PlayByPlayResponse,
  RosterResponse,
  ScheduleResponse,
  SportsLeagueId,
  StandingsResponse,
  StandingsResponseV2,
} from "./interfaces.js";

class Server {
  private app = express();
  private port: string | number = process.env.Port ?? 8080;
  private mlbApiHost = "https://statsapi.mlb.com";
  // private __dirname = path.dirname(fileURLToPath(import.meta.url));
  private apiEndpoints = [
    "GET: -",
    `/teams?version=v1&start=0&limit=10`,
    `/teams?version=v1&start=10&limit=10`,
    `/teams?version=v1&start=20&limit=10`,
    `/teams?version=v1&limit=30`,
    "/teams?version=v1&league=american",
    "/teams?version=v1&league=national",
    "/teams?version=v1&division=east",
    "/teams?version=v1&division=west",
    "/teams?version=v1&division=central",
    "/teams?version=v1&league=american&division=east",
    "/teams?version=v1&league=american&division=west",
    "/teams?version=v1&league=american&division=central",
    "/teams?version=v1&league=national&division=east",
    "/teams?version=v1&league=national&division=west",
    "/teams?version=v1&start=0&limit=30&league=national&division=central",
    "/teams/?name=brewers",
    "/teams/?id=110",
    "/teams/?location=New york",
    "POST: - ",
    "/contact - data expected: name, email, message, reasonForContact",
  ];
  private apikey = "0ca80ddc-63f6-476e-b548-e5fb0934fc4b"; // This should be kept secure. In Production

  constructor(port?: number) {
    if (port) {
      this.port = process.env.Port ?? port;
    }
    this.startServer();
  }

  // Initializes the server and sets up basic middleware and routes.
  startServer() {
    this.app.use(express.static("static"));
    this.app.use(express.static("static/js"));
    this.app.use(express.static("/")); // Serves the root directory, could expose sensitive files.
    this.registerStaticPaths();
    this.configureRoutes();
    console.log("Server started on port:" + this.port);
    this.app.listen(this.port);
  }

  // Configures middleware for parsing requests and handling CORS.
  registerStaticPaths() {
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cors());
  }

  organizeMLBTeams(data: mlbTeams) {
    let organizedMlbTeams: mlbTeams = [];

    const americanTeams = data.filter(
      (team) => team.league === "American League"
    );

    const americanCentral = americanTeams.filter((team) => {
      return team.division.includes("Central");
    });

    const americanEast = americanTeams.filter((team) => {
      return team.division.includes("East");
    });

    const americanWest = americanTeams.filter((team) => {
      return team.division.includes("West");
    });

    const nationalTeams = data.filter(
      (team) => team.league === "National League"
    );

    const nationalCentral = nationalTeams.filter((team) => {
      return team.division.includes("Central");
    });

    const nationalEast = nationalTeams.filter((team) => {
      return team.division.includes("East");
    });

    const nationalWest = nationalTeams.filter((team) => {
      return team.division.includes("West");
    });

    // Filters and organizes teams by league and division.
    organizedMlbTeams = organizedMlbTeams.concat(
      americanCentral,
      americanEast,
      americanWest,
      nationalCentral,
      nationalEast,
      nationalWest
    );

    return organizedMlbTeams;
  }

  cacheData(data: any, key: string, time = 300000) {
    cache.put(key, data, time);
  }

  // Fetches data from an API, caches it, and organizes it based on team league and division.
  async fetchData(
    url: string,
    key: string
  ): Promise<{ teams: mlbTeams; error: any }> {
    const cachedData = cache.get(key);
    if (cachedData) {
      return { teams: cachedData, error: null }; // Returns cached data if available, reducing API calls.
    }

    try {
      // const response = await (axios as any).get(url, {
      //   headers: {
      //     "api-key": this.apikey,
      //   },
      //   signal: AbortSignal.timeout(25000),
      // });

      // let data: mlbTeams = response.data.map((team: team) => ({
      //   id: team.id,
      //   name: team.name,
      //   nickname: team.nickname,
      //   location: team.location,
      //   abbreviation: team.abbreviation,
      //   logo: team.logo,
      //   league: team.leage, //TODO - This will need to be updated once the Brewers update their api.
      //   division: team.division,
      // }));

      const data = await Database.readMlbTeams();
      const organizedMlbTeams = this.organizeMLBTeams(data);
      this.cacheData(organizedMlbTeams, key, 600000);
      return { teams: organizedMlbTeams, error: null };
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request timed-out:", error.message);
      }

      return { teams: null, error: error };
    }
  }

  async fetchStandings(
    leagueId: MLBLeagueIds,
    seasonDt: Date
  ): Promise<StandingsResponseV2> {
    try {
      const dateStr = seasonDt.toISOString().split("T")[0];
      const combinedKey = `standings-${dateStr}-all`;

      let combined = cache.get<StandingsResponseV2>(
        combinedKey
      ) as StandingsResponseV2;
      if (!combined) {
        const year = seasonDt.getFullYear();
        const [resAL, resNL] = await Promise.all([
          axios.get<StandingsResponse>(`${this.mlbApiHost}/api/v1/standings`, {
            params: {
              leagueId: MLBLeagueIds.americanLeagueId,
              season: year,
              date: dateStr,
            },
          }),
          axios.get<StandingsResponse>(`${this.mlbApiHost}/api/v1/standings`, {
            params: {
              leagueId: MLBLeagueIds.nationalLeagueId,
              season: year,
              date: dateStr,
            },
          }),
        ]);

        const divisions = await this.fetchDivision();

        combined = {
          copyright: resAL.data.copyright,
          records: [...resAL.data.records, ...resNL.data.records],
          divisions: divisions.divisions,
        };

        this.cacheData(combined, combinedKey);
      }

      if (leagueId === MLBLeagueIds.all) {
        return combined;
      }

      return {
        copyright: combined.copyright,
        records: combined.records.filter(
          (r: DivisionRecord) => r.league.id === leagueId
        ),
        divisions: combined.divisions,
      };
    } catch (e) {
      console.error("Error fetching standings ", e);
      return { copyright: "", records: [], divisions: [] };
    }
  }

  async fetchBoxScores(
    leagueId: SportsLeagueId,
    teamName: string,
    gameDt: Date
  ): Promise<BoxscoreResponse> {
    try {
      let resp = {
        copyright: "",
        teams: {
          away: null,
          home: null,
        },
      };
      const date = new Date(gameDt);

      const schedule = await this.fetchSchedule(leagueId, date, gameDt);

      const foundGame = this.findGameByTeam(schedule, teamName);

      if (foundGame) {
        const key = `boxscore-${foundGame.gamePk}`;
        const cachedData = cache.get(key);

        if (cachedData) {
          resp = cachedData;
        } else {
          const api = `${this.mlbApiHost}/api/v1/game/${foundGame.gamePk}/boxscore`;

          const boxscore = await axios.get(api);
          resp = boxscore.data;

          this.cacheData(boxscore.data, key);
        }
      }

      return resp;
    } catch (e) {
      console.error("An error occurred while fetching team standings. ", e);

      let resp = {
        copyright: "",
        teams: {
          away: null,
          home: null,
        },
      };
      return resp;
    }
  }

  async fetchPlayByPlay(
    leagueId: SportsLeagueId,
    teamName: string,
    gameDt: Date
  ): Promise<PlayByPlayResponse> {
    try {
      let resp: PlayByPlayResponse = {
        copyright: "",
        allPlays: [],
        currentPlays: [],
        scoringPlays: [],
        playsByInning: [],
      };

      const date = new Date(gameDt);
      const schedule = await this.fetchSchedule(leagueId, gameDt, date);

      const foundGame = this.findGameByTeam(schedule, teamName);

      if (foundGame) {
        const key = `playbyplay-${foundGame.gamePk}`;
        const cachedData = cache.get(key);

        if (cachedData) {
          resp = cachedData;
        } else {
          const api = `${this.mlbApiHost}/api/v1/game/${foundGame.gamePk}/playByPlay`;

          const playByPlay = await axios.get(api);
          this.cacheData(playByPlay.data, key);
          resp = playByPlay.data;
        }
      }

      return resp;
    } catch (e) {
      console.error("An error occurred while fetching team standings. ", e);

      let resp: PlayByPlayResponse = {
        copyright: "",
        allPlays: [],
        currentPlays: [],
        scoringPlays: [],
        playsByInning: [],
      };

      return resp;
    }
  }

  async fetchSchedule(
    leagueId: SportsLeagueId,
    startDt: Date,
    endDate: Date
  ): Promise<ScheduleResponse> {
    const startDay = new Date(startDt).toISOString().split("T").at(0);

    const endDay = new Date(endDate).toISOString().split("T").at(0);

    const api = `${this.mlbApiHost}/api/v1/schedule?sportId=${leagueId}&startDate=${startDay}&endDate=${endDay}`;

    try {
      const key = `schedule-${startDay}-endDay`;
      const cachedData = cache.get(key);

      if (cachedData) {
        return cachedData; // Returns cached data if available, reducing API calls.
      }

      const res = await axios.get(api);
      this.cacheData(res.data, key);

      return res.data;
    } catch (e) {
      console.error("An error occurred while fetching team schedule. ", e);
      return {
        copyright: "",
        dates: [],
        totalItems: 0,
        totalEvents: 0,
        totalGames: 0,
        totalGamesInProgress: 0,
      };
    }
  }

  async fetchDivision(id?: number): Promise<DivisionResponse> {
    try {
      const key = `division`;
      const cachedData = cache.get(key);

      if (cachedData) {
        return cachedData; // Returns cached data if available, reducing API calls.
      }

      const api = `${this.mlbApiHost}/api/v1/divisions`;
      const res = await axios.get(api);
      let data = res.data as DivisionResponse;
      this.cacheData(data, key);

      if (id) {
        data.divisions = data.divisions.filter((d) => {
          return d.id === id;
        });
      }

      return data;
    } catch (e) {
      console.error("An error occurred while fetching division info. ", e);

      let data: DivisionResponse = {
        copyright: "",
        divisions: [],
      };
      return data;
    }
  }

  async fetchRoster(teamId: number, date: Date): Promise<RosterResponse> {
    try {
      const key = `roster-${teamId}`;
      const cachedData = cache.get(key);

      if (cachedData) {
        return cachedData;
      }

      const api = `${
        this.mlbApiHost
      }/api/v1/teams/${teamId}/roster?rosterType=Active  
    &hydrate=person(stats(group=[hitting,pitching],type=season,season=${date.getUTCFullYear()}))`;

      const res = await axios.get<RosterResponse>(api);
      let data = res.data;
      this.cacheData(data, key);

      return data;
    } catch (e) {
      console.error("An error occurred while fetching roster info. ", e);

      let data: RosterResponse = {
        copyright: "",
        roster: [],
      };

      return data;
    }
  }

  private findGameByTeam(
    schedule: ScheduleResponse,
    teamName: string
  ): MlbGame | undefined {
    const normalized = teamName.trim().toLowerCase();

    for (const dateObj of schedule.dates) {
      for (const game of dateObj.games) {
        const {
          teams: {
            home: { team: homeTeam },
            away: { team: awayTeam },
          },
        } = game;

        if (
          homeTeam.name.toLowerCase().includes(normalized) ||
          awayTeam.name.toLowerCase().includes(normalized)
        ) {
          return game;
        }
      }
    }

    return undefined;
  }

  // Sets up API endpoints and defines route behaviors.
  configureRoutes() {
    this.app.get("/", (req, res) => {
      res.status(200).json({
        // Provides options for different API endpoints.
        options: this.apiEndpoints,
      });
    });

    this.app.get("/teams", async (req, res) => {
      // Implements query parameter handling for pagination and filtering.
      let start = parseInt(String(req.query.start)) || 0;
      let limit = parseInt(String(req.query.limit)) || 10;

      let version =
        req.query.version !== undefined ? String(req.query.version) : "v1";

      let league =
        req.query.league !== undefined
          ? String(req.query.league).toLowerCase()
          : null;

      let division =
        req.query.division !== undefined
          ? String(req.query.division).toLowerCase()
          : null;

      let id = req.query.id !== undefined ? parseInt(String(req.query.id)) : 0;

      let name =
        req.query.name !== undefined
          ? String(req.query.name).toLowerCase()
          : null;

      let location =
        req.query.location !== undefined
          ? String(req.query.location).toLowerCase()
          : null;

      if (league != null && league != "american" && league != "national") {
        league = null;
      }

      if (
        division != null &&
        division != "east" &&
        division != "central" &&
        division != "west"
      ) {
        division = null;
      }

      try {
        // Retrieves teams based on filters and paginates the results.
        const data = await this.fetchData(
          "http://brew-roster-svc.us-e2.cloudhub.io/api/teams",
          "mlbTeams"
        );

        if (data.error) {
          res.status(500).json({
            message:
              "An error occurred while fetching teams data. " + data.error,
            options: this.apiEndpoints,
          });
          console.log(
            `Error:\nCode:${data.error.code}\nSystem Call:${data.error.syscall}\nHostname:${data.error.hostname}\nConfig Options:${data.error.config}`
          );
          return;
        }

        const mlbTeams = data.teams;

        if (start >= mlbTeams.length) {
          start = 0;
          limit = mlbTeams.length;
        }

        if (version == "v1" || version == "") {
          let filteredTeams: MlbTeamApp[] = mlbTeams.filter((team) => {
            let matchesLeague =
              !league || team.league.toLowerCase().includes(league);
            let matchesDivision =
              !division || team.division.toLowerCase().includes(division);
            let matchesLocation =
              !location || team.location.toLowerCase().includes(location);
            let matchesId = id === 0 || team.id === id;
            let matchesName = !name || team.name.toLowerCase().includes(name);

            return (
              matchesLeague &&
              matchesDivision &&
              matchesLocation &&
              matchesId &&
              matchesName
            );
          });

          // Check if no filters are applied
          if (!league && !division && !location && id === 0 && !name) {
            filteredTeams = mlbTeams;
          }

          let paginatedTeams: MlbTeamApp[] = [];

          //Removes duplicate teams
          filteredTeams = Array.from(new Set(filteredTeams));

          paginatedTeams = filteredTeams.slice(start, start + limit);

          res.status(200).json({
            teams: paginatedTeams,
            options: this.apiEndpoints,
          });
        } else {
          res.status(404).json({
            message:
              "An unknown version was detected. Please see the options for available versions.",
            options: this.apiEndpoints,
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Sorry an error occurred while retrieving the teams.",
          options: this.apiEndpoints,
        });
      }
    });

    this.app.post("/mlb/standings", async (req, res) => {
      console.log(req.body);
      const { leagueId, seasonDt } = req.body;

      if (typeof seasonDt !== "string") {
        res.send(
          "Error seasonDt expected type is string in yyyy-mm-dd format."
        );
        return;
      }

      if (
        typeof leagueId !== "number" &&
        leagueId !== MLBLeagueIds.americanLeagueId &&
        leagueId !== MLBLeagueIds.nationalLeagueId
      ) {
        res.send(
          "Error leagueId expected type is number and should be equal to 103 for american league or 104 for national league."
        );
        return;
      }

      const id = leagueId ?? MLBLeagueIds.americanLeagueId;

      const dt = new Date(seasonDt);

      const resp = await this.fetchStandings(id, dt);

      res.json(resp);
    });
    this.app.post("/mlb/schedule", async (req, res) => {
      console.log(req.body);
      const { leagueId, startDt, endDt } = req.body;

      const id = leagueId ?? 1;

      if (typeof startDt !== "string" || typeof endDt !== "string") {
        res.send(
          "Error startDt/endDt expected type is string in yyyy-mm-dd format."
        );
        return;
      }

      const startdt = new Date(startDt);
      const enddt = new Date(endDt);

      const resp = await this.fetchSchedule(id, startdt, enddt);

      res.json(resp);
    });
    this.app.post("/mlb/roster", async (req, res) => {
      console.log(req.body);
      const { teamId, seasonDt } = req.body;

      if (!teamId || typeof teamId !== "number") {
        res.send("Error: teamId expected type is int.");
      }

      if (seasonDt && typeof seasonDt !== "string") {
        res.send(
          "Error: seasonDt expected type is string in yyyy-mm-dd format."
        );
      }

      const _seasonDt = new Date(seasonDt) ?? new Date();

      const resp = await this.fetchRoster(teamId, _seasonDt);

      res.json(resp);
    });
    this.app.post("/mlb/boxscores", async (req, res) => {
      console.log(req.body);
      const { leagueId, gameDt, teamName } = req.body;

      const id = leagueId ?? 1;

      if (typeof gameDt !== "string") {
        res.send("Error gameDt expected type is string in yyyy-mm-dd format.");
        return;
      }

      if (typeof teamName !== "string") {
        res.send("Error teamName expected type is string.");
        return;
      }

      const gameDate = new Date(gameDt);

      const resp = await this.fetchBoxScores(id, teamName, gameDate);

      res.json(resp);
    });
    this.app.post("/mlb/playbyplay", async (req, res) => {
      console.log(req.body);
      const { leagueId, gameDt, teamName } = req.body;

      const id = leagueId ?? 1;

      if (typeof gameDt !== "string") {
        res.send("Error gameDt expected type is string in yyyy-mm-dd format.");
        return;
      }

      if (typeof teamName !== "string") {
        res.send("Error teamName expected type is string.");
        return;
      }

      const gameDate = new Date(gameDt);

      const resp = await this.fetchPlayByPlay(id, teamName, gameDate);

      res.json(resp);
    });

    this.app.post("/contact", (req, res) => {
      //NOTE - This is where you would add a database in order to store the contact info.
      console.log(req.body);
      const { message, email, name, reasonForContact } = req.body;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      try {
        if (
          message &&
          email &&
          name &&
          reasonForContact &&
          emailRegex.test(email)
        ) {
          //NOTE - Sanitize inputs prior to saving them in a data base.
          res.status(200).json({
            message: `Post was successful. We will be in touch soon ${name}.`,
            options: this.apiEndpoints,
          });
        } else {
          res.status(422).json({
            message:
              "Warning Missing Data. - Expected the following: message, email, name, reasonForContact",
            options: this.apiEndpoints,
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message:
            error +
            " Something went wrong on our end when processing your contact information. Please try again.",
          options: this.apiEndpoints,
        });
      }
    });

    this.app.get("/test", async (req, res) => {
      // const standings = await this.fetchStandings(
      //   MLBLeagueIds.nationalLeagueId,
      //   2025,
      //   "2025-08-02"
      // );

      // res.json(standings);

      const today = new Date(2025, 7, 3);
      // const schedule = await this.fetchSchedule(1, today, today);
      const boxscore = await this.fetchPlayByPlay(
        SportsLeagueId.MLB,
        "Astros",
        today
      );

      res.json(boxscore);
    });

    this.app.use((req, res) => {
      res.status(404).json({
        message: "Sorry we couldn't find the page you were looking for 🔍.",
        options: this.apiEndpoints,
      });
    });
  }
}

const server = new Server();
