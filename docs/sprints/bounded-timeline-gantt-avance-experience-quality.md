# bounded-timeline-gantt-avance · evidencia de Experience Quality (retana-ui PR #69)

Artefacto del carril `docs/sprints/bounded-timeline-gantt-avance.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `timeline-gantt`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (complete, editor, empty, error, extremes, filled, loading, long, many, oneday, plain, progress).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/69/`. `MANIFEST.sha256` sha256 `473101ee9dfdf78925d3a731f86d8d96f078db40951de2642668541c9dccc390`; `sha256sum -c` pasa. La evidencia se generó en `a265c46507b7b21f1e8e63368681b19bb4bdb8d9`; entre ese commit y el head del PR solo cambian `ui/**` y `docs/sprints/**`. Último log del gate predispatch 1.2.5 (head anterior, mismo árbol de código): `gate-1.2.5-3843e777.log`.

- Estados declarados en la Spec (`ui/specs/timeline-gantt-avance.spec.md`): filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, 390.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 112 capturas, 14 rutas; viewport 390 = 56, escritorio = 56; claro = 56, oscuro = 56; reduced-motion activado = 56, sin reducir = 56; HTTP distinto de 200 = 0; 0 page errors.
- Suite (`suite/pnpm-test.log`): 727 pruebas en 241 archivos, 0 fallidas, exit 0. `pnpm typecheck:strict-host` exit 0. `pnpm registry:build` sin diff. `next build` exit 0.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): AC-3, AC-7, AC-9. Sus pruebas están en la suite verde de arriba.
- 390px: AC que lo miden: AC-5, AC-6; además las 56 capturas a 390.
- Reduced-motion: AC que lo miden: AC-8; además las 56 capturas con `prefers-reduced-motion: reduce`.
- es-MX / EN: AC con medida en inglés: ninguno en la tabla de AC. Las capturas son en es-MX (idioma por defecto); no hay capturas en EN.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI. Hoy hay cobertura parcial por AC (arriba), no enumeración exhaustiva.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados de la Spec: filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, 390. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start` de arriba; automated audit, manual browser y production field data pendientes de cierre.
