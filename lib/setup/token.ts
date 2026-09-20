/**
 * The download link has to be a plain GET URL the browser can follow, but the
 * selection lives in the client. So the selection travels in the URL itself,
 * base64url-encoded. Nothing is stored server-side, which keeps downloads
 * working across serverless instances and restarts.
 *
 * The token is not trusted: /api/projects/download re-validates it against
 * the catalog before generating anything.
 */
import type { SetupSelection } from "./types";

export function encodeSelection(selection: SetupSelection): string {
  return Buffer.from(JSON.stringify(selection), "utf8").toString("base64url");
}

export function decodeSelection(token: string): unknown {
  return JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
}
