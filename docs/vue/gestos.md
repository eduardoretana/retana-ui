# Equivalencias Vue para gestos

Nota de la idea 9 de la validación de `/gestures`. No hay código de gestos en este piloto: ninguna de las tres piezas arrastra.

| Paquete | Versión | Licencia | Para qué serviría | Estado |
|---|---|---|---|---|
| `motion-v` | 2.11.1 | MIT | El par de `motion` / `useMotionValue` / `useTransform`. La API de Vue no es la de React. | Activo. Publicado el 2026-11-05. |
| `vaul-vue` | 0.4.1 | MIT | Drawer sin estilo, sobre el Dialog de reka-ui. | El catálogo React ya decidió no usar Vaul. No es el default del port. |
| `@formkit/drag-and-drop` | 0.7.0 | MIT | Reordenar. Exporta `./vue`. Es el equivalente de dnd-kit, no de Vaul. | Activo. Publicado el 2026-11-07. |
| `@vueuse/gesture` | 2.0.0 | MIT | `v-drag`, `v-pinch`, `v-move`. | inactivo. El último release es de febrero de 2024. No es base del port. |

`useMotionValue` y `useTransform` no existen en Vue con esos nombres. Un port futuro usaría `motion-v`. Un drawer usaría `vaul-vue` solo si un ciclo posterior acepta esa dependencia. `@vueuse/gesture` queda fuera por inactivo.

## Reglas que un port tendría que conservar

No hay implementación en este piloto. Si más adelante se porta una pieza que se arrastra, el equivalente Vue sigue estas cuatro reglas, las mismas que la validación de `/gestures` dejó para el catálogo React:

1. **Seguimiento 1:1.** Mientras el dedo está abajo, el elemento va con el puntero. Sin easing y sin spring en esa fase.
2. **Spring con velocidad.** Al soltar, el spring se siembra con la velocidad medida. No se usan `@keyframes` en algo que el gesto puede retomar.
3. **Umbrales por pieza.** La distancia o la velocidad de descarte las declara la pieza. No hay un 500 px/s único ni un 40–50 % único para todo el catálogo.
4. **Reduced motion conserva el tracking.** Con `prefers-reduced-motion: reduce` el dedo sigue moviendo el elemento. Se quitan el momentum y el rebote.
