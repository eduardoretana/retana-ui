---
spec_id: capacity-map
version: 0.1.0
profile: STANDARD
ui_system: 4.0.0
retana_ui:
  sha: bf1682d4dfb8696ddb01bf84aedda111f47b086c
  registry_source: git-sha
spec_changelog:
  - version: 0.1.0
    origin: builder
    note: "Spec inicial. Encargo de EduardoBot (2026-11-27): validar «Parking Sessions» (Datatable Advanced 08, Pro, clean-room) y adaptarlo como primitiva genérica de mapa de cupos."
states: [filled, empty, loading, error, simulate, overflow, custom, long, "390", highlight, keyboard, reduced]
data_fixture: ui/direction/fixtures/capacity-map.yaml
direction:
  mode: visual
  reference_meta: ui/direction/capacity-map/reference-meta.yaml
  references:
    - reference_id: REF-cpl-map-browser
      screen_id: capacity-map
      kind: visual
      path: ui/direction/capacity-map/ref-cpl-map-browser.md
      sha256: f4fbe1012727e59c43504da34b631b6cefd7eaca0cc09c1829214c202a03efab
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
    - reference_id: REF-shadcnstudio-datatable-advanced-08
      screen_id: all
      kind: code
      path: ui/direction/capacity-map/ref-shadcnstudio-datatable-advanced-08.md
      sha256: 7ce245c4ce4ae54905ef5d26590c29b7698288984fbdd3bff989d5358452fc1f
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
---

# Mapa de cupos (`capacity-map`)

Perfil STANDARD propuesto por el builder: pieza nueva del registry con un patrón espacial que no existe en CPL, resaltado cruzado, teclado y una simulación de demanda. Lo confirma el UI Lead.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: filled, empty, loading, error, simulate, overflow, custom, long, 390, highlight, keyboard, reduced

## Criterios de aceptación

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | Cada zona en acordeón muestra una barra `n de m disponibles`. Los cupos de un grupo se acomodan en dos filas con un separador con nombre. | `zoneStats`, `aisleRows`, árbol. | `__tests__/capacity-map.test.tsx` «capacity-map math»; «shows a capacity bar» |
| AC-2 | Los estados por defecto son libre, ocupado, especial y excedido, y se pueden extender. Los especiales no se rellenan en la previsión salvo `fillable`. | `simulateDemand`, `resolveStatuses`. | «fills fillable slots»; «accepts a custom status» |
| AC-3 | El resaltado es cruzado (tabla ↔ mapa) al pasar o enfocar. El cupo lleva anillo de `ring`, no solo color. La tabla es la fuente accesible. | `data-highlighted`, nombre accesible. | «highlights a slot from the table and the other way around» |
| AC-4 | El detalle del cupo abre en un popover con teclado (Enter) y se cierra con Escape. El nombre accesible junta etiqueta, estado y detalle. | Árbol, teclado. | «opens the slot popover»; «builds an accessible name» |
| AC-5 | La simulación de demanda llena solo cupos `fillable`, avisa cuántos se quedarían fuera y Descartar vuelve a cero sin guardar. | `simulateDemand`, `role=alert`. | «previews extra demand» |
| AC-6 | Estados filled, empty, loading y error. Loading usa `role=status` y `aria-busy`. Error ofrece reintento. | Árbol. | «announces loading, empty and error» |
| AC-7 | Flechas mueven el foco dentro del grupo. A 390 px los grupos se apilan. Con reduced motion no hay transición en chevrones ni en las barras. | Teclado, CSS `motion-reduce`. | «moves between slots»; escena `390px` |
| AC-8 | 500 cupos se montan; un nombre largo queda completo en el nombre accesible. Fixtures sin copia del bloque de pago. | DOM, `banned`. | «renders 500 slots»; «fixtures stay domain-free» |
| AC-9 | Solo tokens del tema, sin hex ni `dark:` de color. `anim_perf_lint` pasa. Registry y PLP en verde. | lint, `registry:build`. | `anim_perf_lint`; `pnpm registry:build` |

## Uso permitido

Operación de cupos genéricos: cubículos, camillas, salas, bodega o asientos. Una sola instancia por vista. El anfitrión aporta los datos y, si quiere persistir una demanda, lo hace fuera de la pieza.

## Non-goals

Sin formulario de reserva, sin pagos, sin exportación (ya está en las tablas), sin botón de aplicar/guardar la simulación, sin extender `map-browser` ni `planning-grid`, sin tocar la rama remota del PR #81. La celda de ventana de tiempo vive en `feat/time-window-cell`.

## Brief

- Outcome: un mapa de cupos por zona enlazado a una tabla, accesible, con previsión de demanda que se descarta.
- Sources: CPL `bf1682d4`; ui-system 4.x (hub `0218369e`; `main` sigue en VERSION 4.0.0); idea clean-room de Datatable Advanced 08.
- Stop when: test, lint, typecheck:strict-host, registry:build, build y anim_perf_lint en verde. Sin push ni PR.
