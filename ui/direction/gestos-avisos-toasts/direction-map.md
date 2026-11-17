# direction-map — gestos-avisos-toasts · spec 0.1.1

Base de código: H = el commit que añade este archivo sobre `bcd4c44d81d8287dde8cf291d7c364ee74d8ea83` (el código no cambia en ese commit).
Referencias: `REF-cpl-notification-stack`, `REF-cpl-toast-stack`, `REF-emil-gestures`, `REF-sonner-2-0-8`. Fichas y sha256 en `ui/direction/gestos-avisos-toasts/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de la tabla «Criterios de aceptación» de `ui/specs/gestos-avisos-toasts.spec.md` (sha256 con prefijo `c9dc41e08b31`; el sha256 completo va en el sobre, para que fixture_lint no lo lea como teléfono).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648` (blob f16049b5).

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Composición de la pila | REF-cpl-notification-stack | tarjeta de enfrente, dos detrás, contador `+N`, puntos y «Ver todos» | igual | no | `spec:Non-goals` (sin reescribir la pieza); `rule:UIS-COMP-OCP-001` |
| R2 Arrastre de la tarjeta | REF-cpl-notification-stack | el arrastre escribe estado de React en cada move | transform directo en un motion value; sin `setState` por move | sí, comportamiento | `AC-1`; `rule:RUI-ANIM-PERF-005` |
| R3 Salida | REF-cpl-notification-stack | `@keyframes retana-notice-leave`, no se puede retomar | spring con la velocidad del release; se retoma a mitad de la salida | sí, comportamiento | `AC-2`; `AC-3`; `AC-5`; `rule:RUI-ANIM-PERF-007` |
| R4 Dirección contraria y paneo | REF-cpl-notification-stack | sin goma; sin `touch-action` declarado | goma asintótica (tope 96 px) y `touch-pan-y` | sí | `AC-6`; `AC-7` |
| R5 Reduced motion | REF-cpl-notification-stack | sin rama propia | el dedo sigue 1:1 y el release salta sin spring | sí | `AC-4`; `wcag:2.3.3` |
| R1 Composición del toast | REF-cpl-toast-stack | toast con título, descripción y acción | igual; la acción entra con `opacity` y `scale` | sí, solo animación | `AC-8`; `rule:RUI-ANIM-PERF-002` (sin `width: "auto"` animado) |
| R2 Eje del descarte | REF-cpl-toast-stack | entra por Y y se descarta en X | se descarta en +Y, el eje de la entrada; X no descarta; `touch-pan-x` | sí, comportamiento | `AC-8` |
| R3 Toaster del layout | REF-cpl-toast-stack | swipe de Sonner que no se puede retomar | `swipeDirections={[]}`; el gesto vive en `toast-stack` | sí | `AC-9`; medición en `REF-sonner-2-0-8` |
| R4 Escenas PLP | REF-cpl-toast-stack | sin `scenes.tsx` | filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390 (y al-cargar, extreme) | sí, se agregan | `AC-10` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta + sha256 en las fichas).
