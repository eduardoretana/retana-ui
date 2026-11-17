# Build log · gestos-avisos-toasts

## needs

- `notification-stack` ahora depende de `motion`. El release es un spring con `velocity`. Los umbrales viven en props: `dismissDistance` 88, `dismissVelocity` 640, `rubberLimit` 96.
- `toast-stack` descarta en +Y, el eje de la entrada (`y.jump(target.y + target.height)`). `dismissRatio` 0.4 y `cancelVelocity` 200 se quedan como defaults de esta pieza.
- La acción del toast entra con `opacity` y `scale`. Ya no anima `width`.
- Excepción citada, no es un `rule-exception` de `RUI-ANIM-PERF`: el Toaster de `components/ui/sonner.tsx` recibe `swipeDirections={[]}`. Sonner 2.0.8 no se puede retomar a mitad del `@keyframes swipe-out-*` (`onPointerUp` regresa si `swipeOut` ya es verdadero y `deleteToast` desmonta a los 200 ms). Medido en `sonner@2.0.8/dist/index.mjs`. El gesto queda en `toast-stack`. No hay fork.
- IDEA (5) se queda en LITE. No es un flujo nuevo.

## spec_defect

Ninguno.

## candidates_detected

Ninguno. No se añade pieza.

## commands

```
node anim_perf_lint.mjs <repo> --files registry/ui/notification-stack.tsx,registry/ui/toast-stack.tsx,components/ui/sonner.tsx,app/examples/notification-stack/scenes.tsx,app/examples/toast-stack/scenes.tsx --json
```

Salida (herramienta 0.1.0 del snapshot `419ad648`, TypeScript del repo):

```json
{
  "tool": "anim-perf-lint",
  "version": "0.1.0",
  "status": "pass",
  "checked": 5,
  "failed": 0,
  "results": []
}
```

Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT). `review-animations`, `animation-performance` y `break-ui` no están en este workspace. Se aplicaron `RUI-ANIM-PERF-001…007` del snapshot.
