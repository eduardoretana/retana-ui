/** Liveness for a headless capture. 200, no redirect. */

export function GET() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: { "cache-control": "no-store" },
    },
  )
}
