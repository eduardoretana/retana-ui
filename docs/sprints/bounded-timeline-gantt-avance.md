# bounded-timeline-gantt-avance · carril acotado de UI (retana-ui PR #69)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gantt-progress-panel-fc07
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/timeline-gantt-avance.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-timeline-gantt-avance-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `timeline-gantt` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-timeline-gantt-avance-experience-quality.md

## Scope

- docs/sprints/bounded-timeline-gantt-avance.md
- docs/sprints/bounded-timeline-gantt-avance-experience-quality.md
- ui/specs/timeline-gantt-avance.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: El cronograma muestra avance y resumen de fase y permite editar una tarea desde un panel. Extensión de la pieza timeline-gantt. El perfil STANDARD lo fijó el UI Lead en `ui/status/timeline-gantt-avance.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #69. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/timeline-gantt-avance.spec.md`, dirección `ui/direction/timeline-gantt-avance/`, piezas timeline-gantt, renders del head en `/workspace/retana-ui-entregas/pr-sweep/69/renders.yaml`.
- **Design context checks**: existing surfaces = timeline-gantt (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: see progress, phase summaries and an edit panel on the existing Gantt.
- **Specialized design source**: design skill emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT), cargada con Skill en esta pasada.
- **Design skill stack trace**: emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); ui-ux-pro-max no se pudo cargar (no instalada en este agente); routing core-only.
- **UI/UX Pro Max classification**: NOT_RUN
- **UI/UX Pro Max evidence**: query=no se corrió, la skill ui-ux-pro-max no está instalada en este agente (Skill por nombre y Skill query sin resultado; ui-system/skills/README.md del hub la lista como del hub, no vendorizada); domain=no se corrió; applied_decision=no se corrió
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=hover and focus show a tooltip; editing happens in a panel with fields, there is no drag on the bars; craft=checked the Emil checklist on the changed files: the progress fill animates transform (scaleX from the left) and the bar animates opacity, no layout properties, no ease-in, no hover motion; motion=160 ms with the enter curve (0.16, 1, 0.3, 1); duration 0 under reduced motion
- **Design skill applied use**: applied use de emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/69/renders.yaml`: 112 capturas del head a265c465, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: the changed Gantt has no direct manipulation: no drag, gesture or sheet; edits go through a form panel.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (timeline-gantt); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=timeline-gantt; audience=people tracking a project plan; objective=see progress, phase summaries and an edit panel on the existing Gantt; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=2; VISUAL_DENSITY=6; rationale=lectura del revisor sobre el código: variance 2 because the Gantt keeps its CPL look; motion 2 because only a progress fill and a bar fade move, both 160 ms; density 6 because the chart is a dense grid
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de timeline-gantt en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=state-transition; experience_quality=APPLIES (evidencia en docs/sprints/bounded-timeline-gantt-avance-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, progress, complete, plain, extremes, long, oneday, many, editor, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#69 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/timeline-gantt-avance.ui-status.yaml` en `AUDITORIA`, con el tip de código `a28a5a7c36b7c0701db6f3e12c4701adf20d9b49`
- Dirección por referencia: `ui/direction/timeline-gantt-avance/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
