# bounded-agenda-resources · evidencia de Experience Quality (retana-ui PR #67)

Artefacto del carril `docs/sprints/bounded-agenda-resources.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `agenda`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (conflicts, empty, error, filled, loading, many, over, resources).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/67/`. `MANIFEST.sha256` sha256 `0eb35ebd9008a835993214289afb4ffa7530399eb733b99d8839d3d6fff0586f`; `sha256sum -c` pasa. La evidencia se generó en `8ef2bbbc26d1f702e929373a5b70124414c2b475`; entre ese commit y el head del PR solo cambian `ui/**` y `docs/sprints/**`. Último log del gate predispatch 1.2.5 (head anterior, mismo árbol de código): `gate-1.2.5-ccd2a541.log`.

- Estados declarados en la Spec (`ui/specs/agenda-resources.spec.md`): filled, empty, loading, error, resources, conflicts, over, many.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 80 capturas, 10 rutas; viewport 390 = 40, escritorio = 40; claro = 40, oscuro = 40; reduced-motion activado = 40, sin reducir = 40; HTTP distinto de 200 = 0; 0 page errors.
- Suite (`suite/pnpm-test.log`): 715 pruebas en 239 archivos, 0 fallidas, exit 0. `pnpm typecheck:strict-host` exit 0. `pnpm registry:build` sin diff. `next build` exit 0.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): AC-4. Sus pruebas están en la suite verde de arriba.
- 390px: AC que lo miden: AC-3; además las 40 capturas a 390.
- Reduced-motion: AC que lo miden: ninguno en la tabla de AC; además las 40 capturas con `prefers-reduced-motion: reduce`.
- es-MX / EN: AC con medida en inglés: AC-7. Las capturas son en es-MX (idioma por defecto); no hay capturas en EN.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI. Hoy hay cobertura parcial por AC (arriba), no enumeración exhaustiva.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados de la Spec: filled, empty, loading, error, resources, conflicts, over, many. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start` de arriba; automated audit, manual browser y production field data pendientes de cierre.
