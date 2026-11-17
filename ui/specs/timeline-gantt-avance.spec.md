---
spec_id: timeline-gantt-avance
version: 1.0.0
profile: STANDARD
ui_system: 4.0.0
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
retana_ui:
  sha: 33438d12520bbf9fe18ebc87f29df2a3122d02b6
  registry_source: git-sha
spec_changelog:
  - version: 1.0.0
    origin: builder
    note: "Spec de despacho escrita por el builder sobre el código del head a28a5a7c36b7. Los AC se trasladan de docs/learnings/L-SHADCNSTUDIO-gantt-chart-04.md y de las pruebas del PR; no hay AC nuevos. Pendiente de la revisión del UI Lead antes del despacho."
states: [filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, "390"]
data_fixture: ui/direction/fixtures/timeline-gantt-avance.yaml
direction:
  mode: visual
  reference_meta: ui/direction/timeline-gantt-avance/reference-meta.yaml
  references:
    - reference_id: REF-cpl-timeline-gantt
      screen_id: timeline-gantt
      kind: visual
      path: ui/direction/timeline-gantt-avance/ref-cpl-timeline-gantt.md
      sha256: 598fca934dad805bd729cdf0534a6d29a060f8405c5dc2831ddd8477f0fb444c
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
---

# Cronograma: avance, resumen de fase y panel de edición

Perfil STANDARD: la pieza ya existe, pero el ciclo agrega un flujo nuevo (panel de edición) y estados nuevos. El UI Lead puede subirlo; no bajarlo (SKILL §2).

Autoría: el builder escribió esta Spec para el despacho, con los AC que ya miden las pruebas del PR. El dueño de la Spec es el UI Lead (SKILL §4): la revisa y la confirma en el sobre. No hay firma de Eduardo ni excepción D2 en este archivo.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, 390

Escenas de `app/examples/timeline-gantt/scenes.tsx` en el head, más el viewport 390.

## Criterios de aceptación

