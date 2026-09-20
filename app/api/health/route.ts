/** GET /api/health — liveness check for uptime monitoring. */
export function GET() {
  return Response.json({
    status: "ok",
    service: "autosetup",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
