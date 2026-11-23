# bounded-color-picker-formatos · carril acotado de UI (retana-ui, rama feat/color-picker-formatos-popover)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza, una sola rama, un solo PR en borrador contra CPL (no abierto desde este agente). Sin merge.

## Contrato

- **Status**: active
- **Branch**: feat/color-picker-formatos-popover
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/color-picker-formatos.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-color-picker-formatos-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `color-picker` (registry retana-ui; ruta de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-color-picker-formatos-experience-quality.md

## Scope

- docs/sprints/bounded-color-picker-formatos.md
- docs/sprints/bounded-color-picker-formatos-experience-quality.md
- ui/specs/color-picker-formatos.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: El selector de color agrega formato HEX/RGB/HSL validado, copiar, modo popover, cuentagotas visible con explicación y guardados editables por teclado y por botones. Pieza existente; no hay pantalla nueva. Perfil STANDARD propuesto por el builder en `ui/status/color-picker-formatos.ui-status.yaml`; lo confirma el UI Lead.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño real sobre el código y los renders de la rama. Solo se marca USED lo que se corrió.

- **Design context source**: Spec `ui/specs/color-picker-formatos.spec.md`, dirección `ui/direction/color-picker-formatos/`, pieza `color-picker`, capturas en `/workspace/color-picker-2026-11-23/capturas/`.
- **Design context checks**: existing surfaces = color-picker (pieza de CPL); state inventory = filled, empty, loading, error, invalid, no-eyedropper, full, popover, keyboard, reduced, 390; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, popover del host); anti-invention = solo hechos leídos del código, la Spec y los renders.
- **User objective**: pick, type, paste or copy a color in the format the user works in, and keep a short list of saved colors without needing to drag.
- **Specialized design source**: ui-system 4.x skills better-ui y better-accessibility (Jakub, MIT) y emil-design-eng, break-ui y review-animations (Emil Kowalski, MIT), blobs fijados en el learning `/workspace/color-picker-2026-11-23/learnings/2026-11-23-shadcnstudio-color-picker.md`.
- **Design skill stack trace**: better-ui y better-accessibility leídas en la copia del hub `0218369e` (blobs iguales a ui-system `cbdaaf62`); emil-design-eng, break-ui y review-animations cargadas con Skill y aplicadas al diff contra CPL `bf1682d4`; routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="dragging movements", "disabled state explanation", "copy to clipboard feedback", "input validation inline error", "popover" (ux) y "color picker popover" (--stack shadcn), con /workspace/skills-ext/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, MIT), scripts/search.py; salidas en /workspace/color-picker-2026-11-23/design-pass/uupm/; domain=ux (Dragging Movements, High; Disabled States; Inline Validation y Error Placement, High) y stacks/shadcn (Popover; Handle popover alignment); applied_decision=confirma 4 decisiones del código: botones de un solo puntero y teclado para mover y borrar guardados (2.5.7), cuentagotas y «Guardar» con estado deshabilitado visible y explicado, error en línea bajo el campo ligado con aria-describedby y validado al salir o al pegar, popover del host con align="start" explícito. "popover" en ux y "copy to clipboard feedback" no dieron guía aplicable (0 resultados / resultados de otra categoría). Sin cambio de código
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=popover con origen en el disparador (host), reduced motion sin zoom ni slide; icono de copiar con `scale` 0.25→1 y `opacity`; sin animación en acciones de teclado de los guardados; craft=sin transition-all, sin scale(0), sin ease-in, sin hover sin gate; review-animations corrigió `transition-[transform,opacity]` → `transition-[scale,opacity]`; anim_perf_lint pass en 5 archivos; motion=icono Copy/Check 300 ms `cubic-bezier(0.2, 0, 0, 1)` (valores de better-ui), popover del host 100 ms con zoom 95 desde el disparador; con reduced motion solo opacidad; sin animación en Alt+flechas, Supr ni cambio de formato.
- **Design skill applied use**: applied use: emil-design-eng: popover origin-aware y reduced motion. review-animations: corrección de la propiedad animada del icono. break-ui: 7 pruebas `CP-BREAK-*` (pegado largo, espacios, foco al borrar el último, barra que no roba foco, sin selección, un solo formato, popover es-MX). better-accessibility: `aria-disabled` + explicación, `aria-invalid` + `aria-describedby`, `role="status"` estable, alternativa al arrastre.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start`: `antes/` (CPL, 16), `despues/` (rama, 72) y `despues-interaccion/` (28, con axe y overflow) en `/workspace/color-picker-2026-11-23/capturas/`.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: la pieza no tiene gestos con física (sin springs, proyección de velocidad ni goma); el arrastre del área y de los rangos sigue al puntero 1:1 y el popover usa la animación del host.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo extiende una pieza existente de CPL; no hay superficie nueva ni rediseño.
- **Anti-Slop Design Read**: surface=color-picker; audience=people choosing brand or theme colors inside a host app; objective=pick, type, paste or copy a color in the format they use and reuse saved colors; language=es-MX por defecto con etiquetas EN; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens)
- **Anti-Slop design dials**: DESIGN_VARIANCE=2; MOTION_INTENSITY=2; VISUAL_DENSITY=5; rationale=variance 2 because area, hue and alpha keep their CPL look; motion 2 because only the copy icon and the host popover move; density 5 because a tools row and a saved list are added in the same card
- **Anti-Slop anti-default ledger**: rejected=paleta fija, hex en el código, `dark:` de color, nuevas librerías; accepted=tokens semánticos y primitivas del host; reason=validate-registry y la Spec lo exigen
- **Anti-Slop consistency locks**: system=retana-ui registry; theme=light y dark de los tokens existentes; color=tokens semánticos (foreground, muted, destructive, border, ring); type=escala existente, valores en mono; icons=lucide-react; shape=radios existentes; copy=es-MX por defecto con set EN
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas; data=fixtures ficticios en app/examples; copy=textos propios es-MX y EN; dependencies=popover del host, sin dependencia nueva de runtime
- **Anti-Slop preservation ledger**: mode=preserve; preserve=área, tono, alfa, muestra y API de CPL; approved_changes=los de la Spec (AC-1…AC-10)
- **Anti-Slop motion purpose**: purpose=feedback; experience_quality=APPLIES (evidencia en docs/sprints/bounded-color-picker-formatos-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=los de la Spec; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas antes/después lado a lado, sin diff de píxeles; deviations=sin blur en el icono de copiar (declarado en el build-log)

## Referencias del ciclo

- PR: no abierto (solo draft; cuerpo fuera del repo en `/workspace/color-picker-2026-11-23/pr-body.md`)
- retana_ui sha de partida: `bf1682d4dfb8696ddb01bf84aedda111f47b086c` (CPL)
- Spec versión 0.1.0; status `ui/status/color-picker-formatos.ui-status.yaml`, con el tip de código `6f215631b6fcc822e5c6460f899b5f85aabb575e`
- Dirección por referencia: `ui/direction/color-picker-formatos/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
