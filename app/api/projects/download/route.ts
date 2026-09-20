import { strToU8, zipSync } from "fflate";
import { generateProjectFiles } from "@/lib/setup/generate";
import { decodeSelection } from "@/lib/setup/token";
import { setupSelectionSchema, validateAgainstCatalog } from "@/lib/setup/validation";

/**
 * GET /api/projects/download?token=… — the generated project as a ZIP.
 *
 * A GET so the browser can download it directly from a link.
 */
export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  let decoded: unknown;
  try {
    decoded = decodeSelection(token);
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }

  const parsed = setupSelectionSchema.safeParse(decoded);
  if (!parsed.success) {
    return Response.json({ error: "Invalid selection" }, { status: 400 });
  }

  const conflicts = validateAgainstCatalog(parsed.data);
  if (conflicts.length > 0) {
    return Response.json({ error: "Incompatible selection", details: conflicts }, { status: 422 });
  }

  const projectName = parsed.data.projectName;
  const files = generateProjectFiles(parsed.data);

  const entries: Record<string, Uint8Array> = {};
  for (const file of files) {
    entries[`${projectName}/${file.path}`] = strToU8(file.content);
  }

  const zip = zipSync(entries, { level: 6 });

  return new Response(zip as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectName}.zip"`,
      "Content-Length": String(zip.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
