import serverless from "serverless-http";
import { Server } from "./server.js"; // whatever your default export/class is

const server = new Server();
const app = server.buildApp();

const binaryMimeTypes = [
  "text/html",
  "text/css",
  "application/javascript",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "video/mp4",
  "video/mp4",
  "video/webm",
  "font/woff2",
];

export const handler = serverless(app, { binary: binaryMimeTypes });
