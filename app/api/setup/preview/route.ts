import { buildPreview } from "@/lib/setup/preview";
import { parseSelection } from "@/lib/setup/validation";

/** POST /api/setup/preview — what the generated project would contain. */
export async function POST(request: Request) {
  const parsed = await parseSelection(request);
  if (!parsed.ok) return parsed.response;

  return Response.json(buildPreview(parsed.data));
}
