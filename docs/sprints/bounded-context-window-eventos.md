# bounded-context-window-eventos · carril acotado de UI (retana-ui PR #75)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/context-window-functional-c9b3
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/context-window-eventos.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-context-window-eventos-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `context-window` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-context-window-eventos-experience-quality.md

## Scope

- docs/sprints/bounded-context-window-eventos.md
- docs/sprints/bounded-context-window-eventos-experience-quality.md
- ui/specs/context-window-eventos.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: La ventana de contexto sigue eventos, avisa al cruzar el umbral, compacta cuando el anfitrión lo decide y estima el costo. Extensión de la pieza context-window. El perfil STANDARD lo fijó el UI Lead en `ui/status/context-window-eventos.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #75. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/context-window-eventos.spec.md`, dirección `ui/direction/context-window-eventos/`, piezas context-window, renders del head en `/workspace/retana-ui-entregas/pr-sweep/75/renders.yaml`.
- **Design context checks**: existing surfaces = context-window (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, playback, near-limit, compacting, compacted, over-limit, pinned, cache-heavy, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: watch context use grow event by event, see the threshold and cost, compact, and pin sources with rollback.
- **Specialized design source**: design skill emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT), cargada con Skill en esta pasada.
- **Design skill stack trace**: emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); ui-ux-pro-max no se pudo cargar (no instalada en este agente); routing core-only.
- **UI/UX Pro Max classification**: NOT_RUN
- **UI/UX Pro Max evidence**: query=no se corrió, la skill ui-ux-pro-max no está instalada en este agente (Skill por nombre y Skill query sin resultado; ui-system/skills/README.md del hub la lista como del hub, no vendorizada); domain=no se corrió; applied_decision=no se corrió
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=a keyboard grid of sources with roving focus, pin with rollback, and a tooltip; no gesture; craft=the token figure and the caption used AnimatePresence mode wait (180 and 200 ms out, then in), while the playback scene fires an event every 280 ms, so the value was always mid-fade and the new caption was not mounted; motion=figure and caption now swap at once (tabular-nums keeps the width); the remaining tooltip fade is 150 ms with motion-reduce:transition-none
- **Design skill applied use**: applied use de emil-design-eng: code change in 9ab1d205: TokenFigure and Caption render without crossfade; red test __tests__/context-window-cadence.test.tsx failed first ('30 de 100' still shown, new caption not mounted) and passes now. SHOULD: revisar con la misma regla de frecuencia cualquier otra cifra que cambie por evento.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/75/renders.yaml`: 112 capturas del head 9ab1d205, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: the context window has no direct manipulation: no drag, gesture or sheet; interaction is keyboard and pointer selection.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (context-window); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=context-window; audience=people running an AI agent who need to see what fills the context window; objective=watch context use grow event by event, see the threshold and cost, compact, and pin sources with rollback; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=2; VISUAL_DENSITY=6; rationale=lectura del revisor sobre el código: variance 2 because the piece keeps its CPL look; motion 2 because, after this pass, only the segment and tooltip transitions remain; density 6 because the grid of ticks is dense
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de context-window en CPL; approved_changes=TokenFigure y Caption sin crossfade (9ab1d205) más los cambios de interacción que ya fija la Spec
- **Anti-Slop motion purpose**: purpose=state-transition; experience_quality=APPLIES (evidencia en docs/sprints/bounded-context-window-eventos-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, playback, near-limit, compacting, compacted, over-limit, pinned, cache-heavy, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#75 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/context-window-eventos.ui-status.yaml` en `AUDITORIA`, con el tip de código `db19a518cddc7b1461f2e47c9470a7de4d93088e`
- Dirección por referencia: `ui/direction/context-window-eventos/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
