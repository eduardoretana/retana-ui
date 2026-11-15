---
spec_id: gestos-hold-hits
version: 0.1.1
profile: STANDARD
gesture_rules: context_only
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [4, 8]
spec_changelog:
  - version: 0.1.0
    origin: lead
    note: "Spec inicial."
  - version: 0.1.1
    origin: lead
    note: "Pedido del UI Lead (DSP-retana-ui-85-r1): Profile, States y tabla de AC en el cuerpo; dirección por referencia. Los AC se trasladan literal del plan; no hay AC nuevos."
states: [filled, empty, loading, error, dragging, dismissed, reduced, keyboard, "390"]
data_fixture: ui/direction/fixtures/gestos-hold-hits.yaml
direction:
  mode: visual
  reference_meta: ui/direction/gestos-hold-hits/reference-meta.yaml
  references:
    - reference_id: REF-cpl-hold-to-confirm
      screen_id: hold-to-confirm
      kind: visual
      path: ui/direction/gestos-hold-hits/ref-cpl-hold-to-confirm.md
      sha256: 45b56c0c49deaca194b86e2bfcd30e797d0b1caa64f416d92b7922d9d67d078d
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-cpl-bottom-sheet
      screen_id: bottom-sheet
      kind: visual
      path: ui/direction/gestos-hold-hits/ref-cpl-bottom-sheet.md
      sha256: 52d49641340d4275284edf1875908cebf0b4c67871f1f2aabba0ea8b4050153e
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-emil-gestures
      screen_id: all
      kind: code
      path: ui/direction/gestos-hold-hits/ref-emil-gestures.md
      sha256: 2dbd2982e0c81a6ba19dfc21838f49f315f7681c85170519fdbb3e6922b26466
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
---

# Hold, hits y retorno de detent

Perfil STANDARD, fijado por el UI Lead para el despacho. No se generaron variantes de Dirección en este commit.

## Reglas

`RUI-GESTURE` (hub #326) queda `context_only`. No está mergeado. El criterio de bloqueo es el snapshot `419ad648` (ui-system 4.0.0).

El plan está en `docs/plans/2026-11-09-gestos-hold-hits.md`. Los AC están en la tabla de abajo.

## Perfil y estados

- **Profile**: STANDARD
- **States**: filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390

Estados tomados de AC-4 del plan (las cuatro escenas obligatorias de PLP son filled, empty, loading y error).

## Criterios de aceptación

Trasladados literal de `docs/plans/2026-11-09-gestos-hold-hits.md` (sha256 `5d1d54e46b973d0a40675fa4224336bac1e5dac3ff11234aacae1fd5c870562a` en `cd46531b8ab39f9a40c31c8dbd6f6b8b2c3eb619`). No hay AC nuevos.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | Al soltar el hold antes del final, `animate` de `progress` hacia 0 usa `duration` 0.16 y `ease` de salida, y no es `type: "spring"`. | Opciones del `animate`: `duration` 0.16, `ease` de salida, sin `type: "spring"`. | `__tests__/hold-gesture.test.tsx` |
| AC-2 | Grabber, cerrar, hold y asa declaran un `::before` de al menos 2.75 rem en el eje corto, y el hover del grabber y del hold vive en `(hover: hover) and (pointer: fine)`. | `::before` ≥ 2.75 rem en el eje corto; hover dentro de `(hover: hover) and (pointer: fine)`. | Pruebas de hold, bottom-sheet y slide |
| AC-3 | La hoja no tiene `will-change` fijo. Un arrastre que vuelve al mismo detent anima con `visualDuration` 0.2 y `bounce` 0. | Sin `will-change` fijo; spring de retorno con `visualDuration` 0.2 y `bounce` 0. | `__tests__/sheet-gesture.test.tsx` |
| AC-4 | `hold-to-confirm` y `bottom-sheet` optan a PLP con las cuatro escenas obligatorias más `dragging`, `dismissed`, `reduced`, `keyboard` y `390`. | Escenas presentes en `scenes.tsx` de las dos piezas. | Rutas `?scene=<estado>` de los ejemplos y `pnpm registry:build` |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/gestos-hold-hits/reference-meta.yaml`; mapa de desviaciones en `ui/direction/gestos-hold-hits/direction-map.md`; fixture E14 en `ui/direction/fixtures/gestos-hold-hits.yaml`.

- `REF-cpl-hold-to-confirm` (visual): `ui/direction/gestos-hold-hits/ref-cpl-hold-to-confirm.md`
- `REF-cpl-bottom-sheet` (visual): `ui/direction/gestos-hold-hits/ref-cpl-bottom-sheet.md`
- `REF-emil-gestures` (code): `ui/direction/gestos-hold-hits/ref-emil-gestures.md`

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron variantes: el ciclo cambia comportamiento y escenas. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: cancelar el hold es rápido, los blancos táctiles cubren 44 px y el regreso al mismo detent no tarda 0.4 s.
- Benefit: el control no discute en cámara lenta y se puede tocar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`, `rules/a11y.md`.
- Scope: `hold-to-confirm`, `bottom-sheet`, la clase del asa, ejemplos y pruebas.
- Checks: AC-1…AC-4 y `anim_perf_lint` sin flags.
- Stop when: suite y build en verde. Status en AUDITORIA. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin cambiar el fill linear. Sin editar `spring.smooth`. Sin reabrir el track de la hoja. Las escenas del asa viven en el PR de seguimiento.
