# bounded-retana-ui-motion-14 · evidencia de Experience Quality (retana-ui PR #62)

Artefacto del carril `docs/sprints/bounded-retana-ui-motion-14.md`. Registra solo evidencia que ya existe para este PR. Lo que no se ha medido queda como pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: piezas y bloques del registry retana-ui que importan `motion/react` o `framer-motion`, en sus rutas `/examples/<pieza>`, más `/catalog`.

## Evidencia existente

Carpeta fuera del repo: `/workspace/pr62-lite/` con `MANIFEST.sha256`. Suite (pruebas, lint, `typecheck:strict-host`, build) y renders del arnés 21db9481b331 sobre `next start` del head del PR, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.

- El diff de código solo cambia `package.json` y `pnpm-lock.yaml`. Ningún componente, token ni copy cambia.
- Reduced-motion: se verifica en las capturas con `prefers-reduced-motion: reduce`.
- 390px: capturas a 390 de cada superficie.

## Campos de cierre

Se llenan al cierre con evidencia medida. Hoy no hay medición para ellos y no se inventa.

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: pendiente de cierre; dueño Retana UI.
- **Accessibility automated evidence**: pendiente de cierre; dueño Retana UI.
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: estados existentes de cada demo en CPL, más reduced-motion. Matriz completa pendiente de cierre.
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: pendiente de cierre; dueño Retana UI.
- **Performance evidence**: pendiente de cierre; dueño Retana UI.
- **Optimistic UI exclusions**: pendiente de cierre; dueño Retana UI.
- **Loading state evidence**: pendiente de cierre; dueño Retana UI.
- **Cache/prefetch evidence**: pendiente de cierre; dueño Retana UI.
- **Experience proof surfaces**: code/tests = suite del head; served frontend = renders de `next start`; automated audit, manual browser y production field data pendientes de cierre.
