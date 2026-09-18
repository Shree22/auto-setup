/**
 * Setup API client — the single entry point the UI uses for setup data.
 *
 * Today every call is served by the mock layer. When the backend is ready,
 * set NEXT_PUBLIC_API_URL and the same functions call the real endpoints:
 *
 *   GET  {API_URL}/setup/catalog   -> SetupCatalog
 *   POST {API_URL}/setup/preview   -> ProjectPreview        (body: SetupSelection)
 *   POST {API_URL}/projects        -> GenerateProjectResult (body: SetupSelection)
 */
import {
  mockGenerateProject,
  mockGetCatalog,
  mockGetProjectPreview,
} from "./mock-api";
import type {
  GenerateProjectResult,
  ProjectPreview,
  SetupCatalog,
  SetupSelection,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return res.json() as Promise<T>;
}

export function getSetupCatalog(): Promise<SetupCatalog> {
  if (!API_URL) return mockGetCatalog();
  return request<SetupCatalog>("/setup/catalog");
}

export function getProjectPreview(selection: SetupSelection): Promise<ProjectPreview> {
  if (!API_URL) return mockGetProjectPreview(selection);
  return request<ProjectPreview>("/setup/preview", {
    method: "POST",
    body: JSON.stringify(selection),
  });
}

export function generateProject(selection: SetupSelection): Promise<GenerateProjectResult> {
  if (!API_URL) return mockGenerateProject(selection);
  return request<GenerateProjectResult>("/projects", {
    method: "POST",
    body: JSON.stringify(selection),
  });
}
