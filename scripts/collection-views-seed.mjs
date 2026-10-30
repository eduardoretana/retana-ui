/**
 * Seed de captura para retana-ui-collection-views.
 * No escribe datos. Los pedidos viven en app/examples/collection-views/fixtures.ts.
 * filled, list, timeline y crowded traen ítems. empty no. loading y error muestran el aviso.
 * Se aplica abriendo la ruta. locale=en es inglés. locale ausente o es es es-MX.
 * reduced=1 enciende menos movimiento en el deck. view=board|list|timeline fija la píldora.
 *
 * Install, build y start. HOST y PORT son configurables. El ejemplo usa 127.0.0.1 y 40000.
 *   pnpm install --frozen-lockfile
 *   HOST=127.0.0.1 PORT=40000 pnpm build
 *   HOST=127.0.0.1 PORT=40000 pnpm exec next start --hostname "$HOST" --port "$PORT"
 * Healthcheck, 200 y sin redirección:
 *   curl --max-redirs 0 -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:40000/api/health"
 *
 *   node scripts/collection-views-seed.mjs --base http://127.0.0.1:40000
 *
 * Viewports de captura: 390 y 1280.
 * Morph, sin recargar: abrir filled en es-MX y pasar la píldora Tablero → Lista → Cronograma → Tablero.
 */
const base = (process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://127.0.0.1:40000").replace(/\/$/, "")

const states = ["filled", "empty", "loading", "error"]
const views = ["board", "list", "timeline"]
const locales = ["es", "en"]

const routes = []
for (const state of states) {
  for (const view of views) {
    for (const locale of locales) {
      routes.push(`/examples/collection-views?scene=${state}&view=${view}&locale=${locale}`)
    }
  }
}
for (const view of views) {
  for (const locale of locales) {
    routes.push(`/examples/collection-views?scene=filled&view=${view}&locale=${locale}&reduced=1`)
  }
}
routes.push("/examples/collection-views?scene=list&locale=es")
routes.push("/examples/collection-views?scene=timeline&locale=es")
routes.push("/examples/collection-views?scene=crowded&view=board&locale=es")
routes.push("/examples/collection-views?scene=no-matches&view=board&locale=es")

for (const route of routes) console.log(`${base}${route}`)
