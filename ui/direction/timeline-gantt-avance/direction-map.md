# direction-map — timeline-gantt-avance · spec 1.0.0

Base de código: el commit que añade este archivo sobre `a28a5a7c36b7c0701db6f3e12c4701adf20d9b49` (el código no cambia en ese commit).
Referencias: `REF-cpl-timeline-gantt`. Fichas y sha256 en `ui/direction/timeline-gantt-avance/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC` citados son los de la tabla «Criterios de aceptación» de `ui/specs/timeline-gantt-avance.spec.md` (sha256 con prefijo `cc518614379d`; el sha256 completo va en el sobre).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648`.

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Barra de tarea | REF-cpl-timeline-gantt | botón de color de estado, sin avance | con `progress`: pista `bg-muted`, borde `border-foreground`, relleno `bg-foreground` con `scaleX`; sin `progress`, igual que CPL | sí, opt-in | `AC-2`; `AC-3`; `rule:RUI-ANIM-PERF-001` |
| R2 Riesgo y bloqueo | REF-cpl-timeline-gantt | estado solo por color de la barra | triángulo (riesgo) y círculo (bloqueo) en `destructive` a la derecha de la barra; el estado sigue en el nombre accesible | sí | `AC-3`; `AC-10`; `wcag:1.4.1`; `wcag:1.4.11` |
| R3 Columna izquierda | REF-cpl-timeline-gantt | nombre de la tarea | nombre y porcentaje; truncado con `title` en 390 | sí | `AC-5` |
| R4 Resumen de fase | REF-cpl-timeline-gantt | fila de grupo sin avance | avance ponderado por duración; sin cero falso | sí, se agrega | `AC-4` |
| R5 Escala y dependencias | REF-cpl-timeline-gantt | escala de ancho natural; dependencias curvas | escala estirada al contenedor; dependencias en codo detrás de las barras | sí | `AC-6`; `AC-7` |
| R6 Panel de edición | REF-cpl-timeline-gantt | no existe | panel con foco inicial, validación de fechas y patch al anfitrión | sí, se agrega | `AC-9`; `wcag:2.4.3`; `rule:UIS-COMP-DIP-001` |
| R7 Página de estrés | REF-cpl-timeline-gantt | en producción la página fallaba con React error 311 | `useReducedMotion` se llama sin condición; hidrata | sí, corrección | `AC-11` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta y sha256 en las fichas).
