---
spec_id: coreografia-touch
version: 1.0.0
profile: STANDARD
ui_system: 4.0.0
blocking_snapshot: 419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7
retana_ui:
  sha: 33438d12520bbf9fe18ebc87f29df2a3122d02b6
  registry_source: git-sha
spec_changelog:
  - version: 1.0.0
    origin: builder
    note: "Spec de despacho escrita por el builder sobre el código del head 6cdabab074a6. Los AC se trasladan de docs/learnings/L-EMIL-choreograph-c8a79627.md y de las pruebas del PR; no hay AC nuevos. Pendiente de la revisión del UI Lead antes del despacho."
states: [filled, stress, reduced, touch-tap, touch-scroll, long-press, "390"]
data_fixture: ui/direction/fixtures/coreografia-touch.yaml
direction:
  mode: visual
  reference_meta: ui/direction/coreografia-touch/reference-meta.yaml
  references:
    - reference_id: REF-cpl-multi-view
      screen_id: multi-view
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-multi-view.md
      sha256: 9514ffea8d5190680dd7f305cef527f572503ae4b79df3c09308da31c72cf91f
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-view-calendar
      screen_id: view-calendar
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-view-calendar.md
      sha256: 754da523fd89a1f663c2ae07c9cd5eac742e6993ca2f535264c8d14ad7033eb5
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-view-timeline
      screen_id: view-timeline
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-view-timeline.md
      sha256: 570dbe1de50f923e8ede0cfd44e8e3f869f65376f2524af2a643b5acec344ba1
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-slide-to-confirm
      screen_id: slide-to-confirm
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-slide-to-confirm.md
      sha256: 80ca99b9ccc9f0e351e81f99fc5b4db105eba9daff6b13e1aa6af1cb066fe26d
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-user-menu
      screen_id: user-menu
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-user-menu.md
      sha256: 0bc16d0fd9e6c709796b75e2a0151faea2bd91078a66079dab023949e352bca4
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-dashboard-analitico-ae
      screen_id: dashboard-analitico-ae
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-dashboard-analitico-ae.md
      sha256: cb5465f4e7cb28522e15e5acb9f32a4f3ef670f7ecb489bfda70adfb5db780dd
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-stagger-reveal
      screen_id: stagger-reveal
      kind: visual
      path: ui/direction/coreografia-touch/ref-cpl-stagger-reveal.md
      sha256: 4a9e4d7c111271c5e5e2af87362ba78e2c6543f4afa7e0fb25151fa98f7ec7e8
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-emil-choreograph
      screen_id: all
      kind: code
      path: ui/direction/coreografia-touch/ref-emil-choreograph.md
      sha256: abaab1811dcf4eea0603477e7c986e4f95992f6ed3056636d515811bbb413094
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
---

# Coreografía de Emil y activación táctil

Perfil STANDARD: el ciclo cambia flujos de interacción táctil (tap, scroll, long-press) en piezas existentes (Interaction flow impact). El UI Lead puede subirlo; no bajarlo (SKILL §2).

Autoría: el builder escribió esta Spec para el despacho, con los AC que ya miden las pruebas del PR. El dueño de la Spec es el UI Lead (SKILL §4): la revisa y la confirma en el sobre. No hay firma de Eduardo ni excepción D2 en este archivo.

## Perfil y estados

- **Profile**: STANDARD
- **States**: filled, stress, reduced, touch-tap, touch-scroll, long-press, 390

Las piezas no tienen `scenes.tsx`. `filled` es la página de ejemplo y `stress` la página de estrés. `reduced` se emula con `prefers-reduced-motion: reduce`. `touch-tap`, `touch-scroll` y `long-press` son gestos táctiles sobre calendario, timeline y slide-to-confirm.

## Criterios de aceptación

