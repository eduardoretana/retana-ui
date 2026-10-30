/**
 * Seed de captura para retana-ui-layout-motion.
 * No escribe datos: las escenas ya importan los fixtures con estado lleno.
 *   app/examples/number-roll/fixtures.ts  → filled (18640.5), empty, error
 *   app/examples/stagger-list/fixtures.ts → filled (jueves, 3 eventos), friday, empty, error
 *   app/examples/layout-rules/gallery.tsx → pares sí/no con saldo y lista
 * Se aplica abriendo la ruta. locale=en es inglés. locale ausente o es es es-MX.
 * reduced=1 enciende prefers-reduced-motion en el deck. scene=friday muestra el viernes sin click.
 *
 *   node scripts/layout-motion-seed.mjs --base http://127.0.0.1:40000
 */
const base = (process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://127.0.0.1:40000").replace(/\/$/, "")

const routes = [
  "/examples/layout-rules?locale=es",
  "/examples/layout-rules?locale=en",
  "/examples/number-roll?scene=filled&locale=es",
  "/examples/number-roll?scene=filled&locale=en",
  "/examples/number-roll?scene=empty&locale=es",
  "/examples/number-roll?scene=empty&locale=en",
  "/examples/number-roll?scene=error&locale=es",
  "/examples/number-roll?scene=error&locale=en",
  "/examples/number-roll?scene=filled&locale=es&reduced=1",
  "/examples/number-roll?scene=filled&locale=en&reduced=1",
  "/examples/stagger-list?scene=filled&locale=es",
  "/examples/stagger-list?scene=filled&locale=en",
  "/examples/stagger-list?scene=friday&locale=es",
  "/examples/stagger-list?scene=friday&locale=en",
  "/examples/stagger-list?scene=empty&locale=es",
  "/examples/stagger-list?scene=empty&locale=en",
  "/examples/stagger-list?scene=error&locale=es",
  "/examples/stagger-list?scene=error&locale=en",
]

for (const route of routes) console.log(`${base}${route}`)
