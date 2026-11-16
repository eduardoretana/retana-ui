# bounded-gestos-seguimiento · carril acotado de UI (retana-ui PR #84)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-seguimiento-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-seguimiento.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-seguimiento-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `slide-to-confirm`, `view-timeline` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-gestos-seguimiento-experience-quality.md

## Scope

- docs/sprints/bounded-gestos-seguimiento.md
- docs/sprints/bounded-gestos-seguimiento-experience-quality.md
- ui/specs/gestos-seguimiento.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: El asa de slide-to-confirm y la barra de view-timeline siguen el dedo 1:1 durante el arrastre; mismos controles, nuevas escenas de estado. Piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-seguimiento.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: NO
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #84. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/gestos-seguimiento.spec.md`, dirección `ui/direction/gestos-seguimiento/`, piezas slide-to-confirm, view-timeline, renders del head en `/workspace/retana-ui-entregas/pr-sweep/84/renders.yaml`.
- **Design context checks**: existing surfaces = slide-to-confirm, view-timeline (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: confirm with a slide that follows the finger, and move timeline bars by drag, with keyboard and reduced-motion parity.
- **Specialized design source**: design skill emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT), cargada con Skill en esta pasada.
- **Design skill stack trace**: emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); ui-ux-pro-max no se pudo cargar (no instalada en este agente); routing core-only.
- **UI/UX Pro Max classification**: NOT_RUN
- **UI/UX Pro Max evidence**: query=no se corrió, la skill ui-ux-pro-max no está instalada en este agente (Skill por nombre y Skill query sin resultado; ui-system/skills/README.md del hub la lista como del hub, no vendorizada); domain=no se corrió; applied_decision=no se corrió
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=slide-to-confirm captures the pointer, samples velocity, uses a soft follow and an elastic end of track, and confirms past threshold 0.9; view-timeline captures the pointer and ignores moves from any other pointerId; craft=checked the Emil checklist on the changed files: no transition-all, no scale(0) entry, no ease-in, no hover motion; keyboard steps of 0.1 move the handle without a decorative animation; motion=release spring stiffness 520 damping 34 mass 0.7 with the release velocity; the label shimmer is constant motion so it is linear (2.6 s loop) and it stops under reduced motion or when disabled
- **Design skill applied use**: applied use de emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/84/renders.yaml`: 176 capturas del head f572f34b, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: pointer drag with direct manipulation, velocity carried into the release spring, elastic resistance at the end of the track, and reduced-motion parity.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (slide-to-confirm, view-timeline); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=slide-to-confirm, view-timeline; audience=people confirming a consequential action or adjusting dates on a timeline; objective=confirm with a slide that follows the finger, and move timeline bars by drag, with keyboard and reduced-motion parity; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=4; VISUAL_DENSITY=4; rationale=lectura del revisor sobre el código: variance 2 because the handle and the bar already existed in CPL; motion 4 because the handle follows the pointer and settles with a damped spring; density 4 because layout is unchanged
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de slide-to-confirm, view-timeline en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=feedback; experience_quality=APPLIES (evidencia en docs/sprints/bounded-gestos-seguimiento-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#84 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-seguimiento.ui-status.yaml` en `AUDITORIA`, con el tip de código `f572f34b4fca79d38c0bf811dd4aee737cf533d3`
- Dirección por referencia: `ui/direction/gestos-seguimiento/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
