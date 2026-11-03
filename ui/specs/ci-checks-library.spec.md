---
spec_id: ci-checks-library
version: 0.1.0
profile: STANDARD
origin: brief
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: local-clone
spec_changelog:
  - version: 0.1.0
    note: Contrato inicial de la familia agents/ci. Clean-room.
---

# Spec — Comprobaciones de CI (piezas de biblioteca)

## Fuente y licencia

Idea tomada de "Generative UI #6 - CI checks" de Phil Pitus (@pitus_), publicación https://x.com/pitus_/status/2117270206464631028 (2 nov 2026). El post no trae repositorio, código ni licencia. Categoría: **idea only, sin licencia**. Este trabajo implementa la interacción (chip que se abre, panel de checks, línea de tiempo de un arreglo, fusión) con código, copy y composición propios. No se copian el layout, los textos, los SHA, los assets ni el grafo de commits del video.

Datos de demostración: taller ficticio "Taller Ladrillo". Nada es un repositorio real.

## Brief

1. **Outcome.** Una persona ve, en piezas controladas por props, cómo nace un pull request, cómo avanzan sus checks, cómo se anota un arreglo y cuándo se puede fusionar.
2. **Benefit.** El host reutiliza las piezas sin fetch, sin token y sin tema propio. El estado se lee por icono y texto, también con el movimiento reducido y a 390 px.
3. **Sources.** El brief de este encargo, el video y los frames (solo como dirección de interacción), `registry.json` en el SHA de arriba, `CONTRIBUTING.md` y la guía operativa ui-system 4.0.0.
4. **Scope.** `registry/ui/pr-create-card.tsx`, `registry/ui/checks-panel.tsx`, `registry/ui/agent-fix-timeline.tsx`, `registry/ui/merge-button.tsx`, `registry/blocks/ci-checks-story.tsx`, sus ejemplos PLP, el estrés y las pruebas de esas piezas. No incluye la llamada a GitHub (eso es el spec `ci-checks-live`).
5. **Checks.** AC-1 a AC-12, más `pnpm test` de esta familia, `pnpm exec tsc --noEmit` y `pnpm registry:build`.
6. **Stop when.** Las cinco piezas están en el catálogo con escenas PLP, el escenario completo se recorre con teclado, y no queda color literal ni `transition-all` en `registry/` de esta familia.
7. **Deliverable.** Pull request en borrador contra `CPL`, docs en español, código en inglés.

## Usuarios

- Quien integra el catálogo en un host que ya tiene tema shadcn.
- Quien revisa el catálogo en `/examples/*`, en español (es-MX) o en inglés, con teclado y, a veces, con `prefers-reduced-motion`.

## Alcance de componentes

| Pieza | Catálogo previo | Decisión |
|---|---|---|
| Chip que crece a tarjeta | `expandable-card` abre contenido genérico, no un PR ni un riel de commits | Candidato nuevo `pr-create-card`. Usa `Button` no; el chip es un `button` nativo. `Badge` para ramas y estado. |
| Pastilla de checks | No hay panel de checks. `Progress` del host usa `transition-all` en el indicador | Candidato `checks-panel`. Barra propia con `scaleX` (transform). `Badge` para el conteo. |
| Línea de tiempo | `timeline` y `reasoning-steps` no distinguen diagnóstico, archivos, edición, pruebas y push | Candidato `agent-fix-timeline`. |
| Fusión | `hold-to-confirm` es mantener pulsado. `inline-approve-button` no tiene los cuatro estados de merge ni el rechazo de la rama | Candidato `merge-button`. Usa `Button`. |
| Escenario | Ningún bloque compone esas cuatro piezas | Candidato `ci-checks-story`. |

`retana_ui_layer: OK` en el SHA fijado. No se copia `components/ui` al registry.

## Estados

Superconjunto: idle, pending, success, error, empty, partial, offline, rollback, permission_denied, overflow, i18n_long.

En esta familia offline, rollback y permission_denied no aplican al fetch (no hay fetch). El rechazo de la protección de rama cubre permission_denied en el botón de fusión. Overflow es el texto largo y 50 checks.

## Datos

Los props son la única fuente. La historia de demostración usa el taller ficticio. La pastilla nace cerrada.

## Marca

Heredar el host. Solo clases semánticas (`bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-destructive`, `border-border`, `bg-primary`, `ring`, `shadow-sm`, `rounded-*`). Sin `cssVars`.

## Copy

Inglés por defecto en el código (`*Labels`). es-MX en `*LabelsEs`. El deck de escenas manda el idioma. El estado nunca va solo en el color: icono + palabra.

## Dirección

Dos variantes, eje densidad. Ver `ci-checks-library.direction.md`. Elegida: `rail`.

