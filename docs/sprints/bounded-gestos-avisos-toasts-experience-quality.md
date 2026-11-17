# bounded-gestos-avisos-toasts · evidencia de Experience Quality (retana-ui PR #83)

Artefacto del carril `docs/sprints/bounded-gestos-avisos-toasts.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `notification-stack`, `toast-stack`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (390, al-cargar, dismissed, dragging, empty, error, extreme, filled, keyboard, loading, reduced).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/83/`. `MANIFEST.sha256` sha256 `b62428f1305019aae3cfdcfbe858ddf384dcf3c0d3cf462080ef6441fec1f521`; `sha256sum -c` pasa. La evidencia se generó en `bcd4c44d81d8287dde8cf291d7c364ee74d8ea83`; entre ese commit y el head del PR solo cambian `ui/**` y `docs/sprints/**`. Último log del gate predispatch 1.2.5 (head anterior, mismo árbol de código): `gate-1.2.5-f7d0b1c2.log`.

- Estados declarados en la Spec (`ui/specs/gestos-avisos-toasts.spec.md`): filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 200 capturas, 25 rutas; viewport 390 = 100, escritorio = 100; claro = 100, oscuro = 100; reduced-motion activado = 100, sin reducir = 100; HTTP distinto de 200 = 0; 0 page errors.
- Suite (`suite/pnpm-test.log`): 715 pruebas en 242 archivos, 0 fallidas, exit 0. `pnpm typecheck:strict-host` exit 0. `pnpm registry:build` sin diff. `next build` exit 0.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): AC-6, AC-10. Sus pruebas están en la suite verde de arriba.
- 390px: AC que lo miden: AC-10; además las 100 capturas a 390.
- Reduced-motion: AC que lo miden: AC-4, AC-10; además las 100 capturas con `prefers-reduced-motion: reduce`.
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
