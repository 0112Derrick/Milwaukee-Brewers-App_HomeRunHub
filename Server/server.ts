import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import cache from "memory-cache";
import { Database } from "./jsonManager";

// Type definitions for a general team and MLB-specific team details.
type team = {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  leage: string; // TODO - Spelling error, should be "league".
  division: string;
};

type mlbTeam = {
  id: number;
  name: string;
  nickname: string;
  location: string;
  abbreviation: string;
  logo: string;
  league: string;
  division: string;
};

export type mlbTeams = Array<mlbTeam>;

class Server {
  private app = express();
  private port: string | number = process.env.Port ?? 8080;
  private __dirname = path.dirname(fileURLToPath(import.meta.url));
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

  cacheTeams(teams: mlbTeams, key: string, time = 300000) {
    cache.put(key, teams, time); // Cache for 5 minute (adjust as needed)
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
      const response = await (axios as any).get(url, {
        headers: {
          "api-key": this.apikey,
        },
        signal: AbortSignal.timeout(25000),
      });

      let data: mlbTeams = response.data.map((team: team) => ({
        id: team.id,
        name: team.name,
        nickname: team.nickname,
        location: team.location,
        abbreviation: team.abbreviation,
        logo: team.logo,
        league: team.leage, //TODO - This will need to be updated once the Brewers update their api.
        division: team.division,
      }));
      const organizedMlbTeams = this.organizeMLBTeams(data);
      this.cacheTeams(organizedMlbTeams, key);
      return { teams: organizedMlbTeams, error: null };
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request timed-out:", error.message);
      }

      const data = await Database.readMlbTeams();
      const organizedMlbTeams = this.organizeMLBTeams(data);
      this.cacheTeams(organizedMlbTeams, key);

      if (data.length > 0) return { teams: organizedMlbTeams, error: null };

      return { teams: null, error: error };
    }
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
          let filteredTeams: mlbTeam[] = mlbTeams.filter((team) => {
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

          let paginatedTeams: mlbTeam[] = [];

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

    this.app.use((req, res) => {
      res.status(404).json({
        message: "Sorry we couldn't find the page you were looking for 🔍.",
        options: this.apiEndpoints,
      });
    });
  }
}

const server = new Server();
