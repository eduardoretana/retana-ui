// Serves the maplibre-gl worker from this host, so the demo never loads it
// from a CDN. Hosts that install map-browser do the same with their bundler
// or a static copy, and pass the URL as provider.workerUrl.
import { readFile } from "node:fs/promises"
import path from "node:path"

export const dynamic = "force-static"

export async function GET() {
  const file = path.join(process.cwd(), "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs")
  const body = await readFile(file, "utf8")
  return new Response(body, {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
