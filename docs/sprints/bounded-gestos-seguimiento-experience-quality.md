# bounded-gestos-seguimiento · evidencia de Experience Quality (retana-ui PR #84)

Artefacto del carril `docs/sprints/bounded-gestos-seguimiento.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `slide-to-confirm`, `view-timeline`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (390, dismissed, dragging, empty, error, filled, keyboard, loading, reduced).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/84/`. `MANIFEST.sha256` sha256 `ae634183e432530729238d9ef81f213c668a6e720ec63745d3e347c0df041c30`; `sha256sum -c` pasa. La evidencia se generó en `f572f34b4fca79d38c0bf811dd4aee737cf533d3`; entre ese commit y el head del PR solo cambian `ui/**` y `docs/sprints/**`. Último log del gate predispatch 1.2.5 (head anterior, mismo árbol de código): `gate-1.2.5-22671b13.log`.

- Estados declarados en la Spec (`ui/specs/gestos-seguimiento.spec.md`): filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 176 capturas, 22 rutas; viewport 390 = 88, escritorio = 88; claro = 88, oscuro = 88; reduced-motion activado = 88, sin reducir = 88; HTTP distinto de 200 = 0; 0 page errors.
- Suite (`suite/pnpm-test.log`): 708 pruebas en 240 archivos, 0 fallidas, exit 0. `pnpm typecheck:strict-host` exit 0. `pnpm registry:build` sin diff. `next build` exit 0.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): AC-4. Sus pruebas están en la suite verde de arriba.
- 390px: AC que lo miden: AC-4; además las 88 capturas a 390.
- Reduced-motion: AC que lo miden: AC-2, AC-3, AC-4; además las 88 capturas con `prefers-reduced-motion: reduce`.
- es-MX / EN: AC con medida en inglés: ninguno en la tabla de AC. Las capturas son en es-MX (idioma por defecto); no hay capturas en EN.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI. Hoy hay cobertura parcial por AC (arriba), no enumeración exhaustiva.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados de la Spec: filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start` de arriba; automated audit, manual browser y production field data pendientes de cierre.
