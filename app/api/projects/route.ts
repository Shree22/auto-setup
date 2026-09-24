import { buildPreview } from "@/lib/setup/preview";
import { encodeSelection } from "@/lib/setup/token";
import { parseSelection } from "@/lib/setup/validation";
import type { GenerateProjectResult } from "@/lib/setup/types";

/** POST /api/projects — generate a project from a selection. */
export async function POST(request: Request) {
  const parsed = await parseSelection(request);
  if (!parsed.ok) return parsed.response;

  const preview = buildPreview(parsed.data);

  const result: GenerateProjectResult = {
    projectId: `tmp-${Date.now().toString(36)}`,
    projectName: preview.projectName,
    fileCount: preview.fileCount,
    downloadUrl: `/api/projects/download?token=${encodeSelection(parsed.data)}&from=wizard`,
  };

  return Response.json(result, { status: 201 });
}
