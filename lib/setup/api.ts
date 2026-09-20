/**
 * Browser-side client for the setup API (app/api/…).
 *
 * Server components read the catalog directly from lib/setup/catalog.ts —
 * no HTTP hop needed.
 */
import type { GenerateProjectResult, ProjectPreview, SetupSelection } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function post<T>(path: string, body: SetupSelection): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new ApiError(
      payload?.error ?? `Request to ${path} failed`,
      res.status,
      payload?.details?.map((d: { message?: string } | string) =>
        typeof d === "string" ? d : (d.message ?? "")
      )
    );
  }

  return res.json() as Promise<T>;
}

export function getProjectPreview(selection: SetupSelection): Promise<ProjectPreview> {
  return post<ProjectPreview>("/api/setup/preview", selection);
}

export function generateProject(selection: SetupSelection): Promise<GenerateProjectResult> {
  return post<GenerateProjectResult>("/api/projects", selection);
}
