import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

export async function sha256HexFromString(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add header automatically for POST/PUT/PATCH with JSON
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase();
  if (!["post", "put", "patch"].includes(method)) return config;

  // Serialize ONCE and reuse the exact bytes for hashing & sending
  const bodyString =
    typeof config.data === "string"
      ? config.data
      : JSON.stringify(config.data ?? {});

  const hash = await sha256HexFromString(bodyString);

  // Ensure headers is an AxiosHeaders, then set safely
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set("Content-Type", "application/json");
  headers.set("x-amz-content-sha256", hash);

  config.headers = headers;
  config.data = bodyString;
  return config;
});
