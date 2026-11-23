# bounded-color-picker-formatos · evidencia de Experience Quality (retana-ui, rama feat/color-picker-formatos-popover)

Artefacto del carril `docs/sprints/bounded-color-picker-formatos.md`. Registra solo evidencia que ya existe. Lo que no se ha medido queda pendiente con dueño; no se declara cerrado.

- **Experience Quality Gate**: APPLIES
- **Experience surface**: pieza del registry retana-ui `color-picker`; rutas `/examples/color-picker`, `/examples/color-picker/stress` y escenas `?scene=` (filled, empty, loading, error, invalid, no-eyedropper, full, popover).

## Evidencia existente

Carpeta (fuera del repo): `/workspace/color-picker-2026-11-23/`. La evidencia se generó en el tip de código `6f215631b6fcc822e5c6460f899b5f85aabb575e` (árbol `777f7718af0f43361b3101c6d80ba7c7b38d045a`); los commits posteriores solo tocan `ui/**` y `docs/sprints/**`.

- Estados declarados en la Spec: filled, empty, loading, error, invalid, no-eyedropper, full, popover, keyboard, reduced, 390.
- Rojo primero: `8e6ba0a6` con `ui-tests/expected-red.yaml` (spec_id `color-picker-formatos`): 18 fallan y 1 pasa sobre CPL `bf1682d4`.
- Suite (`suite/`, run_id `color-picker-suite-6f215631-20261123T101313`): `pnpm test` 733 pruebas en 241 archivos, 0 fallidas; `pnpm lint` exit 0 (7 avisos previos, ninguno en archivos del carril); `pnpm typecheck:strict-host` exit 0; `pnpm registry:build` exit 0 sin diff; `pnpm build` exit 0.
- Renders (arnés 21db9481b331, `next start`): `capturas/antes` 16 (CPL), `capturas/despues` 72 (9 rutas × 390/escritorio × claro/oscuro × reduced sí/no), `capturas/despues-interaccion` 28 (7 flujos × 390/escritorio × claro/oscuro).
- Accesibilidad: axe-core 4.13 (wcag2a, wcag2aa, wcag21aa, wcag22aa) en las 28 capturas interactivas: 0 violaciones. AC con medida de a11y: AC-3, AC-4, AC-6, AC-7, AC-10.
- 390px: 0 capturas interactivas con overflow horizontal; estrés a 320 px con 0/1/5/50 guardados, RTL y popover.
- Reduced-motion: 36 capturas con `prefers-reduced-motion: reduce`; el popover quita zoom y slide y deja el fade; el icono de copiar queda solo con opacidad.
- es-MX / EN: etiquetas `colorPickerLabelsEs` y `colorPickerLabelsEn`; AC-5 y «CP-FORMAT-ES» las miden; el SceneDeck cambia de idioma.

## Campos de cierre

- **Accessibility target**: WCAG 2.2 AA
- **Accessibility coverage**: escenas interactivas (popover abierto, cuentagotas sin API, copiado, guardados llenos, reordenar por teclado, pegado inválido, cambio de formato); revisión manual del lector de pantalla pendiente de cierre, dueño Retana UI.
- **Accessibility automated evidence**: `capturas/despues-interaccion-records.json` (axe y overflow por captura).
- **Accessibility manual evidence**: pendiente de cierre; la revisión visual la hace el UI Auditor despachado por el UI Lead.
- **Interaction state matrix**: los 11 estados de la Spec con su escena, prueba o captura (ver Spec AC-1…AC-10).
- **Response budget**: pendiente de cierre; dueño Retana UI.
- **Performance budgets**: `onValueCommit` una vez por gesto (AC-8); sin setState extra por frame más allá del valor controlado (`RUI-ANIM-PERF-007`). Medición en navegador pendiente de cierre.
- **Performance evidence**: `anim_perf_lint` pass (5 archivos, 0 hallazgos).
- **Optimistic UI exclusions**: no aplica; la pieza no hace red.
- **Loading state evidence**: escena `loading` (guardados en carga, 900 ms simulados).
- **Cache/prefetch evidence**: no aplica.
- **Experience proof surfaces**: code/tests = suite de arriba; served frontend = renders de `next start`; automated audit = axe en capturas interactivas; manual browser y production field data pendientes de cierre.
