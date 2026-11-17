# bounded-gestos-hold-hits · carril acotado de UI (retana-ui PR #85)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-hold-hits-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-hold-hits.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-hold-hits-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `bottom-sheet`, `hold-to-confirm` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-gestos-hold-hits-experience-quality.md

## Scope

- docs/sprints/bounded-gestos-hold-hits.md
- docs/sprints/bounded-gestos-hold-hits-experience-quality.md
- ui/specs/gestos-hold-hits.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: hold-to-confirm cancela rápido, los blancos táctiles pasan a 44 px (clase del asa compartida) y bottom-sheet vuelve al mismo detent sin la espera de 0.4 s. Piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-hold-hits.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #85. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/gestos-hold-hits.spec.md`, dirección `ui/direction/gestos-hold-hits/`, piezas bottom-sheet, hold-to-confirm, renders del head en `/workspace/retana-ui-entregas/pr-sweep/85/renders.yaml`.
- **Design context checks**: existing surfaces = bottom-sheet, hold-to-confirm (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: hold to confirm and drag a bottom sheet between detents with correct hit areas, keyboard and reduced-motion parity.
- **Specialized design source**: design skills ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e22, MIT) y emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT).
- **Design skill stack trace**: ui-ux-pro-max leída de su SKILL.md en el pin y corrida con su search.py (salidas en /workspace/retana-ui-entregas/pr-sweep/85/design-pass/uupm/); emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="dragging movements", "long press alternative" y su reintento "press and hold keyboard", "bottom sheet dismiss" y su reintento "drawer swipe close", "touch target size" (ux) y "drawer sheet" (--stack shadcn), con /workspace/skills-ext/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, MIT), scripts/search.py; domain=ux (Dragging Movements, Keyboard Navigation, Target Size Minimum) y stacks/shadcn (Sheet, focus); applied_decision=confirma que el arrastre del sheet tiene alternativa de un solo puntero (el grabber es un botón con clic) y de teclado (flechas, Page, Home y End), que hold-to-confirm se sostiene con Enter o Espacio, y que el foco lo maneja Dialog de Radix. "bottom sheet dismiss" y "drawer swipe close" no dieron resultado en la base: sin coincidencia verificada para el sheet. Sin cambio de código
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=bottom-sheet and hold-to-confirm ignore non-primary pointers (isPrimary) so a second finger cannot hijack the gesture; the sheet picks the nearest detent after coasting by the release velocity; craft=checked the Emil checklist on the changed files: no transition-all, no scale(0) entry, no ease-in, no hover motion; motion-reduce:transition-none on the sheet and the hold fill; motion=springs carry the release velocity into the detent; the hold fill is a slow deliberate press with a fast release; reduced motion drops the transitions
- **Design skill applied use**: emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code. ui-ux-pro-max: applied use: confirmó las decisiones de arriba; sin coincidencia en la base para el patrón de sheet, no se aplicó guía genérica.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/85/renders.yaml`: 176 capturas del head cd46531b, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: sheet drag between detents with velocity projection, interruption, multi-touch protection through isPrimary, and reduced-motion parity.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (bottom-sheet, hold-to-confirm); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=bottom-sheet, hold-to-confirm; audience=people confirming a destructive action or using a sheet on a phone; objective=hold to confirm and drag a bottom sheet between detents with correct hit areas, keyboard and reduced-motion parity; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=4; VISUAL_DENSITY=4; rationale=lectura del revisor sobre el código: variance 2 because both pieces keep their CPL look; motion 4 because the sheet follows the finger and coasts to a detent; density 4 because layout is unchanged
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de bottom-sheet, hold-to-confirm en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=feedback; experience_quality=APPLIES (evidencia en docs/sprints/bounded-gestos-hold-hits-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#85 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-hold-hits.ui-status.yaml` en `AUDITORIA`, con el tip de código `cd46531b8ab39f9a40c31c8dbd6f6b8b2c3eb619`
- Dirección por referencia: `ui/direction/gestos-hold-hits/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