## Criterios de aceptación

### AC-1
- measure: el chip colapsado expone un botón con `aria-expanded=false` y el nombre accesible incluye las adiciones y las supresiones; al activarlo (clic o Enter) `aria-expanded` pasa a true y aparecen el título del PR y el SHA del commit.
- test: `__tests__/pr-create-card.test.tsx` "expands the diff chip into the pull request" y "toggles the chip from the keyboard".

### AC-2
- measure: `ChecksPanel` sin `open` no muestra la lista. El botón se llama con el conteo `Comprobaciones {passed}/{total}`. Al abrirlo, cada fila tiene icono y texto de estado (`Pasó`, `Falló`, `En curso`, `En cola`, `Omitida`, `Cancelada`), una barra y un tiempo.
- test: `__tests__/checks-panel.test.tsx` "stays closed until the pill is opened" y "shows a word for every status".

### AC-3
- measure: si el host marca `estimated`, el tiempo visible dice "estimado" (es-MX) o "estimated" (EN).
- test: `__tests__/checks-panel.test.tsx` "labels an estimated duration".

### AC-4
- measure: la línea de tiempo muestra, en orden, diagnóstico, archivos, edición, pruebas y push, con el texto del paso. Vacío anuncia que no hay pasos.
- test: `__tests__/agent-fix-timeline.test.tsx`.

### AC-5
- measure: con fase `disabled` el botón de fusión está deshabilitado. Con `ready`, el primer clic no llama `onMerge`; solo "Confirmar fusión en main" lo llama. Con `merged` el texto es "Fusionado en main". Con `rejected` el motivo está en un `alert`.
- test: `__tests__/merge-button.test.tsx`.

### AC-6
- measure: un cambio de estado relevante se escribe en una región `status` con `aria-live=polite` (PR abierto, conteo de checks, fusión).
- test: los tres archivos de prueba anteriores, caso "announces".

### AC-7
- measure: con `prefers-reduced-motion: reduce` la raíz queda en `data-motion=reduced` y no se anima la barra (duración 0).
- test: `__tests__/pr-create-card.test.tsx` y `__tests__/checks-panel.test.tsx`, caso "respects reduced motion".

### AC-8
- measure: un título de 60 caracteres sin espacios y una lista de 50 checks se renderizan dentro de `min-w-0` sin tirar el layout por un overflow visible del botón. El contenedor de checks tiene scroll (`overflow-y-auto`).
- test: `__tests__/checks-panel.test.tsx` "renders fifty checks" y `__tests__/pr-create-card.test.tsx` "keeps a long title in the card". La ruta de estrés cubre 390 px a ojo en la auditoría.

### AC-9
- measure: es-MX y EN salen de los dos diccionarios exportados. El deck pasa uno u otro según el locale.
- test: las pruebas de es-MX arriba; `__tests__/ci-checks-labels.test.ts` comprueba que el diccionario inglés no contiene las cadenas es-MX de estado y al revés.

### AC-10
- measure: `ci-checks-story` recorre vacío → creando → abierto → fallo → arreglo → checks en verde → fusionado, con un botón "Siguiente paso", y termina en "Fusionado en main". El panel de checks sigue cerrado en la fase abierta.
- test: `__tests__/ci-checks-story.test.tsx`.

### AC-11
- measure: ningún archivo de esta familia bajo `registry/` contiene `transition-all`, un hex, `rgb(`, `oklch(` ni una clase de paleta Tailwind.
- test: `__tests__/ci-checks-family-source.test.ts`.

### AC-12
- measure: cada ítem nuevo tiene `meta.scenes` con filled, empty, loading y error; `fixtures.ts` exporta esos nombres; `preview.tsx` usa `ScenePreview`; `demo.tsx` usa `SceneDeck`; la historia añade la escena `flow`.
- test: `pnpm registry:build` (el validador PLP) y la existencia de la escena `flow` en `app/examples/ci-checks-story/scenes.tsx`.

## No objetivos

- Llamar a GitHub, guardar un token o fusionar de verdad.
- Calcar el chat del video, el grafo curvo de commits o los textos de "auth middleware".
- Elegir tema, preset o `shadcn init`.
- Auditar el propio ciclo. El estado de entrega es `AUDITORIA` para otro agente.

## Riesgos

- Animar altura del panel violaría RUI-ANIM-PERF-002. La apertura usa opacidad y `translateY`, y desmonta al cerrar.
- Reusar `Progress` metería `transition-all` del primitivo en la barra. Se documenta la desviación en el token-map: barra propia.
- La pastilla abierta por defecto aumentaría la carga cognitiva que ya criticaron en el post. Nace cerrada.
