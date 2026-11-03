# build-log · agenda-resources

## needs

- `resources`, `resourceId` y `capacityHours` son props. No hay un segundo componente de calendario.
- El aviso de choque no tiene regla en el ui-system leído (guía 4.0.0). Propuesta en `docs/learnings/RUI-CONFLICT-001.md`. No se editó el hub.
- Dirección visual: no se generaron variantes. El bloque de referencia es Pro y no se abre. La pieza hereda el tema. `direction: inherited`.

## spec_defect

Ninguno abierto. El caso del día completo que empieza en la frontera del siguiente día sí choca con ese día siguiente; el primer borrador de la prueba pedía lo contrario y se corrigió antes de dar la función por buena. La regla «fin == inicio no es choque» se mantiene entre la feria y el evento que empieza exactamente cuando la feria termina.

## candidates_detected

Ninguno. Es extensión de `agenda` / `agenda-core` / `agenda-event`.

## commands

Corridos el 2026-11-03 en esta rama, sobre el árbol de trabajo:

- `pnpm exec vitest run __tests__/agenda-resources.test.tsx __tests__/agenda.test.tsx` — verde, incluida la regresión sin `resources`.
- `pnpm test` — 232 archivos, 674 pruebas, verde.
- `pnpm exec eslint` sobre los archivos tocados — sin avisos.
- `pnpm exec tsc --noEmit --pretty false` — verde.
- `pnpm typecheck:strict-host` — verde. `agenda`, `agenda-event`, `agenda-detail` y `date-range` entran en ese chequeo.
- `pnpm readme:catalog` — el catálogo sigue en 422 piezas.
- `pnpm build` (`registry:build` y `next build`) — verde.

No hay Playwright en el repo. La revisión visual va por el navegador, con capturas a 1280 y 390, claro y oscuro.
