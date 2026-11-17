# bounded-piloto-vue · carril acotado de UI (retana-ui PR #86)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/piloto-vue-tokens-5483
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/piloto-vue.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-piloto-vue-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `decision-inbox`, `lightbox`, `time-off-stats` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-piloto-vue-experience-quality.md

## Scope

- docs/sprints/bounded-piloto-vue.md
- docs/sprints/bounded-piloto-vue-experience-quality.md
- ui/specs/piloto-vue.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: Tokens DTCG compartidos y tres piezas existentes (time-off-stats, decision-inbox, lightbox) portadas a SFC Vue y una vista Razor; el lightbox reenvía sus etiquetas. Port de piezas existentes, no pieza ni pantalla nueva del catálogo (el UI Lead puede reclasificar). El perfil STANDARD lo fijó el UI Lead en `ui/status/piloto-vue.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders del PR #86. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: Spec `ui/specs/piloto-vue.spec.md`, dirección `ui/direction/piloto-vue/`, piezas decision-inbox, lightbox, time-off-stats, renders del head en `/workspace/retana-ui-entregas/pr-sweep/86/renders.yaml`.
- **Design context checks**: existing surfaces = decision-inbox, lightbox, time-off-stats (piezas de CPL, sin pieza nueva); state inventory = filled, empty, loading, error, zero, pending, answered, folded, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: prove the DTCG tokens and three existing pieces (time-off-stats, decision-inbox, lightbox) work as Vue SFCs and a Razor view at parity with React.
- **Specialized design source**: design skills ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e22, MIT) y emil-design-eng (Emil Kowalski, emilkowalski/skills@f1090bec, MIT).
- **Design skill stack trace**: ui-ux-pro-max leída de su SKILL.md en el pin y corrida con su search.py (salidas en /workspace/retana-ui-entregas/pr-sweep/86/design-pass/uupm/); emil-design-eng cargada con Skill y aplicada al diff de código del PR contra CPL 33438d12 (checklist completo: transition-all, scale(0), ease-in, duraciones, hover sin media query, keyframes en UI rápida, animación por teclado, reduced motion, pointer capture, multi-touch, velocidad); routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="skeleton loading reduced motion", "image alt text", "dialog accessible description" (ux) y "accessible component props", "dialog aria describedby" (--stack vue), con /workspace/skills-ext/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, MIT), scripts/search.py; domain=ux (Reduced Motion, Loading Indicators, Alt Text) y stacks/vue (atributos ARIA enlazados, no estáticos); applied_decision=cambió una decisión: Lightbox.vue escribía aria-describedby="undefined" estático, así que el diálogo apuntaba a un id "undefined" inexistente; ahora es :aria-describedby="undefined" enlazado, como el aria-describedby={undefined} de React. Prueba roja primero (vue/tests/lightbox-aria.test.ts). Confirma además: skeletons con motion-reduce:animate-none, carga con role=status o aria-busy, alt de cada imagen y defineProps tipados
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=lightbox zoom is button-driven (no direct manipulation); decision-inbox and time-off-stats are click and keyboard only; craft=checked the Emil checklist on the React and Vue files: lightbox animates transform only for 200 ms with motion-reduce:transition-none; skeletons use animate-pulse and AC8 checks animation-name none under reduced motion; motion=one transform transition of 200 ms and a loading pulse; both drop under reduced motion
- **Design skill applied use**: emil-design-eng: no change: the emil-design-eng checklist found nothing to fix in the changed code. ui-ux-pro-max: applied use: cambio de código en Lightbox.vue con prueba; el resto confirmado.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` en `/workspace/retana-ui-entregas/pr-sweep/86/renders.yaml`, regenerados sobre el commit que trae este manifiesto (código y docs juntos), a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: the pilot ports button and keyboard driven pieces; there is no gesture, drag or sheet in scope.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende piezas existentes de CPL (decision-inbox, lightbox, time-off-stats); no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=decision-inbox, lightbox, time-off-stats; audience=teams on Vue or ASP.NET hosts that consume retana-ui tokens; objective=prove the DTCG tokens and three existing pieces (time-off-stats, decision-inbox, lightbox) work as Vue SFCs and a Razor view at parity with React; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=1; MOTION_INTENSITY=2; VISUAL_DENSITY=5; rationale=lectura del revisor sobre el código: variance 1 because the port matches the React pieces; motion 2 because only the lightbox zoom transform and the loading skeleton move; density 5 because the pieces keep their CPL density
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es de interacción sobre piezas existentes y la Spec fija el look de CPL
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only (primary, muted, destructive, border); type=existing scale with tabular-nums on figures; icons=lucide-react as in CPL; shape=existing radii (rounded-xl cards, rounded-full pills); copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas, solo fixtures del ejemplo; data=fixtures ficticios en app/examples; copy=textos de la Spec y de los fixtures es-MX y EN; dependencies=no new runtime dependency in the design pass
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens y API pública de decision-inbox, lightbox, time-off-stats en CPL; approved_changes=aria-describedby enlazado en Lightbox.vue (pasada ui-ux-pro-max) más los cambios que ya fija la Spec
- **Anti-Slop motion purpose**: purpose=state-transition; experience_quality=APPLIES (evidencia en docs/sprints/bounded-piloto-vue-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, zero, pending, answered, folded, 390; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head en renders.yaml, sin herramienta de diff de píxeles; deviations=la pasada no introdujo desviación del look de CPL

## Referencias del ciclo

- PR: eduardoretana/retana-ui#86 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/piloto-vue.ui-status.yaml` en `AUDITORIA`, con el tip de código `4476214dbabe6708f9b3755f0aee6c81e7d5b367`
- Dirección por referencia: `ui/direction/piloto-vue/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
