import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";
import {
  LambdaClient,
  UpdateFunctionCodeCommand,
} from "@aws-sdk/client-lambda";

const __filenameResolved = fileURLToPath(import.meta.url);
const __dirnameResolved = path.dirname(__filenameResolved);

// When this script runs from compiled JS, __dirname === <projectRoot>/lib
const projectRoot = path.resolve(__dirnameResolved, "..");
const serverLibPath = path.join(projectRoot, "lib"); // compiled TS output
const repoRoot = path.resolve(projectRoot, ".."); // <repo>
const clientPath = path.join(repoRoot, "MLBApp"); // <repo>/MLBApp
const buildPath = path.join(clientPath, "build"); // CRA build
const serverBuildPath = path.join(serverLibPath, "build"); // where SPA goes in Lambda
const zipFilePath = path.join(projectRoot, "lambda.zip"); // zip next to Server

const lambdaClient = new LambdaClient({ region: "us-east-1" });
const functionName = "homeRunHub"; // your Lambda name

(async () => {
  try {
    // 0) Compile server TS first (so lib/ exists)
    console.log("Compiling server (tsc)...");
    execSync("npm run compile", { cwd: projectRoot, stdio: "inherit" });

    if (!fs.existsSync(clientPath)) {
      throw new Error(`Could not find CRA app at: ${clientPath}`);
    }

    // 1) Build CRA
    console.log("Building React app...");
    execSync("npm run build", { cwd: clientPath, stdio: "inherit" });

    // 2) Put CRA build into lib/build so your expressStaticGzip('build') works in Lambda
    console.log("Moving build output to server lib/...");
    fs.emptyDirSync(serverBuildPath);
    fs.copySync(buildPath, serverBuildPath);

    // 3) Copy JSON data files into lib/ so runtime can read them
    // Add any others you need here
    const jsonFiles = ["teams.json"];
    for (const f of jsonFiles) {
      const src = path.join(projectRoot, f);
      const dst = path.join(serverLibPath, path.basename(f));
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`Copied ${f} -> lib/`);
      } else {
        console.warn(`WARNING: ${f} not found at project root; skipping.`);
      }
    }

    // 4) Create zip: include lib/, node_modules/, and package.json
    console.log("Zipping server files...");
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", async () => {
      console.log(`Zip created: ${zipFilePath} (${archive.pointer()} bytes)`);

      // 5) Upload to Lambda
      console.log("Uploading zip to AWS Lambda...");
      const zipBuffer = fs.readFileSync(zipFilePath);
      const command = new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: zipBuffer,
      });
      const response = await lambdaClient.send(command);
      console.log("Lambda updated:", response.FunctionArn || "");

      // 6) Clean up local zip (optional). Keep lib/build for next deploy speed or clear it—your call.
      console.log("Cleaning up...");
      fs.removeSync(zipFilePath);
      console.log("Done.");
    });

    archive.on("error", (err) => {
      throw err;
    });
    archive.pipe(output);

    // Important: include runtime deps and metadata
    archive.directory(serverLibPath, "");
    archive.directory(path.join(projectRoot, "node_modules"), "node_modules");
    archive.file(path.join(projectRoot, "package.json"), {
      name: "package.json",
    });

    await archive.finalize();
  } catch (error: any) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
})();
