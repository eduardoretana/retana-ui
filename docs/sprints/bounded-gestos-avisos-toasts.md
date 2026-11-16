# bounded-gestos-avisos-toasts · carril acotado de UI (retana-ui PR #83)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-avisos-toasts-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-avisos-toasts.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-avisos-toasts-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `notification-stack`, `toast-stack` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-gestos-avisos-toasts-experience-quality.md

## Scope

- docs/sprints/bounded-gestos-avisos-toasts.md
- docs/sprints/bounded-gestos-avisos-toasts-experience-quality.md
- ui/specs/gestos-avisos-toasts.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: La pila de avisos y el toast cambian el gesto de salida (seguir el dedo, salir con la velocidad del release) y el Toaster compartido del layout deja el swipe de Sonner. Piezas existentes; no hay pieza ni pantalla nueva. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-avisos-toasts.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #83. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/gestos-avisos-toasts.spec.md`, dirección `ui/direction/gestos-avisos-toasts/`, piezas notification-stack, toast-stack, renders del head en `/workspace/retana-ui-entregas/pr-sweep/83/renders.yaml`.
- **Design context checks**: existing surfaces = notification-stack, toast-stack (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: dismiss a notice or toast with the gesture people already expect, without losing the keyboard and reduced-motion paths.
- **Specialized design source**: design skill emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT), cargada con Skill en esta pasada.
- **Design skill stack trace**: emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); ui-ux-pro-max no se pudo cargar (no instalada en este agente); routing core-only.
- **UI/UX Pro Max classification**: NOT_RUN
- **UI/UX Pro Max evidence**: query=no se corrió, la skill ui-ux-pro-max no está instalada en este agente (Skill por nombre y Skill query sin resultado; ui-system/skills/README.md del hub la lista como del hub, no vendorizada); domain=no se corrió; applied_decision=no se corrió
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=toast-stack dismisses down on the same Y axis it enters on, with velocity projection, dismissRatio 0.4, an upward cancel at 200 px/s, rubber band on upward drag and pointer capture; notification-stack uses velocity-based dismiss with pointer capture; the shared Sonner Toaster turns its swipe off (swipeDirections empty) because Sonner ends a swipe with keyframes that cannot be retaken; craft=checked the Emil checklist on the changed files: no transition-all, no scale(0) entry, no ease-in, no hover motion, no animation on keyboard actions; a second finger takes over from the current offset so it does not jump; motion=springs with bounce 0 (visualDuration 0.32 on dismiss, snappy preset on return); reduced motion jumps to rest instead of animating; the only CSS keyframe left is Sonner's own spinner
- **Design skill applied use**: applied use de emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/83/renders.yaml`: 200 capturas del head bcd4c44d, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: swipe and drag to dismiss with velocity projection, interruption by a new pointerdown, rubber band at the boundary, and a reduced-motion path that jumps instead of moving.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (notification-stack, toast-stack); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=notification-stack, toast-stack; audience=people using a host app that shows short, non-blocking results; objective=dismiss a notice or toast with the gesture people already expect, without losing the keyboard and reduced-motion paths; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=4; VISUAL_DENSITY=4; rationale=lectura del revisor sobre el código: variance 2 because both pieces keep their CPL look and only the dismiss axis changes; motion 4 because motion is gesture-following springs with bounce 0 plus a short fade; density 4 because the stack keeps its CPL spacing
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de notification-stack, toast-stack en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=feedback; experience_quality=APPLIES (evidencia en docs/sprints/bounded-gestos-avisos-toasts-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#83 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-avisos-toasts.ui-status.yaml` en `AUDITORIA`, con el tip de código `bcd4c44d81d8287dde8cf291d7c364ee74d8ea83`
- Dirección por referencia: `ui/direction/gestos-avisos-toasts/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
