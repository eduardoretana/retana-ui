# Gestos de avisos y toasts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La pila de avisos sigue el dedo con un transform directo, sale con un spring que recibe la velocidad y se puede retomar; el toast del catálogo se descarta en el mismo eje por el que entra y deja de animar `width`; el Toaster de Sonner del layout no conserva un swipe que no se puede atrapar.

**Architecture:** Cada pieza guarda su umbral en props, con el default que ya tenía o uno razonado en el comentario de la prop. No hay una constante de catálogo de 500 px/s ni de 40–50 %. El seguimiento escribe un motion value. La salida es `animate` de Motion con `velocity`. Sonner 2.0.8 no se forkea: su swipe de layout se apaga y el gesto vive en `toast-stack`.

**Tech Stack:** React 19, Motion 13.5.0, Sonner 2.0.8 (solo medición), Vitest, ui-system 4.0.0 del snapshot `419ad648`.

## Global Constraints

- Base `retana_ui.sha`: `6671cfac72f736739d2d3dd2740cc5f13416acb3` (CPL).
- `ui_system.version`: `4.0.0`. Perfil **LITE**. La IDEA (5) no se trata como flujo nuevo: el aviso sigue apareciendo y la persona lo descarta; solo se corrige el eje. No baja de perfil si alguien lo reclasifica.
- PRs borrador contra CPL. Sin merge, sin deploy, sin producción.
- Sin Vaul. Sin tocar los PR #72 y #76.
- Los números de Emil (dragElastic 0.2, 500 px/s, 40–50 %) no son constantes del catálogo.
- Sin `@keyframes` en lo que el dedo puede retomar.
- Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT).
- `review-animations`, `animation-performance` y `break-ui` no están en este workspace. Se aplican las reglas `RUI-ANIM-PERF-001…007` del snapshot.
- Registry sin tema: clases semánticas, sin hex ni paleta.

## IDEA

IDEAs (2), (5), (7) y las escenas (8) de las piezas de este PR. Aprobación de Eduardo: «Aprueba las IDEAs de gestos en retana-ui».

### Hecho medido de Sonner 2.0.8

En `sonner@2.0.8/dist/index.mjs` (jsDelivr, 69795 bytes):

- La salida es `@keyframes swipe-out-left|right|up|down`. Mientras corren, `animation` posee `transform`.
- `onPointerUp` regresa de inmediato si `swipeOut` ya es verdadero. `onPointerDown` no apaga `swipeOut`.
- `deleteToast` desmonta a los 200 ms aunque el dedo vuelva.
- Escribir `--swipe-amount-x` o `--swipe-amount-y` durante `data-swipe-out=true` no retoma la tarjeta.

Conclusión: el swipe no se puede retomar a mitad de la animación. No se forkea Sonner. El Toaster de `app/layout.tsx` recibe `swipeDirections={[]}` y el gesto de descarte queda en `toast-stack`.

### Eje del toast (LITE)

El toast entra en Y: `y.jump(target.y + target.height)` y luego sube hasta `target.y`. El descarte pasa a +Y (vuelve por donde entró). El eje X deja de descartar. `touch-pan-x` deja el paneo horizontal al navegador.

### Umbrales de este PR

| Pieza | Prop | Default | Por qué |
|---|---|---|---|
| notification-stack | `dismissDistance` | 88 px | Distancia que la pieza ya usaba. Cabe en dos blancos de 44 px y no exige cruzar media tarjeta. |
| notification-stack | `dismissVelocity` | 640 px/s | 64 px en 100 ms. Más claro que un arrastre lento, distinto del flick de detent (320) y del de fila (900). |
| notification-stack | `rubberLimit` | 96 px | Tope de la goma asintótica en la dirección contraria. La misma forma que `toast-stack`. |
| toast-stack | `dismissRatio` | 0.4 | Fracción de la altura que la pieza ya usaba sobre el ancho. La proyección de velocidad sigue contando. |
| toast-stack | `cancelVelocity` | 200 px/s | Guarda que la pieza ya usaba: un release hacia arriba más rápido que esto no descarta. |

