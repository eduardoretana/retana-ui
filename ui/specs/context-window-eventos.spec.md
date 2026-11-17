---
spec_id: context-window-eventos
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
    note: "Spec de despacho escrita por el builder sobre el código del head db19a518cddc. Los AC se trasladan de docs/learnings/L-BENCHO-context-window.md y de las pruebas del PR; no hay AC nuevos. Pendiente de la revisión del UI Lead antes del despacho."
states: [filled, empty, loading, error, playback, near-limit, compacting, compacted, over-limit, pinned, cache-heavy, "390"]
data_fixture: ui/direction/fixtures/context-window-eventos.yaml
direction:
  mode: visual
  reference_meta: ui/direction/context-window-eventos/reference-meta.yaml
  references:
    - reference_id: REF-cpl-context-window
      screen_id: context-window
      kind: visual
      path: ui/direction/context-window-eventos/ref-cpl-context-window.md
      sha256: f46f12c59a0a2dcd0c3f80337af102ade82217c421f4778967c4da19c658e4f2
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
---

# Ventana de contexto: eventos, umbral y costo

Perfil STANDARD: la pieza ya existe, pero el ciclo agrega flujos nuevos (compactación, fijar con rollback, grilla con teclado). El UI Lead puede subirlo; no bajarlo (SKILL §2).

Autoría: el builder escribió esta Spec para el despacho, con los AC que ya miden las pruebas del PR. El dueño de la Spec es el UI Lead (SKILL §4): la revisa y la confirma en el sobre. No hay firma de Eduardo ni excepción D2 en este archivo.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: filled, empty, loading, error, playback, near-limit, compacting, compacted, over-limit, pinned, cache-heavy, 390

Escenas de `app/examples/context-window/scenes.tsx` en el head (incluye `390`).

## Criterios de aceptación

Trasladados de las pruebas del PR (`__tests__/context-window-*.test.ts*`, `__tests__/agents-context.test.tsx`) y de `docs/learnings/L-BENCHO-context-window.md`. Cada AC nombra la prueba que lo mide. No se agregan comportamientos que el código no tenga.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | Un evento `load` carga la fuente una vez; un duplicado idéntico se ignora y una segunda carga del mismo id es una actualización. | Tokens totales sin duplicar; la segunda carga reemplaza el conteo. | `__tests__/context-window-model.test.ts` «loads a source once and ignores an identical duplicate» y «treats a second load of the same id as an update» |
| AC-2 | Los eventos que llegan antes de su fuente se descartan sin lanzar. | Sin excepción; el estado no cambia. | «drops events that arrive before their source and does not throw» |
| AC-3 | Compactar reemplaza la charla por un resumen, ignora un segundo compactar y nunca compacta una fuente fijada. | Total baja una vez; las fuentes fijadas conservan sus tokens aunque todas estén fijadas. | «replaces chat with a summary and ignores a second compact» y «does not compact a pinned source, even if every source is pinned» (escenas `compacting`, `compacted`, `pinned`) |
| AC-4 | Los conteos inválidos se acotan y fijar o quitar son idempotentes; un stream barajado no duplica tokens. | Conteos negativos o no finitos → 0; repetir pin o evict no cambia el estado; el total final es igual con orden barajado. | «clamps bad token counts and keeps pin and evict idempotent» y «plays a shuffled stream without duplicating tokens» (escena `playback`) |
| AC-5 | El umbral se expresa en porcentaje o en tokens y solo se reporta el cruce hacia arriba. | Un cruce descendente no dispara el aviso. | «expresses a line in percent or tokens and only reports an upward cross» (escenas `near-limit`, `over-limit`) |
| AC-6 | El límite sale de `resolveLimit` si el anfitrión lo inyecta y si no de `modelLimit`. | Prioridad del resolver sobre `modelLimit`. | «prefers an injected resolver and falls back to modelLimit» |
| AC-7 | El costo estimado cobra entrada y lecturas de caché por millón, en USD o MXN con `Intl`. | Montos esperados en las dos monedas. | «prices input and cache reads per million in USD and MXN» (escena `cache-heavy`) |
| AC-8 | La barra de ticks reparte el cupo por fuente sin pasarse del presupuesto, con fuentes de cero y muy grandes. | Suma de ticks ≤ presupuesto; una fuente en cero no recibe ticks. | «fits the budget, including zero and very large sources» |
| AC-9 | La grilla se mueve con teclado, abre con Enter y un pin fallido hace rollback. | Foco itinerante por flechas; Enter abre el detalle; si el callback falla, el pin vuelve al estado previo. | `__tests__/context-window-ui.test.tsx` «moves with the keyboard, opens on enter, and rolls a pin back» |
| AC-10 | El nuevo total y el cruce de umbral se anuncian y la card sigue un stream de eventos. | Región `aria-live` con el total y el aviso; el estado visible sigue los eventos. | «announces a new total and a crossed threshold» y «follows a stream of events» |
| AC-11 | El consumidor del taller cuenta sus fuentes y abre una desde el teclado. | Conteo de fuentes del taller; Enter abre la fuente. | `__tests__/agents-context.test.tsx` «counts the workshop sources and opens one from the keyboard» |
| AC-12 | Las escenas PLP existen y el registry se regenera sin diff. | Escenas playback, filled, empty, loading, error, near-limit, compacting, compacted, over-limit, pinned, cache-heavy y 390 en `scenes.tsx`; `pnpm registry:build` sin diff. | `pnpm registry:build` y las rutas `?scene=<estado>` |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/context-window-eventos/reference-meta.yaml`; mapa de desviaciones en `ui/direction/context-window-eventos/direction-map.md`; fixture E14 en `ui/direction/fixtures/context-window-eventos.yaml`.

- `REF-cpl-context-window` (visual): `ui/direction/context-window-eventos/ref-cpl-context-window.md`
- Inspiración, no referencia: Bencho find «Context window» (@shedsgns). Licencia: sin código ni licencia publicada; el MIT de bencho.dev cubre bloques gratis con panel de código, no finds. Clean-room; no se copió código, datos, iconos ni assets (ver `docs/learnings/L-BENCHO-context-window.md`). La URL está en el aprendizaje citado.

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron imágenes de Dirección. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: la ventana de contexto sigue eventos, avisa al cruzar el umbral, compacta cuando el anfitrión lo decide y estima el costo.
- Benefit: el operador ve qué ocupa el contexto y qué cuesta sin que la pieza importe `model-router` ni `cost-waterfall`.
- Sources: CPL `33438d12`; idea del find de Bencho (sin licencia, clean-room); snapshot ui-system `419ad648`.
- Scope: `registry/ui/context-window*.tsx`, `registry/lib/context-window*.ts`, `app/examples/context-window/**`, el consumidor del taller y sus pruebas.
- Checks: AC-1…AC-12; `pnpm test`, `pnpm typecheck:strict-host`, `pnpm registry:build` sin diff y `pnpm build`.
- Stop when: los AC pasan en el head y el status queda en `AUDITORIA`. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin pieza nueva, sin tema, sin importar `model-router` ni `cost-waterfall`, sin tarifas reales.