Trasladados de las pruebas del PR y de `docs/learnings/L-EMIL-choreograph-c8a79627.md` y `docs/learnings/L-EMIL-touch-activate.md`. Cada AC nombra la prueba que lo mide. No se agregan comportamientos que el código no tenga.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | Un stagger de producto dura menos de 300 ms, con huecos que se achican y cola con tope; el de marketing usa un paso más ancho y también deja de crecer. | Suma de delays < 300 ms; huecos decrecientes; delay máximo acotado. | `__tests__/choreography.test.ts` «keeps a product stagger under 300ms…» y «uses a wider marketing step and still stops growing» |
| AC-2 | El fundido de cambio de vista escala con la diferencia de altura y se acota. | Duración monótona con el delta y dentro del rango. | «scales a view-swap fade with the height delta and clamps it» |
| AC-3 | Las superficies de alta frecuencia aparecen juntas, sin stagger. | Sin `staggerChildren`, `delayChildren`, `stagger(` ni delay por índice en user-menu, command-palette, crm-command-menu, slash-menu, mega-menu, comment-thread, shortcut-recorder y notification-stack. | `__tests__/choreography-lint.test.ts` |
| AC-4 | Las tarjetas AE y los grupos largos de stagger-reveal usan índice con tope y colapsan el delay con reduced motion. | Índice acotado; delay 0 con `prefers-reduced-motion: reduce`. | `__tests__/ae-dashboards.test.tsx` y `__tests__/scroll-motion.test.tsx` (estado `reduced`) |
| AC-5 | En calendario y timeline el primer tap abre, con mouse y con touch. | Un tap quieto abre el evento o la barra al soltar. | `__tests__/multi-view-ui.test.tsx` «opens on the first tap, for a mouse click and a touch tap» y «opens a bar on the first touch tap» (estado `touch-tap`) |
| AC-6 | Un swipe vertical en touch hace scroll y no mueve el evento ni la barra. | Sin `setPointerCapture`; posición sin cambio; `touch-pan-y` en el elemento. | «lets a vertical touch swipe scroll without moving the event» y «…without moving the bar» (estado `touch-scroll`) |
| AC-7 | En touch el arrastre solo empieza tras un long-press. | Antes del retardo (360 ms) no hay arrastre; después sí. | «moves the event after a long-press drag and not before» y «moves a bar only after a long-press drag» (estado `long-press`) |
| AC-8 | slide-to-confirm deja pasar el scroll vertical en touch y conserva el arrastre horizontal. | `touch-pan-y` en el riel; el arrastre horizontal sigue confirmando. | `__tests__/micro-interactions.test.tsx` «lets a vertical touch scroll and keeps horizontal drag for the slider» |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/coreografia-touch/reference-meta.yaml`; mapa de desviaciones en `ui/direction/coreografia-touch/direction-map.md`; fixture E14 en `ui/direction/fixtures/coreografia-touch.yaml`.

- `REF-cpl-multi-view` (visual): `ui/direction/coreografia-touch/ref-cpl-multi-view.md`
- `REF-cpl-view-calendar` (visual): `ui/direction/coreografia-touch/ref-cpl-view-calendar.md`
- `REF-cpl-view-timeline` (visual): `ui/direction/coreografia-touch/ref-cpl-view-timeline.md`
- `REF-cpl-slide-to-confirm` (visual): `ui/direction/coreografia-touch/ref-cpl-slide-to-confirm.md`
- `REF-cpl-user-menu` (visual): `ui/direction/coreografia-touch/ref-cpl-user-menu.md`
- `REF-cpl-dashboard-analitico-ae` (visual): `ui/direction/coreografia-touch/ref-cpl-dashboard-analitico-ae.md`
- `REF-cpl-stagger-reveal` (visual): `ui/direction/coreografia-touch/ref-cpl-stagger-reveal.md`
- `REF-emil-choreograph` (code): `ui/direction/coreografia-touch/ref-emil-choreograph.md`
- Inspiración, no referencia: Emil Kowalski, post sobre activación táctil. Licencia: el post no se reproduce; la regla se parafrasea y no hay código que copiar (ver `docs/learnings/L-EMIL-touch-activate.md`). La URL está en el aprendizaje citado.
- Inspiración, no referencia: Interaction Lab. Licencia: sin licencia abierta visible; descartado como código. La URL está en el aprendizaje citado.

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron imágenes de Dirección. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: las entradas del catálogo siguen una coreografía con tope y las superficies táctiles distinguen tap, scroll y arrastre.
- Benefit: un tap abre al instante, el scroll vertical no mueve eventos y los menús de uso diario no esperan un stagger.
- Sources: CPL `33438d12`; `emilkowalski/skills@c8a79627` skill `/choreograph` (MIT); post de Emil sobre touch (paráfrasis); snapshot ui-system `419ad648`.
- Scope: `registry/lib/motion.ts`, las piezas de `registry/ui/` y `registry/blocks/` del diff, y sus pruebas.
- Checks: AC-1…AC-8; `pnpm test`, `pnpm typecheck:strict-host`, `pnpm registry:build` sin diff y `pnpm build`.
- Stop when: los AC pasan en el head y el status queda en `AUDITORIA`. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin copiar el SKILL.md de Emil, sin código de Interaction Lab, sin reglas nuevas en el hub (las propuestas viven en `docs/learnings/`), sin cambiar el teclado.