Trasladados de las pruebas del PR (`__tests__/timeline-gantt*.test.ts*`) y del aprendizaje `docs/learnings/L-SHADCNSTUDIO-gantt-chart-04.md`. Cada AC nombra la prueba que lo mide. No se agregan comportamientos que el código no tenga.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | `progress` acepta una fracción y la acota a 0–1; un valor no finito cuenta como ausente, no como cero. | `parseGanttProgress` acota fuera de rango y no avisa dentro; NaN e Infinity devuelven ausente. | `__tests__/timeline-gantt-progress.test.ts` «parseGanttProgress» |
| AC-2 | Sin las props nuevas la barra de estado queda igual que en CPL. | Barra sólida de estado; sin progressbar, sin resumen de fase y sin panel. | `__tests__/timeline-gantt.test.tsx` «keeps the solid status bar and skips progress, rollup, and the sheet» (escena `plain`) |
| AC-3 | Con `progress`, la barra expone un progressbar con valor y el estado sigue en el nombre accesible. | `role="progressbar"` con `aria-valuenow` acotado en `extremes`; el estado (riesgo, bloqueo) sigue en el nombre y en el DOM. | «exposes a progressbar, clamps extremes, and ignores NaN» y «keeps the status in the name and in the DOM when progress is set» |
| AC-4 | El resumen de fase pondera por duración inclusiva y un grupo sin avance conocido no muestra un cero falso. | `workstreamProgress` pondera por días inclusivos; un hito no mueve el ratio; grupo vacío o sin avance devuelve null y la fila no pinta 0%. | «workstreamProgress» y «rolls a group up by duration and leaves an empty group without a fake zero» |
| AC-5 | La columna izquierda guarda nombre y porcentaje: se lee entera en tarjeta ancha y se trunca con `title` en 390. | Nombre largo truncado junto al porcentaje con `title` completo; la etiqueta crece en tarjeta ancha y tiene piso en teléfono. | «truncates a long name beside the percent» y «widens the label on a wide card and keeps a floor on a phone» (escenas `long` y `390`) |
| AC-6 | La escala ocupa el ancho de la tarjeta y hace scroll si la tarjeta es más angosta. | Días estirados al contenedor; scroll horizontal cuando el contenedor es menor que la escala natural. | «stretches the scale to the container and scrolls when the container is narrower» |
| AC-7 | Las dependencias son codos detrás de las barras y la tarea enfocada se resalta. | `dependencyElbow` pasa por el borde de fila; las líneas quedan detrás de las barras y se resaltan con foco o hover. | «routes through the row boundary instead of a curve» y «draws dependencies as elbows behind the bars and highlights the focused task» |
| AC-8 | Con reduced motion el relleno no anima la escala. | Sin animación de `scaleX` en el relleno con `prefers-reduced-motion: reduce`. | «skips the fill scale when motion is reduced» |
| AC-9 | El panel de edición abre en el nombre, rechaza un fin antes del inicio, devuelve el foco con Escape y emite un patch. | Foco inicial en el campo nombre; error con fin < inicio; Escape cierra y devuelve el foco; `onTaskChangeRequest` recibe el patch y el anfitrión lo guarda. | «opens on the name field, rejects an end before the start, and returns focus on Escape» y «emits a patch and lets the host store it» (escena `editor`) |
| AC-10 | Relleno contra pista y relleno contra superficie llegan a 3:1 en claro y oscuro con los tokens documentados. | Contraste ≥ 3:1 en los dos pares y los dos temas. | `__tests__/timeline-gantt-progress.test.ts` «progress contrast» |
| AC-11 | La página de estrés hidrata el HTML del servidor sin error de hooks (React error 311). | `hydrateRoot` sobre `renderToString` sin errores de hooks ni de cola. | `__tests__/timeline-gantt-stress.test.tsx` «GANTT-STRESS-HYDRATE» (escena `many`) |
| AC-12 | Las escenas PLP existen y el registry se regenera sin diff. | Escenas filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many y editor en `scenes.tsx`; `pnpm registry:build` sin diff. | `pnpm registry:build` y las rutas `?scene=<estado>` |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/timeline-gantt-avance/reference-meta.yaml`; mapa de desviaciones en `ui/direction/timeline-gantt-avance/direction-map.md`; fixture E14 en `ui/direction/fixtures/timeline-gantt-avance.yaml`.

- `REF-cpl-timeline-gantt` (visual): `ui/direction/timeline-gantt-avance/ref-cpl-timeline-gantt.md`
- Inspiración, no referencia: Shadcn Studio Gantt Chart 04. Licencia: bloque Pro, sin licencia abierta. Solo idea, acomodo e interacción; implementación clean-room; no se copió código, texto, iconos ni assets (ver `docs/learnings/L-SHADCNSTUDIO-gantt-chart-04.md`). La URL está en el aprendizaje citado.

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron imágenes de Dirección. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: el cronograma muestra el avance sin esconder el estado ni cortar los nombres cuando hay sitio, y permite editar una tarea desde un panel.
- Benefit: riesgo y bloqueo se leen sin depender del color y el resumen de fase no inventa ceros.
- Sources: CPL `33438d12`; idea de Shadcn Studio Gantt Chart 04 (Pro, clean-room); snapshot ui-system `419ad648`.
- Scope: `registry/ui/timeline-gantt.tsx`, `registry/lib/timeline-gantt.ts`, `app/examples/timeline-gantt/**`, `public/r/timeline-gantt.json` y sus pruebas.
- Checks: AC-1…AC-12; `pnpm test`, `pnpm typecheck:strict-host`, `pnpm registry:build` sin diff y `pnpm build`.
- Stop when: los AC pasan en el head y el status queda en `AUDITORIA`. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin copiar el bloque Pro, sin arrastrar barras, sin cambiar la API existente sin `progress`, sin datos reales.
