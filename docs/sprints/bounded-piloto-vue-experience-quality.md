# bounded-piloto-vue · evidencia de Experience Quality (retana-ui PR #86)

Artefacto del carril `docs/sprints/bounded-piloto-vue.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `decision-inbox`, `lightbox`, `time-off-stats`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (answered, empty, error, filled, folded, loading, pending, zero).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/86/`. La evidencia se regeneró sobre el commit que trae este archivo, porque ese commit también cambia `vue/src/lightbox/Lightbox.vue` (pasada ui-ux-pro-max). Los conteos exactos, el `MANIFEST.sha256` y el log del gate predispatch 1.2.5 de ese head están en la carpeta; la evidencia anterior quedó en `_obsoleta/`.

- Estados declarados en la Spec (`ui/specs/piloto-vue.spec.md`): filled, empty, loading, error, zero, pending, answered, folded, 390.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 390 y escritorio, claro y oscuro, reduced-motion activado y no, sobre las rutas de las tres piezas. El cambio de Vue no toca las rutas de Next.
- Suite (`suite/pnpm-test.log`), `pnpm typecheck:strict-host`, `pnpm registry:build` y `next build`: regenerados en la carpeta para este head.
- Suite Vue aparte: `suite/vue-test.log`, 8 pruebas en 3 archivos con la nueva `vue/tests/lightbox-aria.test.ts` (antes 7); incluye axe serious/critical en claro, oscuro, es-MX, EN y 390 según AC8.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): AC2, AC3, AC4, AC5, AC6, AC8, AC10. Sus pruebas están en la suite verde de arriba.
- 390px: AC que lo miden: AC8; además las 88 capturas a 390.
- Reduced-motion: AC que lo miden: AC8; además las 88 capturas con `prefers-reduced-motion: reduce`.
- es-MX / EN: AC con medida en inglés: AC8. Las capturas son en es-MX (idioma por defecto); no hay capturas en EN.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI. Hoy hay cobertura parcial por AC (arriba), no enumeración exhaustiva.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados de la Spec: filled, empty, loading, error, zero, pending, answered, folded, 390. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start` de arriba; automated audit, manual browser y production field data pendientes de cierre.
