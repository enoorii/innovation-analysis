/**
 * Dev: same-origin "/api" → Vite proxy → FastAPI (path stripped).
 * Prod: explicit backend origin (CORS must allow the deployed frontend).
 */
export const API_BASE: string = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:9123");

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
