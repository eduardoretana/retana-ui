/** Liveness for the VibeBot sidecar. 200, no redirect. */
export function GET() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  )
}
