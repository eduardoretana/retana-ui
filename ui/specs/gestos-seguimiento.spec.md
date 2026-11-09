---
spec_id: gestos-seguimiento
version: 0.1.0
profile: STANDARD
gesture_rules: context_only
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [3, 8]
---

# Seguimiento 1:1

Perfil STANDARD, fijado por el UI Lead para el despacho. El asa y la barra ya existían. No se generaron variantes de Dirección en este commit.

## Reglas

`RUI-GESTURE` (hub #326) queda `context_only`. No está mergeado. El criterio de bloqueo es el snapshot `419ad648` (ui-system 4.0.0).

El plan y los AC están en `docs/plans/2026-11-09-gestos-seguimiento.md`.

## Brief

- Outcome: el asa y la barra coinciden con el dedo mientras está abajo.
- Benefit: el control deja de ir detrás y la barra deja de saltar al soltar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`.
- Scope: `slide-to-confirm`, `view-timeline`, ejemplos y pruebas.
- Checks: AC-1…AC-4 y `anim_perf_lint` sin flags.
- Stop when: la suite y el build están en verde. Status en AUDITORIA. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin Vaul, sin flick en la barra, sin el hit de 44 px del asa (va en el PR de hold).
