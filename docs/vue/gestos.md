# Equivalencias Vue para gestos

Nota de la idea 9 de la validación de `/gestures`. No hay código de gestos en este piloto: ninguna de las tres piezas arrastra.

| Paquete | Versión | Licencia | Para qué serviría | Estado |
|---|---|---|---|---|
| `motion-v` | 2.11.1 | MIT | El par de `motion` / `useMotionValue` / `useTransform`. La API de Vue no es la de React. | Activo. Publicado el 2026-11-05. |
| `vaul-vue` | 0.4.1 | MIT | Drawer sin estilo, sobre el Dialog de reka-ui. | El catálogo React ya decidió no usar Vaul. No es el default del port. |
| `@formkit/drag-and-drop` | 0.7.0 | MIT | Reordenar. Exporta `./vue`. Es el equivalente de dnd-kit, no de Vaul. | Activo. Publicado el 2026-11-07. |
| `@vueuse/gesture` | 2.0.0 | MIT | `v-drag`, `v-pinch`, `v-move`. | inactivo. El último release es de febrero de 2024. No es base del port. |

`useMotionValue` y `useTransform` no existen en Vue con esos nombres. Un port futuro usaría `motion-v`. Un drawer usaría `vaul-vue` solo si un ciclo posterior acepta esa dependencia. `@vueuse/gesture` queda fuera por inactivo.
