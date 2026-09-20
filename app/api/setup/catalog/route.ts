import { catalog } from "@/lib/setup/catalog";

/** GET /api/setup/catalog — every option the wizard offers. */
export function GET() {
  return Response.json(catalog);
}
