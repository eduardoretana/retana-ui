# Learning — libro de inventario

- **Fecha:** 2026-11-06
- **Pieza:** `stock-ledger` y `stock-movement-dialog` (un ítem de registry)
- **Base:** retana-ui `CPL@6671cfac72f736739d2d3dd2740cc5f13416acb3`
- **Fuente observada:** página pública de Cargorix (shadcn/studio) y el post del 5 nov 2026. Licencia Pro, no comprada.
- **Clean-room:** solo idea, layout e interacción. No se descargó ni copió código, datos de ejemplo, iconos ni assets del template.

## Qué entró en el PR 1

Núcleo puro en `registry/lib/stock-ledger.ts`: `runningBalances`, `balanceBy`, `validateMovement`, `toTransferPair`, `belowReorder`. La tabla reusa `data-table`, `status-pill`, `stat-strip` y `event-log`. El diálogo reusa `number-field` y cubre ajuste y transferencia en un solo `mode`.

Fuera de este PR: inventory-overview, shipment-tracker, purchase orders, mapa, export y virtualización por encima de 5 000 filas.

## Reglas propuestas (draft, no aplicadas al hub)

### RUI-QTY-001 — Cantidades con signo

Toda cantidad que representa un cambio muestra signo explícito: `+40` / `−12` (U+2212, no el guion ASCII). El cero no lleva signo. El color es refuerzo: el signo se ve, y el tipo de movimiento lleva icono y texto. `tabular-nums` y alineación al final. El nombre accesible dice el signo en palabras: "más 40 unidades", "menos 12 unidades".

### RUI-BAL-001 — Saldo corriente

El saldo se calcula en el núcleo, con orden estable (`at`, luego `id`) y por SKU × almacén. Un filtro visual no recalcula ese saldo. Si el saldo es el del filtro, la columna lo dice ("Saldo del filtro"). Por defecto es "Saldo global". El saldo no lleva signo salvo cuando es negativo, y entonces va con tono critical y el texto "Saldo negativo".

RUI-SHIP-001 queda en espera: no hay shipment-tracker en este PR.
