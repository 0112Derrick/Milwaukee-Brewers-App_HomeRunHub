import express from "express";
import cors from "cors";
import { MLBLeagueIds, MlbTeamApp } from "./interfaces/interfaces.js";
import {
  fetchStandings,
  filterStandingsByDivision,
  filterStandingsByLeague,
  isDivisionsEnum,
} from "./services/standings.js";
import expressStaticGzip from "express-static-gzip/index.js";
import path from "path";
import { fileURLToPath } from "url";
import {
  fetchGameContent,
  fetchGameLineScore,
  fetchPlayByPlay,
  fetchBoxScores,
  checkMlbStory,
} from "./services/games.js";
import {
  fetchSchedule,
  fetchTeamScheduleBySeason,
} from "./services/schedules.js";
import { fetchTeams, fetchRoster } from "./services/roster.js";

const __filenameResolved = fileURLToPath(import.meta.url);
const __dirnameResolved = path.dirname(__filenameResolved);

export class Server {
  private app = express();
  private port: string | number = process.env.Port ?? 8080;
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

  constructor(port?: number) {
    if (port) {
      this.port = process.env.Port ?? port;
    }
    //this.startServer();
  }

  public buildApp() {
    this.app.use(express.static("build"));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(express.static("static"));
    this.app.use(express.static("static/js"));
    this.app.use(expressStaticGzip("build", {}));
    this.configureRoutes();
    return this.app;
  }

