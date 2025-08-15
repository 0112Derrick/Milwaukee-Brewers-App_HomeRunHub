import { constants } from "fs";
import * as fs from "fs/promises";
import { mlbTeams } from "./interfaces/interfaces.js";
import path from "path";
import { fileURLToPath } from "url";

const __filenameResolved = fileURLToPath(import.meta.url);
const __dirnameResolved = path.dirname(__filenameResolved);

export class Database {
  static async checkIfFileExists(filePath: string, writeFile: boolean = true) {
    // Check if the file exists
    try {
      await fs.access(filePath, constants.F_OK);
      return true;
    } catch {
      if (writeFile) {
        // File doesn't exist, create it with an empty array
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        return true;
      }

      return false;
    }
  }

  static async readMlbTeams(): Promise<mlbTeams> {
    try {
      const jsonPath = path.join(__dirnameResolved, "teams.json");
      await Database.checkIfFileExists(jsonPath, true);

      const fileContent = await fs.readFile(jsonPath, "utf-8");

      const existingData = JSON.parse(fileContent) as mlbTeams;

      return existingData;
    } catch (e) {
      console.error("An error occurred while reading the json file. " + e);
      return [];
    }
  }
}
