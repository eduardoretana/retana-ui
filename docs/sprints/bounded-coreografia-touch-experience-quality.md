# bounded-coreografia-touch · evidencia de Experience Quality (retana-ui PR #68)

Artefacto del carril `docs/sprints/bounded-coreografia-touch.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas del registry retana-ui `comment-thread`, `dashboard-analitico-ae`, `hero-section`, `multi-view`, `notification-stack`, `shortcut-recorder`, `slide-to-confirm`, `stagger-reveal`, `user-menu`, `view-calendar`, `view-kanban`, `view-timeline`; rutas `/examples/<pieza>`, `/examples/<pieza>/stress` y escenas `?scene=` (sin scenes.tsx: página de ejemplo y página de estrés).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/retana-ui-entregas/pr-sweep/68/`. `MANIFEST.sha256` sha256 `e73948c0564c062eed79e073793f954a840523deb4aa926e778cae14ce26c263`; `sha256sum -c` pasa. La evidencia se generó en `276e9f662f10a392feeb02cb065ee1d21baecfca`; entre ese commit y el head del PR solo cambian `ui/**` y `docs/sprints/**`. Último log del gate predispatch 1.2.5 (head anterior, mismo árbol de código): `gate-1.2.5-d38bc3e1.log`.

- Estados declarados en la Spec (`ui/specs/coreografia-touch.spec.md`): filled, stress, reduced, touch-tap, touch-scroll, long-press, 390.
- Renders (`renders.yaml`, arnés 21db9481b331, `next build && next start`): 192 capturas, 24 rutas; viewport 390 = 96, escritorio = 96; claro = 96, oscuro = 96; reduced-motion activado = 96, sin reducir = 96; HTTP distinto de 200 = 0; 32 page errors: /examples/multi-view (8), /examples/multi-view/stress (8), /examples/view-kanban (8), /examples/view-kanban/stress (8). Todos React #418, preexistentes en CPL 33438d12 con los mismos conteos por ruta (`NOTA-PREEXISTENTE.md`, controles `cpl-control-sweep2` y `cpl-control-stress`).
- Suite (`suite/pnpm-test.log`): 721 pruebas en 240 archivos, 0 fallidas, exit 0. `pnpm typecheck:strict-host` exit 0. `pnpm registry:build` sin diff. `next build` exit 0.
- Accesibilidad: AC de la Spec con medida de a11y (nombre accesible, foco, teclado, axe o roles): ninguno en la tabla de AC.
- 390px: AC que lo miden: ninguno en la tabla de AC; además las 96 capturas a 390.
- Reduced-motion: AC que lo miden: AC-4; además las 96 capturas con `prefers-reduced-motion: reduce`.
- es-MX / EN: AC con medida en inglés: ninguno en la tabla de AC. Las capturas son en es-MX (idioma por defecto); no hay capturas en EN.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI. Hoy hay cobertura parcial por AC (arriba), no enumeración exhaustiva.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados de la Spec: filled, stress, reduced, touch-tap, touch-scroll, long-press, 390. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start` de arriba; automated audit, manual browser y production field data pendientes de cierre.
