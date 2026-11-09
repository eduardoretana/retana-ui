---
spec_id: gestos-avisos-toasts
version: 0.1.0
profile: STANDARD
gesture_rules: context_only
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [2, 5, 7, 8]
---

# Gestos de avisos y toasts

Perfil STANDARD, fijado por el UI Lead para el despacho. La IDEA (5) corrige el eje de un descarte que ya existe. No se generaron variantes de Dirección en este commit.

## Reglas

`RUI-GESTURE` (hub #326) queda `context_only`. No está mergeado. El criterio de bloqueo es el snapshot `419ad648` (ui-system 4.0.0).

El plan con las tareas y los umbrales está en `docs/plans/2026-11-09-gestos-avisos-toasts.md`. Los AC-1…AC-10 de ese plan son los de esta spec. Cada uno tiene medida y prueba.

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
