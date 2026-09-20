/**
 * Server-side validation for anything the wizard sends.
 * The UI already prevents bad combinations; this does not trust it.
 */
import { z } from "zod";
import { catalog } from "./catalog";

export const setupSelectionSchema = z.object({
  applicationType: z.enum(["web", "mobile", "api"]),
  toolId: z.string().min(1).nullable(),
  languageId: z.string().min(1).nullable(),
  frameworkId: z.string().min(1).nullable(),
  browserIds: z.array(z.string().min(1)).max(10),
  structureId: z.string().min(1).nullable(),
  addonIds: z.array(z.string().min(1)).max(30),
  projectName: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9_-]{1,49}$/,
      "Use 2–50 lowercase letters, numbers, hyphens or underscores."
    ),
});

export type SetupSelectionInput = z.infer<typeof setupSelectionSchema>;

/** Checks a selection against the catalog, so a client can't ask for an
 *  impossible combination such as Cypress with Java. */
export function validateAgainstCatalog(selection: SetupSelectionInput): string[] {
  const errors: string[] = [];

  const tool = catalog.tools.find((t) => t.id === selection.toolId);
  if (!tool) return [`Unknown tool: ${selection.toolId ?? "none"}`];

  if (!selection.languageId || !tool.languageIds.includes(selection.languageId)) {
    errors.push(`${tool.name} does not support language: ${selection.languageId ?? "none"}`);
  }

  const framework = catalog.frameworks.find((f) => f.id === selection.frameworkId);
  if (
    !framework ||
    !framework.toolIds.includes(tool.id) ||
    (selection.languageId && !framework.languageIds.includes(selection.languageId))
  ) {
    errors.push(`Invalid framework for this stack: ${selection.frameworkId ?? "none"}`);
  }

  if (!catalog.structures.some((s) => s.id === selection.structureId)) {
    errors.push(`Unknown project structure: ${selection.structureId ?? "none"}`);
  }

  const unknownBrowser = selection.browserIds.find(
    (id) => !catalog.browsers.some((b) => b.id === id)
  );
  if (unknownBrowser) errors.push(`Unknown browser: ${unknownBrowser}`);

  if (tool.supportsBrowsers && selection.browserIds.length === 0) {
    errors.push("Select at least one browser.");
  }

  const unknownAddon = selection.addonIds.find(
    (id) => !catalog.addons.some((a) => a.id === id)
  );
  if (unknownAddon) errors.push(`Unknown add-on: ${unknownAddon}`);

  return errors;
}

type Parsed =
  | { ok: true; data: SetupSelectionInput }
  | { ok: false; response: Response };

/** Parses and validates a request body, or returns the error response to send. */
export async function parseSelection(request: Request): Promise<Parsed> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const parsed = setupSelectionSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Invalid selection",
          details: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  const conflicts = validateAgainstCatalog(parsed.data);
  if (conflicts.length > 0) {
    return {
      ok: false,
      response: Response.json(
        { error: "Incompatible selection", details: conflicts },
        { status: 422 }
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