## Acceptance

- **AC-1.** En cada `pointermove` de la tarjeta de enfrente, el transform del eje X cambia en ese turno y el Profiler no suma commits. Measure: delta de commits = 0 en 3 moves; `translateX` igual al dedo en +X. Test: `__tests__/notification-gesture.test.tsx` «no vuelve a renderizar en cada move».
- **AC-2.** El release que descarta llama `animate` con `type: "spring"` y `velocity` distinta de 0. El archivo no declara `@keyframes retana-notice-leave`. Measure: opciones del `animate` y lectura del fuente. Test: el mismo archivo, «pasa la velocidad al spring» y «no declara keyframes de salida».
- **AC-3.** 40 px a 800 px/s descartan. 40 px a 100 px/s no. Measure: `onDismiss`. Test: «descarta por velocidad» y «un arrastre corto y lento no descarta».
- **AC-4.** Con `prefers-reduced-motion: reduce`, 30 px de puntero dejan 30 px de transform y el release no llama `animate`. Measure: transform y llamadas. Test: «con reduced motion el dedo sigue y no hay spring».
- **AC-5.** Un segundo `pointerdown` durante la salida deja la misma tarjeta y el transform sigue al dedo. `onDismiss` no se ha llamado. Test: «se retoma a mitad de la salida».
- **AC-6.** 40 px hacia la izquierda mueven la tarjeta más de 0 y menos de 40 px. Test: «la dirección contraria tiene goma».
- **AC-7.** La tarjeta arrastrable tiene `touch-pan-y`. Test: «declara touch-pan-y».
- **AC-8.** Un swipe vertical pasado el ratio descarta el toast. Un swipe horizontal de la misma magnitud no. El fuente no anima `width: "auto"`. Test: `__tests__/toast-gesture.test.tsx`.
- **AC-9.** El Toaster del layout, tras dos `pointermove` horizontales, deja `--swipe-amount-x` en `0px`. Test: `__tests__/sonner-swipe.test.tsx`.
- **AC-10.** `notification-stack` y `toast-stack` optan a PLP con `filled`, `empty`, `loading`, `error`, `dragging`, `dismissed`, `reduced`, más `390` y `keyboard`. `pnpm registry:build` sigue en verde.

## Non-goals

- No se unifican 320, 640, 900 ni 200 a 500.
- No se reescribe la altura animada del stack de toasts en este ciclo. El hallazgo pedido es `width: "auto"`.
- No se audita este PR desde el mismo agente.
- No se edita el Hub.

## Tasks

- [ ] Escribir las pruebas de AC-1…AC-9 y verlas fallar con la firma de `ui-tests/expected-red.yaml`.
- [ ] Pasar `notification-stack` a motion value, goma, velocidad, `touch-pan-y` y reduced con seguimiento.
- [ ] Alinear el descarte de `toast-stack` a Y y quitar `width: "auto"`.
- [ ] Apagar el swipe del Toaster de layout y citar la medición.
- [ ] Añadir escenas y fixtures. Correr `anim_perf_lint` sobre los archivos tocados.
- [ ] `pnpm test`, `lint`, `typecheck:strict-host`, `registry:build`, `build`.

## Brief

- Outcome: las dos pilas del catálogo se sienten como el dedo y el toast del sitio no ofrece un swipe que no se puede atrapar.
- Benefit: un flick corto descarta, un arrastre lento no, y la salida se puede retomar.
- Sources: validación sobre CPL `6671cfac`, skill `/gestures` pin `715c180`, snapshot ui-system `419ad648`.
- Scope: `registry/ui/notification-stack.tsx`, `registry/ui/toast-stack.tsx`, `components/ui/sonner.tsx`, ejemplos, pruebas, `registry.json`.
- Checks: AC-1…AC-10 y `anim_perf_lint` sin flags nuevos en esos archivos.
- Stop when: la suite, el lint, el typecheck estricto y el build están en verde y el status queda en `AUDITORIA`.
- Deliverable: PR borrador contra CPL.
