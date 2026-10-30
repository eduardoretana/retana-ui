/** Liveness for a capture host. 200, no redirect, no theme. */
export function GET() {
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  )
}
