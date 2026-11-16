# bounded-agenda-resources · carril acotado de UI (retana-ui PR #67)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/agenda-resource-schedule-fca1
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/agenda-resources.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-agenda-resources-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `agenda` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-agenda-resources-experience-quality.md

## Scope

- docs/sprints/bounded-agenda-resources.md
- docs/sprints/bounded-agenda-resources-experience-quality.md
- ui/specs/agenda-resources.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: La agenda suma eje de recursos, filtro, choque accesible y cupo; sin resources el contrato previo no cambia. Extensión de la pieza agenda; no hay pieza nueva. El perfil STANDARD lo fijó el UI Lead en `ui/status/agenda-resources.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #67. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/agenda-resources.spec.md`, dirección `ui/direction/agenda-resources/`, piezas agenda, renders del head en `/workspace/retana-ui-entregas/pr-sweep/67/renders.yaml`.
- **Design context checks**: existing surfaces = agenda (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, resources, conflicts, over, many; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: see resources, a conflict said in words, and hours against a quota in the agenda, without changing behavior for hosts that pass no resources.
- **Specialized design source**: design skills ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e22, MIT) y emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT).
- **Design skill stack trace**: ui-ux-pro-max leída de su SKILL.md en el pin y corrida con su search.py (salidas en /workspace/retana-ui-entregas/pr-sweep/67/design-pass/uupm/); emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="dragging movements", "color alone meaning", "touch target size" (ux), "calendar schedule resource" (chart) y "calendar keyboard" / "keyboard accessible" (--stack react), con /workspace/skills-ext/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, MIT), scripts/search.py; domain=ux (Dragging Movements, Color Only, Target Size Minimum), chart (Heat Map, nota de no depender solo del color) y stacks/react; applied_decision=confirma que el choque se dice con texto (conflictLabel visible y en el nombre accesible) y no solo con color, y que crear un evento funciona con un toque (pointerdown y pointerup en el mismo punto crea un bloque del tamaño del snap) y con teclado. Señala que mover y redimensionar un evento solo se hace arrastrando, hueco que ya existía en CPL. Sin cambio de código
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=drag on a lane creates an event with pointer capture and snaps to the slot size; keyboard moves between slots without animation; craft=checked the Emil checklist on the changed files: no transition-all, no scale(0), no ease-in, no hover motion, no animation on keyboard navigation; motion=no new motion; the grid is used many times a day, so instant changes are the right default
- **Design skill applied use**: emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code. ui-ux-pro-max: SHOULD (severidad High, WCAG 2.5.7): mover y redimensionar eventos de la agenda necesita una alternativa de un solo puntero o una excepción documentada en la Spec. Preexistente en CPL, fuera del alcance de agenda-resources.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/67/renders.yaml`: 80 capturas del head 8ef2bbbc, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: pointer drag to create an event with pointer capture and snapping; no momentum because slots snap; reduced motion has nothing to remove.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (agenda); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=agenda; audience=a small workshop scheduling people and equipment (fictional fixtures); objective=see resources, a conflict said in words, and hours against a quota in the agenda, without changing behavior for hosts that pass no resources; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=1; VISUAL_DENSITY=6; rationale=lectura del revisor sobre el código: variance 2 because the agenda keeps its CPL look; motion 1 because the cycle adds no animation and the now-line is transition-none; density 6 because resource lanes add rows to a dense grid
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de agenda en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=static; experience_quality=APPLIES (evidencia en docs/sprints/bounded-agenda-resources-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, resources, conflicts, over, many; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#67 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/agenda-resources.ui-status.yaml` en `AUDITORIA`, con el tip de código `d9e01ac8919e999b6c5a22de2590f6017acbc165`
- Dirección por referencia: `ui/direction/agenda-resources/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
