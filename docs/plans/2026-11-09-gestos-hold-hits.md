# Hold, hits y retorno de detent

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soltar el hold antes de tiempo vuelve en 0.16 s con ease-out. Los blancos de grabber, cerrar, hold y asa llegan a 44 px sin crecer el dibujo. El hover solo existe con puntero fino. La hoja no lleva `will-change` fijo y el regreso al mismo detent es más corto que 0.4 s, sin rebote.

**Architecture:** El rewind del hold usa `motionPresets.duration.fast` y `motionPresets.ease.exit`. El hit es un `::before` absoluto. El retorno al mismo detent escribe un spring en la llamada, `visualDuration` 0.2 y `bounce` 0, sin editar el preset compartido. Perfil LITE.

**Tech Stack:** React 19, Motion 13.5.0, Vitest, ui-system 4.0.0.

## Global Constraints

- `retana_ui.sha`: `6671cfac72f736739d2d3dd2740cc5f13416acb3`.
- `ui_system.version`: `4.0.0`. Perfil LITE.
- PR borrador contra CPL. Sin Vaul. Sin #72 ni #76.
- AA sigue en 24 px (`rules/a11y.md`). 44 px es la recomendación táctil, con `::before`.
- Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT).

## IDEA

IDEA (4) y las escenas (8) de `hold-to-confirm` y `bottom-sheet`. El asa de `slide-to-confirm` solo recibe el hit. Sus escenas de gesto están en el PR de seguimiento, para no duplicar el opt-in de PLP.

## Acceptance

- **AC-1.** Al soltar el hold antes del final, `animate` de `progress` hacia 0 usa `duration` 0.16 y `ease` de salida, y no es `type: "spring"`. Test: `__tests__/hold-gesture.test.tsx`.
- **AC-2.** Grabber, cerrar, hold y asa declaran un `::before` de al menos 2.75 rem en el eje corto, y el hover del grabber y del hold vive en `(hover: hover) and (pointer: fine)`. Test: hold, bottom-sheet y slide.
- **AC-3.** La hoja no tiene `will-change` fijo. Un arrastre que vuelve al mismo detent anima con `visualDuration` 0.2 y `bounce` 0. Test: `__tests__/sheet-gesture.test.tsx`.
- **AC-4.** `hold-to-confirm` y `bottom-sheet` optan a PLP con las cuatro escenas obligatorias más `dragging`, `dismissed`, `reduced`, `keyboard` y `390`.

## Non-goals

No se cambia el fill linear del hold. No se edita el preset `spring.smooth`. No se reabre el track de la hoja, que ya es 1:1.

## Tasks

- [ ] Pruebas en rojo.
- [ ] Rewind, hits, hover, will-change y snap de detent.
- [ ] Escenas, lint de animación, suite y build.

## Brief

- Outcome: cancelar es rápido, los blancos táctiles cubren 44 px y la hoja no promociona una capa de más.
- Benefit: el hold no discute en cámara lenta y el grabber se puede tocar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`, `rules/a11y.md`.
- Scope: `hold-to-confirm`, `bottom-sheet`, la clase del asa, ejemplos y pruebas.
- Checks: AC-1…AC-4 y `anim_perf_lint` sin flags.
- Stop when: suite y build en verde. Status `AUDITORIA`. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.
