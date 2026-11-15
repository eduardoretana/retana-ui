---
spec_id: gestos-avisos-toasts
version: 0.1.1
profile: STANDARD
gesture_rules: context_only
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [2, 5, 7, 8]
spec_changelog:
  - version: 0.1.0
    origin: lead
    note: "Spec inicial."
  - version: 0.1.1
    origin: lead
    note: "Pedido del UI Lead (DSP-retana-ui-83-r1): Profile, States y tabla de AC en el cuerpo; dirección por referencia. Los AC se trasladan literal del plan; no hay AC nuevos."
states: [filled, empty, loading, error, dragging, dismissed, reduced, keyboard, "390"]
data_fixture: ui/direction/fixtures/gestos-avisos-toasts.yaml
direction:
  mode: visual
  reference_meta: ui/direction/gestos-avisos-toasts/reference-meta.yaml
  references:
    - reference_id: REF-cpl-notification-stack
      screen_id: notification-stack
      kind: visual
      path: ui/direction/gestos-avisos-toasts/ref-cpl-notification-stack.md
      sha256: e1829aa41187a7c3d95d0387421ba0324b7e1ced4fdbf9fa3743562051982368
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-cpl-toast-stack
      screen_id: toast-stack
      kind: visual
      path: ui/direction/gestos-avisos-toasts/ref-cpl-toast-stack.md
      sha256: f93b09d8a239b3659b0d8e7e8db1f2f6c1c648f4b8972244b8a20d5125786663
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-emil-gestures
      screen_id: all
      kind: code
      path: ui/direction/gestos-avisos-toasts/ref-emil-gestures.md
      sha256: 2dbd2982e0c81a6ba19dfc21838f49f315f7681c85170519fdbb3e6922b26466
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
    - reference_id: REF-sonner-2-0-8
      screen_id: all
      kind: code
      path: ui/direction/gestos-avisos-toasts/ref-sonner-2-0-8.md
      sha256: 80639562fe8437ef21f14101d35b9a796c729b51324b78b455951a8ebe9845c9
      chosen_at_spec_version: "0.1.1"
      valid_for_spec_version: "0.1.1"
      status: current
---

# Gestos de avisos y toasts

Perfil STANDARD, fijado por el UI Lead para el despacho. La IDEA (5) corrige el eje de un descarte que ya existe. No se generaron variantes de Dirección en este commit.

## Reglas

`RUI-GESTURE` (hub #326) queda `context_only`. No está mergeado. El criterio de bloqueo es el snapshot `419ad648` (ui-system 4.0.0).

El plan con las tareas y los umbrales está en `docs/plans/2026-11-09-gestos-avisos-toasts.md`. Los AC están en la tabla de abajo.

## Perfil y estados

- **Profile**: STANDARD
- **States**: filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390

Estados tomados de AC-10 del plan.

## Criterios de aceptación

Trasladados literal de `docs/plans/2026-11-09-gestos-avisos-toasts.md` (sha256 `26d0d0ec690bf1af497276920d3a4085f18432ae6563c9e53f519d1a7fe8c4cc` en `bcd4c44d81d8287dde8cf291d7c364ee74d8ea83`). No hay AC nuevos.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | En cada `pointermove` de la tarjeta de enfrente, el transform del eje X cambia en ese turno y el Profiler no suma commits. | Delta de commits = 0 en 3 moves; `translateX` igual al dedo en +X. | `__tests__/notification-gesture.test.tsx` «no vuelve a renderizar en cada move» |
| AC-2 | El release que descarta llama `animate` con `type: "spring"` y `velocity` distinta de 0. El archivo no declara `@keyframes retana-notice-leave`. | Opciones del `animate` y lectura del fuente. | El mismo archivo, «pasa la velocidad al spring» y «no declara keyframes de salida» |
| AC-3 | 40 px a 800 px/s descartan. 40 px a 100 px/s no. | `onDismiss`. | «descarta por velocidad» y «un arrastre corto y lento no descarta» |
| AC-4 | Con `prefers-reduced-motion: reduce`, 30 px de puntero dejan 30 px de transform y el release no llama `animate`. | Transform y llamadas. | «con reduced motion el dedo sigue y no hay spring» |
| AC-5 | Un segundo `pointerdown` durante la salida deja la misma tarjeta y el transform sigue al dedo. `onDismiss` no se ha llamado. | Misma tarjeta, transform igual al dedo, `onDismiss` sin llamar. | «se retoma a mitad de la salida» |
| AC-6 | 40 px hacia la izquierda mueven la tarjeta más de 0 y menos de 40 px. | Desplazamiento entre 0 y 40 px. | «la dirección contraria tiene goma» |
| AC-7 | La tarjeta arrastrable tiene `touch-pan-y`. | Clase `touch-pan-y` en la tarjeta. | «declara touch-pan-y» |
| AC-8 | Un swipe vertical pasado el ratio descarta el toast. Un swipe horizontal de la misma magnitud no. El fuente no anima `width: "auto"`. | Descarte en +Y; sin descarte en X; sin `width: "auto"` en el fuente. | `__tests__/toast-gesture.test.tsx` |
| AC-9 | El Toaster del layout, tras dos `pointermove` horizontales, deja `--swipe-amount-x` en `0px`. | `--swipe-amount-x` = `0px`. | `__tests__/sonner-swipe.test.tsx` |
| AC-10 | `notification-stack` y `toast-stack` optan a PLP con `filled`, `empty`, `loading`, `error`, `dragging`, `dismissed`, `reduced`, más `390` y `keyboard`. `pnpm registry:build` sigue en verde. | Escenas presentes en `scenes.tsx`; `pnpm registry:build` exit 0. | `pnpm registry:build` y las rutas `?scene=<estado>` de los ejemplos |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/gestos-avisos-toasts/reference-meta.yaml`; mapa de desviaciones en `ui/direction/gestos-avisos-toasts/direction-map.md`; fixture E14 en `ui/direction/fixtures/gestos-avisos-toasts.yaml`.

- `REF-cpl-notification-stack` (visual): `ui/direction/gestos-avisos-toasts/ref-cpl-notification-stack.md`
- `REF-cpl-toast-stack` (visual): `ui/direction/gestos-avisos-toasts/ref-cpl-toast-stack.md`
- `REF-emil-gestures` (code): `ui/direction/gestos-avisos-toasts/ref-emil-gestures.md`
- `REF-sonner-2-0-8` (code): `ui/direction/gestos-avisos-toasts/ref-sonner-2-0-8.md`

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron variantes: el ciclo cambia comportamiento y escenas. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: la pila de avisos sigue el dedo y sale con la velocidad del release; el toast del catálogo se va por el eje de la entrada; el Toaster del layout no ofrece el swipe de Sonner que no se puede retomar.
- Benefit: un flick corto cuenta, un arrastre lento no, y la salida se puede atrapar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180` (MIT), snapshot ui-system `419ad648`.
- Scope: `notification-stack`, `toast-stack`, `components/ui/sonner.tsx`, sus ejemplos y pruebas.
- Checks: AC-1…AC-10 y `anim_perf_lint` sin flags en los archivos tocados.
- Stop when: test, lint, typecheck:strict-host, registry:build y build en verde. Status en AUDITORIA. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin Vaul, sin fork de Sonner, sin los números de Emil como constante del catálogo, sin #72 ni #76, sin reescribir la altura del stack de toasts.
