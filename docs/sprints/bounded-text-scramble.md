# bounded-text-scramble · carril acotado de UI (retana-ui, rama feat/text-scramble)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza, una sola rama, un solo PR en borrador contra CPL (no abierto desde este agente). Sin merge.

## Contrato

- **Status**: active
- **Branch**: feat/text-scramble
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/text-scramble.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-text-scramble-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `text-scramble` (registry retana-ui; ruta de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-text-scramble-experience-quality.md

## Scope

- docs/sprints/bounded-text-scramble.md
- docs/sprints/bounded-text-scramble-experience-quality.md
- ui/specs/text-scramble.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: VISIBLE_MINOR
- **Design delivery profile**: HOTFIX_MINIMAL
- **UI impact evidence**: Pieza nueva del registry, `text-scramble`, para títulos y heros: el texto se «descifra» una vez. No tiene controles ni flujo de interacción; sus estados son de tiempo (idle, running, done) y de preferencia (reduced). No hay pantalla nueva ni rediseño; solo la página de ejemplo del catálogo. El impacto se deriva de las dimensiones de abajo. El perfil STANDARD lo propone el builder porque la pieza trae movimiento propio y un riesgo declarado de `RUI-ANIM-PERF-007` (`ui/status/text-scramble.ui-status.yaml`). Lo confirma el UI Lead.
- **Visible control impact**: NO
- **Interaction flow impact**: NO
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders de la rama. Solo se marca USED lo que se corrió.

- **Design context source**: Spec `ui/specs/text-scramble.spec.md`, dirección `ui/direction/text-scramble/`, pieza `text-scramble`, capturas en `/workspace/emil-decode-2026-11-24/capturas/`, pasada en `/workspace/emil-decode-2026-11-24/design-pass/README.md`.
- **Design context checks**: existing surfaces = text-reveal y slot-text (CPL), motion-preference reusada; state inventory = idle, running, done, reduced, empty, long, loading, error, swap, unmount, visible, 390; tokens/components = retana-ui registry (Tailwind v4 tokens, `text-muted-foreground` para el ruido); anti-invention = solo hechos leídos del código, la Spec, el video y los renders.
- **User objective**: read a page title that arrives with a short, one-time "decode" that fits a terminal or hardware product, without losing the text for screen readers, reduced-motion users or no-JS.
- **Specialized design source**: emil-design-eng, animation-performance, choreograph, animate, review-animations y break-ui (Emil Kowalski, MIT), cargadas con Skill; líneas citadas en el learning `/workspace/emil-decode-2026-11-24/learnings/2026-11-24-emil-decoding-interfaces.md`.
- **Design skill stack trace**: las seis skills se aplicaron al diff contra CPL `bf1682d4`; reglas de ui-system 4.x leídas en la copia del hub `0218369e` (`knowledge/rules.yaml:117-123`, `rules/a11y.md:10`, `auditor/AUDITOR.v1.2.5.md:147,154-161,197`); routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="text animation", "reduced motion", "excessive motion", "screen reader" (ux) con /workspace/skills-ext/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, MIT), scripts/search.py; salidas en /workspace/emil-decode-2026-11-24/design-pass/uupm/; domain=ux (Excessive Motion, High; Reduced Motion, High; Continuous Animation, Medium; Screen Reader, Medium); applied_decision=Excessive Motion («Animate 1-2 key elements per view maximum») llevó a cortar el decode de las 3 specs en la escena de terminal: quedan nombre y precio (commit `a8ff6976`). Reduced Motion y Continuous Animation confirman el texto final inmediato y la entrada única sin loop. Screen Reader confirma sr-only con aria-hidden.
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=entrada única en título o hero, frecuencia «Rare/first-time» (`emil-design-eng/SKILL.md:73`), nunca en superficies de uso frecuente (`:70`); craft=sin transition-all, sin hex, sin `dark:` de color, ruido en token del tema; review-animations aprobó con la excepción de 600 ms declarada para marketing (`:131`); anim_perf_lint pass en 7 archivos; motion=progreso por reloj, una escritura cada 50 ms, orden de lectura con huecos que se encogen (choreograph); con reduced, texto final sin rAF.
- **Design skill applied use**: applied use: emil-design-eng: frecuencia y uso permitido. animation-performance: tope de escrituras, sin lecturas de layout y fuera la variante de color por carácter. choreograph: lead y support en la ficha de terminal y corte de partes móviles. animate: propósito explicable. review-animations: tabla de veredicto en la pasada. break-ui: 4 pruebas `TS-BREAK-*` (cambio a mitad, unicode, charset vacío, delay inválido).
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start`: `antes/` (CPL, 24), `despues/` (rama, 64) y `despues-decode/` (40 cuadros a t=0/120/260/400/700 ms con reloj falso) en `/workspace/emil-decode-2026-11-24/capturas/`.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: la pieza no tiene gestos ni física (sin springs, arrastre ni velocidad); es sustitución de glifos por tiempo.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: pieza acotada del registry que reusa patrones de CPL; no hay superficie nueva ni rediseño.
- **Anti-Slop Design Read**: surface=text-scramble; audience=people landing on a product or marketing page for a terminal or hardware product; objective=read the title with a short one-time decode; language=es-MX por defecto con set EN; system=retana-ui registry (Tailwind v4 tokens)
- **Anti-Slop design dials**: DESIGN_VARIANCE=3; MOTION_INTENSITY=4; VISUAL_DENSITY=3; rationale=variance 3 because the type and color are the host's; motion 4 because one title decodes once and the rest is static; density 3 because it is one line of text
- **Anti-Slop anti-default ledger**: rejected=loop, color por carácter, muestreo de imagen, decode en listas o botones, nuevas librerías; accepted=tokens del tema y `useMotionPreference`; reason=Spec «Uso permitido», `anti-slop-design-core.md:83-87` y `a11y.md:10`
- **Anti-Slop consistency locks**: system=retana-ui registry; theme=light y dark de los tokens existentes; color=foreground del host y `text-muted-foreground` para el ruido; type=la del host (mono recomendado en la escena de terminal); icons=ninguno; shape=sin cambios; copy=es-MX por defecto con set EN
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas; data=fixtures ficticios («Electrónica Cobre»); copy=textos propios es-MX y EN; dependencies=`@retana/motion-preference`, sin dependencia nueva de runtime
- **Anti-Slop preservation ledger**: mode=preserve; preserve=text-reveal, slot-text y motion-preference sin cambios; approved_changes=los de la Spec (AC-1…AC-11)
- **Anti-Slop motion purpose**: purpose=storytelling; origin=entrada de primera vez con origen explicable (el producto de terminal o hardware «arranca» como su pantalla); experience_quality=APPLIES (evidencia en docs/sprints/bounded-text-scramble-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=los de la Spec; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas antes/después lado a lado, sin diff de píxeles; deviations=600 ms y riesgo de RUI-ANIM-PERF-007 (declarados en el build-log)

## Referencias del ciclo

- PR: no abierto (solo draft; cuerpo fuera del repo en `/workspace/emil-decode-2026-11-24/pr-body.md`)
- retana_ui sha de partida: `bf1682d4dfb8696ddb01bf84aedda111f47b086c` (CPL)
- Spec versión 0.1.0; status `ui/status/text-scramble.ui-status.yaml`, con el tip de código `a8ff697636537bef7e24c846821bb66f483b21c2`
- Dirección por referencia: `ui/direction/text-scramble/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
