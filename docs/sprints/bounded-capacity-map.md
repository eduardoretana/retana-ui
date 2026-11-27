# bounded-capacity-map · carril acotado de UI (retana-ui, rama feat/capacity-map)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza, una sola rama local. Sin push ni PR hasta el sí de Eduardo.

## Contrato

- **Status**: active
- **Branch**: feat/capacity-map
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/capacity-map.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-capacity-map-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `capacity-map`
- **Experience evidence file**: docs/sprints/bounded-capacity-map-experience-quality.md

## Scope

- docs/sprints/bounded-capacity-map.md
- docs/sprints/bounded-capacity-map-experience-quality.md
- ui/specs/capacity-map.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: Pieza nueva `capacity-map` para un mapa de cupos por zona enlazado a una tabla. No rediseña piezas existentes. El perfil STANDARD lo propone el builder porque es un patrón espacial nuevo, con resaltado cruzado y teclado. Lo confirma el UI Lead.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO


## Design Specialization Gate

Pasada de diseño real sobre el código y los renders de la rama. Solo se marca USED lo que se corrió.

- **Design context source**: Spec `ui/specs/capacity-map.spec.md`, dirección `ui/direction/capacity-map/`, pieza `capacity-map`, capturas en `/workspace/shadcnstudio-2026-11-27-capacity-map/capturas/`, pasada en `/workspace/shadcnstudio-2026-11-27-capacity-map/design-pass/README.md`.
- **Design context checks**: existing surfaces = planning-grid, map-browser, geo-map, stat-sparkline-card, agent-queue, DataTableMeter y WorkSlaCell (CPL), más los PR #73 y #81 en lectura; state inventory = filled, empty, loading, error, simulate, overflow, custom-status, long-names, 390, stress; tokens/components = retana-ui registry (Tailwind v4 tokens, Accordion, Table, Popover, barra de capacidad); anti-invention = solo hechos leídos del código, la Spec, el video público, el catálogo y los renders.
- **User objective**: see how many slots are free in each zone, find a specific slot on the map and in the table at the same time, and try a demand forecast without saving anything.
- **Specialized design source**: emil-design-eng, review-animations, animation-performance y break-ui (Emil Kowalski, MIT; copia en el hub `0218369e` `ui-system/skills/emil/`) y better-ui (jakub, cargada con Skill); líneas citadas en `/workspace/shadcnstudio-2026-11-27-capacity-map/design-pass/README.md`.
- **Design skill stack trace**: las skills se aplicaron al diff contra CPL `bf1682d4`; reglas de ui-system 4.x leídas en la copia del hub `0218369e`; consultas de ui-ux-pro-max en `design-pass/uupm/`; routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query=color alone meaning, row hover highlight, reduced motion; domain=ux (Color Only, High; Hover vs Tap, High; Reduced Motion, High; Excessive Motion, High); applied_decision=Color Only fija icono más color en cada cupo y un anillo para el resaltado cruzado, no un cambio de color solo. Hover vs Tap exige que el resaltado también corra al enfocar y que la tabla o el layout list sigan siendo la fuente accesible.
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=resaltado cruzado mapa-tabla al pasar o enfocar, navegación de lista de uso frecuente (emil-design-eng/SKILL.md:73), por eso el anillo no anima; craft=solo tokens, transiciones con propiedad nombrada, sin hex ni dark: de color; motion=chevron y barra con motion-reduce:transition-none, popover con motion-reduce:animate-none (SKILL.md:527-529), sin bucles.
- **Design skill applied use**: applied use: emil-design-eng: frecuencia del resaltado y reduced-motion. review-animations: no animar la navegación de lista, transiciones con propiedad nombrada. animation-performance: sin lecturas de layout por frame, sin canvas, capas de composite en chevron y barra. break-ui: 500 cupos, nombres largos, estado propio y overflow. better-ui: anillo en vez de color solo, tokens del anfitrión.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start`: 88 PNG (11 piezas × 2 viewports × 2 temas × 2 motions) en `/workspace/shadcnstudio-2026-11-27-capacity-map/capturas/`. No hay set de antes: planning-grid no se modificó.
- **Apple Design classification**: NOT_APPLICABLE
- **Apple Design reason**: la pieza no tiene gestos ni física (sin springs, arrastre ni velocidad); el resaltado es hover y foco, no manipulación directa.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: pieza acotada del registry que reusa tabla, acordeón, popover y tokens de CPL; no hay superficie nueva de producto ni rediseño de piezas existentes.
- **Anti-Slop Design Read**: surface=capacity-map; audience=operadores que asignan cupos en una clínica, bodega o sala; objective=ver cupos libres por zona y localizar uno a la vez en el mapa y en la tabla; language=es-MX por defecto con set EN; system=retana-ui registry (Tailwind v4 tokens)
- **Anti-Slop design dials**: DESIGN_VARIANCE=4; MOTION_INTENSITY=2; VISUAL_DENSITY=6; rationale=variance 4 because the spatial map is new but type, color and table come from the host; motion 2 because only the chevron and the capacity bar move and the highlight is a static ring; density 6 because many slots sit in one operational view
- **Anti-Slop anti-default ledger**: rejected=datos de estacionamiento de la referencia, botón Aplicar que persiste la previsión, pestañas Mapa/Lista, resaltado solo con color, copia de código Pro; accepted=fixtures genéricos de clínica, previsión con Descartar y sin persistir, grupos apilados a 390 px, anillo e icono; reason=clean-room de un bloque Pro, WCAG 1.4.1 y el resaltado cruzado tiene que seguir visible en celular
- **Anti-Slop consistency locks**: system=retana-ui registry; theme=light y dark de los tokens existentes; color=tokens semánticos (primary, muted, destructive, ring); type=la del host; icons=lucide ya presente en el registry; shape=cupos con rounded-md; copy=es-MX por defecto con set EN
- **Anti-Slop truth ledger**: assets=iconos lucide ya del registry, sin asset nuevo de la referencia; data=fixtures ficticios de Clínica Alameda; copy=textos propios es-MX y EN; dependencies=Accordion, Table, Popover y tokens de CPL, sin librería nueva de runtime
- **Anti-Slop preservation ledger**: mode=preserve; preserve=planning-grid, map-browser, geo-map, stat-sparkline-card, DataTableMeter y WorkSlaCell sin cambios; approved_changes=la primitiva nueva capacity-map (Spec AC) y, en rama local aparte, time-window-cell
- **Anti-Slop motion purpose**: purpose=feedback; origin=el anillo señala el mismo cupo en el mapa y en la tabla, las barras muestran la ocupación; experience_quality=APPLIES (evidencia en docs/sprints/bounded-capacity-map-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=filled, empty, loading, error, simulate, overflow, custom-status, long-names, 390, stress; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas de la rama en 88 PNG, sin antes porque no se tocó un vecino; deviations=las capturas filled se rehcieron tras el build que ya incluye el filtro de filas de sesión

## Referencias del ciclo

- PR: no abierto (regla del 25 nov: todo queda local hasta el sí de Eduardo)
- retana_ui sha de partida: `bf1682d4dfb8696ddb01bf84aedda111f47b086c` (CPL)
- Spec versión 0.1.0; status `ui/status/capacity-map.ui-status.yaml`, con el tip de código `f13a3d41ef91578afa4b97580061e51d29fe85f0`
- Dirección por referencia: `ui/direction/capacity-map/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
