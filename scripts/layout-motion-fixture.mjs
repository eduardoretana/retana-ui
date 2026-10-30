/**
 * Writes ui/direction/fixtures/retana-ui-layout-motion.yaml from the shape.
 * The names and figures are the seed `taller-barro`. Do not edit the yaml by hand.
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const shapePath = path.join(root, "ui/direction/fixtures/retana-ui-layout-motion.shape.yaml")
const outPath = path.join(root, "ui/direction/fixtures/retana-ui-layout-motion.yaml")
const shape = fs.readFileSync(shapePath, "utf8")
const shapeSha = createHash("sha256").update(shape).digest("hex")

const body = `schema: uis.fixture/v1
spec_id: retana-ui-layout-motion
ui_system: "4.0.0"
profile: STANDARD
seed: taller-barro
shape_sha256: ${shapeSha}
head: c4d84045b73a92112860d5d019f75c09f342fc0b
locales: [es-MX, en]
viewport:
  width: 390
  height: 844
workshop:
  es: Taller Barro
  en: Taller Barro
balance:
  value: 18640.5
  decimals: 2
  prefix: "$"
  ok_delta: 240
  fail_delta: 9000
  label:
    es: Saldo del taller
    en: Workshop balance
  hint:
    es: Esta semana
    en: This week
  empty_label:
    es: Sin movimientos
    en: No activity
  error:
    es: No pudimos leer el saldo de Taller Barro.
    en: We could not read the balance for Taller Barro.
agenda:
  thursday:
    es: Jueves
    en: Thursday
    items:
      - { id: kiln, time: "9:00", es: Horneada, en: Firing, place_es: Horno 2, place_en: Kiln 2, now: true }
      - { id: glaze, time: "11:30", es: Revisión de esmalte, en: Glaze review, place_es: Mesa norte, place_en: North bench, now: false }
      - { id: handoff, time: "16:00", es: Entrega con Nora, en: Handoff with Nora, place_es: Mostrador, place_en: Counter, now: false }
  friday:
    es: Viernes
    en: Friday
    items:
      - { id: clay, time: "10:00", es: Amasar el barro, en: Clay wedging, place_es: Taller, place_en: Studio, now: true }
      - { id: shelf, time: "13:00", es: Inventario de estantes, en: Shelf count, place_es: Bodega, place_en: Store, now: false }
  sunday:
    es: Domingo
    en: Sunday
    items: []
`

fs.writeFileSync(outPath, body)
const fixtureSha = createHash("sha256").update(body).digest("hex")
console.log(`shape_sha256 ${shapeSha}`)
console.log(`fixture_sha256 ${fixtureSha}`)
console.log(`wrote ${path.relative(root, outPath)}`)