  // Configures middleware for parsing requests and handling CORS.
  registerStaticPaths() {
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cors());
  }

  // Sets up API endpoints and defines route behaviors.
  configureRoutes() {
    this.app.get("/", (req, res) =>
      res.sendFile(path.join(__dirnameResolved, "build", "index.html"))
    );

    this.app.get("/endpoints", (req, res) => {
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
        const data = await fetchTeams();

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
    this.app.get("/mlb/schedule", async (req, res) => {
      let teamId = parseInt(String(req.query.teamId)) || 158;
      let season =
        parseInt(String(req.query.season)) || new Date().getFullYear();
      try {
        const data = await fetchTeamScheduleBySeason(teamId, season);
        res.send(data);
        return;
      } catch (e) {
        console.error(e);
        res.send({
          copyright: "",
          error: e,
        });
        return;
      }
    });
    this.app.get("/check-mlb-story/:gamePk", async (req, res) => {
      const gamePk = parseInt(String(req.params.gamePk)) || 0;

      if (typeof gamePk !== "number" || isNaN(gamePk)) {
        res.send({ exists: false });
        return;
      }

      const results = await checkMlbStory(gamePk);

      res.send({ exists: results });
    });
    this.app.post("/mlb/standings", async (req, res) => {
      const { leagueId, seasonDt, divisionId } = req.body;

      if (typeof seasonDt !== "string") {
        res.send(
          "Error seasonDt expected type is string in yyyy-mm-dd format."
        );
        return;
      }

      if (
        typeof leagueId !== "number" &&
        leagueId !== MLBLeagueIds.americanLeagueId &&
        leagueId !== MLBLeagueIds.nationalLeagueId &&
        leagueId !== MLBLeagueIds.all
      ) {
        res.send(
          "Error leagueId expected type is number and should be equal to 103 for american league or 104 for national league."
        );
        return;
      }

      const id: MLBLeagueIds = leagueId ?? MLBLeagueIds.americanLeagueId;

      const dt = new Date(seasonDt);

      let resp = await fetchStandings(id, dt);

      if (
        divisionId &&
        typeof divisionId == "number" &&
        isDivisionsEnum(divisionId)
      ) {
        resp.records = filterStandingsByDivision(divisionId, resp.records);
      }

      if (id !== MLBLeagueIds.all) {
        resp.records = filterStandingsByLeague(id, resp.records);
      }

      res.json(resp);
    });
    this.app.post("/mlb/schedule", async (req, res) => {
      const { leagueId: sportsLeagueId, startDt, endDt } = req.body;

      const id = sportsLeagueId ?? 1;

      if (
        typeof startDt !== "string" ||
        typeof endDt !== "string" ||
        !startDt ||
        !endDt
      ) {
        res.send(
          "Error startDt/endDt expected type is string in yyyy-mm-dd format."
        );
        return;
      }

      const startdt = new Date(startDt);
      const enddt = new Date(endDt);

      const resp = await fetchSchedule(id, startdt, enddt);

      res.json(resp);
    });
    this.app.post("/mlb/roster", async (req, res) => {
      console.log(req.body);
      const { teamId, seasonDt } = req.body;

      if (!teamId || typeof teamId !== "number") {
        res.send("Error: teamId expected type is int.");
        return;
      }

      if (seasonDt && typeof seasonDt !== "string") {
        res.send(
          "Error: seasonDt expected type is string in yyyy-mm-dd format."
        );
        return;
      }

      const _seasonDt = new Date(seasonDt) ?? new Date();

      const resp = await fetchRoster(teamId, _seasonDt);

      res.json(resp);
    });
    this.app.post("/mlb/boxscore", async (req, res) => {
      console.log(req.body);
      const { leagueId, gameDt, gamePk } = req.body;

      const id = leagueId ?? 1;

      if (typeof gameDt !== "string") {
        res.send("Error gameDt expected type is string in yyyy-mm-dd format.");
        return;
      }

      if (typeof gamePk !== "number") {
        res.send("Error gamePk expected type is int.");
        return;
      }

      const gameDate = new Date(gameDt);

      const resp = await fetchBoxScores(id, gamePk, gameDate);

      res.json(resp);
    });
    this.app.post("/mlb/playbyplay", async (req, res) => {
      console.log(req.body);
      const { leagueId: sportsLeagueId, gameDt, gamePk } = req.body;

      const id = sportsLeagueId ?? 1;

      if (typeof gameDt !== "string") {
        res.send("Error gameDt expected type is string in yyyy-mm-dd format.");
        return;
      }

      if (sportsLeagueId && typeof sportsLeagueId !== "number") {
        res.send(
          "Error leagueId expected type is int. 1 = mlb, 11 = AAA, 12 = AA"
        );
        return;
      }

      if (typeof gamePk !== "number" && !gamePk) {
        res.send("Error gamePk expected type is int.");
        return;
      }

      const gameDate = new Date(gameDt);

      const resp = await fetchPlayByPlay(id, gamePk, gameDate);

      res.json(resp);
    });
    this.app.post("/mlb/linescore", async (req, res) => {
      console.log(req.body);
      const { gamePk } = req.body;

      if (typeof gamePk !== "number" && !gamePk) {
        res.send("Error gamePk expected type is int.");
        return;
      }

      const resp = await fetchGameLineScore(gamePk);

      res.json(resp);
    });
    this.app.post("/mlb/teams", async (req, res) => {
      const { teams } = req.body;

      if (
        !Array.isArray(teams) ||
        teams.length < 1 ||
        typeof teams.at(0) !== "number"
      ) {
        res.send("Error teams expected type is an int array of teams ids.");
        return;
      }

      const resp = await fetchTeams();

      if (resp.error) {
        res.json({ error: resp.error });
        return;
      }
      let respArr = [...resp.teams];
      respArr.filter((item) => !teams.includes(item.id));

      res.json(respArr);
    });
    this.app.post("/mlb/game-content", async (req, res) => {
      console.log(req.body);
      const { gamePk } = req.body;

      if (typeof gamePk !== "number" && !gamePk) {
        res.send("Error gamePk expected type is int.");
        return;
      }

      const resp = await fetchGameContent(gamePk);

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

    this.app.get("*", (_req, res) =>
      res.sendFile(path.join(__dirnameResolved, "build", "index.html"))
    );

    this.app.use((req, res) => {
      res.status(404).json({
        message: "Sorry we couldn't find the page you were looking for 🔍.",
        options: this.apiEndpoints,
      });
    });
  }

  public listen() {
    console.log("Server started on port:" + this.port);
    this.app.listen(this.port);
  }
}

const server = new Server();
