# bounded-coreografia-touch · carril acotado de UI (retana-ui PR #68)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/emil-choreograph-touch-7860
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/coreografia-touch.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-coreografia-touch-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `comment-thread`, `dashboard-analitico-ae`, `hero-section`, `multi-view`, `notification-stack`, `shortcut-recorder`, `slide-to-confirm`, `stagger-reveal`, `user-menu`, `view-calendar`, `view-kanban`, `view-timeline` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-coreografia-touch-experience-quality.md

## Scope

- docs/sprints/bounded-coreografia-touch.md
- docs/sprints/bounded-coreografia-touch-experience-quality.md
- ui/specs/coreografia-touch.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: Coreografía de entrada con tope (registry/lib/motion.ts, compartido) y activación táctil que distingue tap, scroll y arrastre en piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/coreografia-touch.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: NO
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #68. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/coreografia-touch.spec.md`, dirección `ui/direction/coreografia-touch/`, piezas comment-thread, dashboard-analitico-ae, hero-section, multi-view, notification-stack, shortcut-recorder, slide-to-confirm, stagger-reveal, user-menu, view-calendar, view-kanban, view-timeline, renders del head en `/workspace/retana-ui-entregas/pr-sweep/68/renders.yaml`.
- **Design context checks**: existing surfaces = comment-thread, dashboard-analitico-ae, hero-section, multi-view, notification-stack, shortcut-recorder, slide-to-confirm, stagger-reveal, user-menu, view-calendar, view-kanban, view-timeline (piezas de CPL, sin pieza nueva); state inventory = filled, stress, reduced, touch-tap, touch-scroll, long-press, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: bring Emil choreography budgets to existing pieces and make touch tap, scroll and long-press activate correctly.
- **Specialized design source**: design skill emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT), cargada con Skill en esta pasada.
- **Design skill stack trace**: emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); ui-ux-pro-max no se pudo cargar (no instalada en este agente); routing core-only.
- **UI/UX Pro Max classification**: NOT_RUN
- **UI/UX Pro Max evidence**: query=no se corrió, la skill ui-ux-pro-max no está instalada en este agente (Skill por nombre y Skill query sin resultado; ui-system/skills/README.md del hub la lista como del hub, no vendorizada); domain=no se corrió; applied_decision=no se corrió
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=touch intent waits 360 ms for long-press and allows 8 px of slop before a tap becomes a scroll; drag listeners split pointer and keyboard paths; craft=checked the Emil checklist on the changed files: product stagger steps are 50 ms with a 300 ms ceiling and decay, marketing steps are 120 ms, resize fades clamp to 150 to 270 ms; no transition-all, no ease-in; the presence-dot scale-0 cutout is a CPL status morph, not an entry; motion=stagger and resize fades from registry/lib/motion.ts; hero marketing motion at 0.55 s is explanatory; reduced motion uses instant durations
- **Design skill applied use**: applied use de emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/68/renders.yaml`: 192 capturas del head 276e9f66, a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: touch tap, scroll and long-press with slop and hold thresholds, pointer drag on views, and reduced-motion parity.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (comment-thread, dashboard-analitico-ae, hero-section, multi-view, notification-stack, shortcut-recorder, slide-to-confirm, stagger-reveal, user-menu, view-calendar, view-kanban, view-timeline); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=comment-thread, dashboard-analitico-ae, hero-section, multi-view, notification-stack, shortcut-recorder, slide-to-confirm, stagger-reveal, user-menu, view-calendar, view-kanban, view-timeline; audience=people using the catalog pieces on touch screens; objective=bring Emil choreography budgets to existing pieces and make touch tap, scroll and long-press activate correctly; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=4; VISUAL_DENSITY=5; rationale=lectura del revisor sobre el código: variance 2 because the pieces keep their CPL look; motion 4 because the cycle tunes stagger and resize fades on existing motion; density 5 because layouts are unchanged
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de comment-thread, dashboard-analitico-ae, hero-section, multi-view, notification-stack, shortcut-recorder, slide-to-confirm, stagger-reveal, user-menu, view-calendar, view-kanban, view-timeline en CPL; approved_changes=solo los cambios de interacción que ya fija la Spec; la pasada no agregó cambios
- **Anti-Slop motion purpose**: purpose=hierarchy; experience_quality=APPLIES (evidencia en docs/sprints/bounded-coreografia-touch-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, stress, reduced, touch-tap, touch-scroll, long-press, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#68 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/coreografia-touch.ui-status.yaml` en `AUDITORIA`, con el tip de código `6cdabab074a6c8b98a1c09b4ea6788ae7d29bfb5`
- Dirección por referencia: `ui/direction/coreografia-touch/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
