import { Server } from "./server.js";
const s = new Server(Number(process.env.PORT) || 8080);
const app = s.buildApp();
s.listen();
