# Seguimiento 1:1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mientras el dedo está abajo, el asa de `slide-to-confirm` y la barra de `view-timeline` son el dedo. El spring queda para el release del asa, con la velocidad medida.

**Architecture:** `slide-to-confirm` deja de llamar `animate` dentro de `pointermove`. Escribe el motion value. `view-timeline` escribe `transform` en la barra en cada move y confirma la fecha en `pointerup`, sin spring: la barra cae en la unidad de fecha, que es soltar donde el dedo deja la rejilla. Perfil LITE. No es un flujo nuevo.

**Tech Stack:** React 19, Motion 13.5.0, Vitest, ui-system 4.0.0.

## Global Constraints

- `retana_ui.sha`: `6671cfac72f736739d2d3dd2740cc5f13416acb3`.
- `ui_system.version`: `4.0.0`. Perfil LITE.
- PR borrador contra CPL. Sin Vaul. Sin #72 ni #76.
- `smoothness` ya no alimenta un spring durante el move. En el release sigue pudiendo suavizar el snap.
- `resistance` solo empuja pasado el final de la pista. Dentro del recorrido el asa es 1:1.
- Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT).

## IDEA

IDEA (3) y el hallazgo major de `view-timeline` (la barra no se mueve hasta `pointerup`), más las escenas (8) de las dos piezas. Mismo principio: el elemento que el usuario sujeta no va con spring ni con un salto al soltar mientras el dedo está abajo.

## Acceptance

- **AC-1.** En el turno del `pointermove`, el transform del asa es la posición del puntero dentro de la pista, y el Profiler no suma commits. `animate` no se llama durante el move. Test: `__tests__/slide-gesture.test.tsx`.
- **AC-2.** El release pasa `velocity` al spring. Con reduced motion el move sigue 1:1 y el release no llama `animate`. Test: el mismo archivo.
- **AC-3.** `view-timeline`: un `pointermove` de 30 px deja `translate3d(30px, 0, 0)` y no llama `onMove`. `pointerup` confirma y limpia el transform. También con reduced motion. La barra tiene `touch-pan-y`. Test: `__tests__/timeline-gesture.test.tsx`.
- **AC-4.** Las dos piezas optan a PLP con `filled`, `empty`, `loading`, `error`, `dragging`, `dismissed`, `reduced`, `keyboard` y `390`.

## Non-goals

No se cambia el umbral 0.9 ni el paso de teclado. No se mete un spring de flick en la barra: suelta en la unidad de fecha. El hit de 44 px del asa va en el PR de hold.

## Tasks

- [ ] Pruebas en rojo con firma en `ui-tests/expected-red.yaml`.
- [ ] Arreglo del asa y de la barra.
- [ ] Escenas, `anim_perf_lint`, suite y build.

## Brief

- Outcome: el asa y la barra siguen el dedo en el mismo turno.
- Benefit: el control deja de ir detrás del puntero y la barra deja de saltar al soltar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`.
- Scope: `slide-to-confirm`, `view-timeline`, ejemplos y pruebas.
- Checks: AC-1…AC-4 y lint de animación sin flags.
- Stop when: test, lint, typecheck:strict-host, registry:build y build en verde. Status `AUDITORIA`.
- Deliverable: PR borrador contra CPL.
