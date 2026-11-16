---
spec_id: gestos-seguimiento
version: 0.1.1
profile: STANDARD
gesture_rules: context_only
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [3, 8]
spec_changelog:
  - version: 0.1.0
    origin: lead
    note: "Spec inicial."
  - version: 0.1.1
    origin: lead
    note: "Pedido del UI Lead (DSP-retana-ui-84-r1): Profile, States y tabla de AC en el cuerpo; dirección por referencia. Los AC se trasladan literal del plan; no hay AC nuevos."
states: [filled, empty, loading, error, dragging, dismissed, reduced, keyboard, "390"]
data_fixture: ui/direction/fixtures/gestos-seguimiento.yaml
direction:
  mode: visual
  reference_meta: ui/direction/gestos-seguimiento/reference-meta.yaml
  references:
    - reference_id: REF-cpl-slide-to-confirm
      screen_id: slide-to-confirm
      kind: visual
      path: ui/direction/gestos-seguimiento/ref-cpl-slide-to-confirm.md
      sha256: e8585091b8a4daacd5799c7eca49ea13a0dfb9337f8404dcc1d96d41b6a566d8
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-cpl-view-timeline
      screen_id: view-timeline
      kind: visual
      path: ui/direction/gestos-seguimiento/ref-cpl-view-timeline.md
      sha256: dd9d44e0977fea8a2bb71bd665792cc11fce3b90ae87fa358e4fb8bd4107f94f
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-emil-gestures
      screen_id: all
      kind: code
      path: ui/direction/gestos-seguimiento/ref-emil-gestures.md
      sha256: 2dbd2982e0c81a6ba19dfc21838f49f315f7681c85170519fdbb3e6922b26466
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
---

# Seguimiento 1:1

Perfil STANDARD, fijado por el UI Lead para el despacho. El asa y la barra ya existían. No se generaron variantes de Dirección en este commit.

## Reglas

`RUI-GESTURE` (hub #326) queda `context_only`. No está mergeado. El criterio de bloqueo es el snapshot `419ad648` (ui-system 4.0.0).

El plan está en `docs/plans/2026-11-09-gestos-seguimiento.md`. Los AC están en la tabla de abajo.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390

Estados tomados de AC-4 del plan.

## Criterios de aceptación

Trasladados literal de `docs/plans/2026-11-09-gestos-seguimiento.md` (sha256 `c6875ab08f023d84113d7720a2bdb30e12e9b9433d4c466f10f5296a31e1e060` en `f572f34b4fca79d38c0bf811dd4aee737cf533d3`). No hay AC nuevos.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | En el turno del `pointermove`, el transform del asa es la posición del puntero dentro de la pista, y el Profiler no suma commits. `animate` no se llama durante el move. | Transform = posición del puntero; delta de commits = 0; sin llamadas a `animate` en el move. | `__tests__/slide-gesture.test.tsx` |
| AC-2 | El release pasa `velocity` al spring. Con reduced motion el move sigue 1:1 y el release no llama `animate`. | Opciones del spring con `velocity`; con reduced motion, transform 1:1 y 0 llamadas a `animate`. | `__tests__/slide-gesture.test.tsx` |
| AC-3 | `view-timeline`: un `pointermove` de 30 px deja `translate3d(30px, 0, 0)` y no llama `onMove`. `pointerup` confirma y limpia el transform. También con reduced motion. La barra tiene `touch-pan-y`. | `translate3d(30px, 0, 0)` en el move; `onMove` solo en `pointerup`; transform limpio; `touch-pan-y`. | `__tests__/timeline-gesture.test.tsx` |
| AC-4 | Las dos piezas optan a PLP con `filled`, `empty`, `loading`, `error`, `dragging`, `dismissed`, `reduced`, `keyboard` y `390`. | Escenas presentes en `scenes.tsx` de las dos piezas. | Rutas `?scene=<estado>` de los ejemplos y `pnpm registry:build` |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/gestos-seguimiento/reference-meta.yaml`; mapa de desviaciones en `ui/direction/gestos-seguimiento/direction-map.md`; fixture E14 en `ui/direction/fixtures/gestos-seguimiento.yaml`.

- `REF-cpl-slide-to-confirm` (visual): `ui/direction/gestos-seguimiento/ref-cpl-slide-to-confirm.md`
- `REF-cpl-view-timeline` (visual): `ui/direction/gestos-seguimiento/ref-cpl-view-timeline.md`
- `REF-emil-gestures` (code): `ui/direction/gestos-seguimiento/ref-emil-gestures.md`

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron variantes: el ciclo cambia comportamiento y escenas. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: el asa y la barra coinciden con el dedo mientras está abajo.
- Benefit: el control deja de ir detrás y la barra deja de saltar al soltar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`.
- Scope: `slide-to-confirm`, `view-timeline`, ejemplos y pruebas.
- Checks: AC-1…AC-4 y `anim_perf_lint` sin flags.
- Stop when: la suite y el build están en verde. Status en AUDITORIA. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin Vaul, sin flick en la barra, sin el hit de 44 px del asa (va en el PR de hold).
