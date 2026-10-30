---
spec_id: retana-ui-idea448b
version: 1.0.0
head: 0235da2ac2a16970fee70848911a51737cf7a4e8
spec_changelog:
  - version: 1.0.0
    origin: brief
    note: "IDEA-448 B. Perfil LITE sobre CPL. ui-system 4.0.0."
profile: LITE
brief:
  outcome: "En móvil los 11 controles nativos no hacen zoom, el toque no pinta el recuadro gris, el viewport cubre el safe area y los 11 theme toggles no rebotan."
  benefit: "Quien usa el catálogo en un teléfono puede leer y enfocar esos controles sin que iOS acerque la página, y el movimiento se asienta sin overshoot."
  sources: "IDEA-448, cola 1 del 2026-10-30, y la aprobación de Eduardo del mismo día. mobile-native (MIT, ya vendorizada en el hub) solo como idea. impeccable 4.8.0 solo como detector."
  scope: "Los 11 controles citados, el tap-highlight en app/globals.css, viewportFit en app/layout.tsx y las curvas de registry/ui/theme-toggles."
  checks: "Vitest del contrato, Playwright WebKit a 390 px, impeccable detect, lint, tsc y build."
  stop_when: "Esos comandos en verde, bounce-easing en 0, capturas antes y después a 390 px, y el PR draft contra CPL."
  deliverable: "El diff de código en este PR más los artefactos de este ciclo. ui-system 4.0.0."
scope_paths:
  - registry/blocks/crm.tsx
  - registry/blocks/onboarding.tsx
  - registry/blocks/pipeline-board.tsx
  - registry/ui/candidate-detail.tsx
  - registry/ui/json-viewer.tsx
  - registry/ui/parameter-slider.tsx
  - registry/ui/view-calendar.tsx
  - registry/ui/theme-toggles/eclipse.tsx
  - registry/ui/theme-toggles/expand.tsx
  - registry/ui/theme-toggles/inner-moon.tsx
  - registry/ui/theme-toggles/light-switch.tsx
  - registry/ui/theme-toggles/simple.tsx
  - registry/ui/theme-toggles/within.tsx
  - app/globals.css
  - app/layout.tsx
  - __tests__/mobile-inputs.test.ts
  - tests/mobile/inputs.spec.ts
users:
  - "Quien abre el catálogo en un teléfono y edita una celda, una fecha o el buscador JSON."
  - "Quien cambia el tema con los iconos de theme-toggles."
states:
  - idle
  - editing
  - empty
  - error
  - loading
  - success
  - partial
  - overflow
  - i18n_long
  - pending
  - offline
  - rollback
  - permission_denied
data:
  - "Cartera: Taller Bruma, responsable Inés Quesada, valor 48000 MXN."
  - "Tablero: filtros Desde y Hasta vacíos, locale es-MX."
  - "Hoja inferior: Carga del horno, abierta."
  - "Eclipse: reposo, mitad del movimiento y asentado."
brand_constraints:
  - "Sin tema propio. Solo clases semánticas del host."
  - "ui-system 4.0.0. No se usan reglas de 4.1.0 porque esa versión no está mergeada."
  - "Dirección heredada. Este perfil LITE no genera imágenes."
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
components:
  retana:
    - input
    - button
  candidates_local: []
  retana_ui_layer: VERIFIED
visual_risk: low
copy:
  locale:
    - es-MX
    - en
  voice: "El copy de las demos no cambia."
direction:
  mode: inherited
  images: none
  reference_id: inherited-host-theme
non_goals:
  - "Reglas RUI-MOBILE en el hub (eso es IDEA-448 A)."
  - "Radios (IDEA-450)."
  - "Rediseñar theme-toggles o reescribir la transición de d del clip."
  - "iPhone real."
  - "Merge a CPL."
  - "Veredicto de auditoría (lo da otro agente)."
acceptance:
  - id: AC-1
    statement: "Los 11 controles nativos miden al menos 16 px a 390 px."
    measure: "getComputedStyle(input).fontSize >= 16 en WebKit, viewport 390×844, por debajo del quiebre md."
    test: "tests/mobile/inputs.spec.ts › los 11 controles nativos miden al menos 16 px"
  - id: AC-2
    statement: "El tap-highlight es transparente y el foco del input sigue visible."
    measure: "El computed de -webkit-tap-highlight-color en html es transparent o rgba(0, 0, 0, 0). El input enfocado tiene outline o box-shadow distintos de none."
    test: "tests/mobile/inputs.spec.ts › el viewport cubre el safe area y el foco sigue visible"
  - id: AC-3
    statement: "El viewport del documento usa viewport-fit cover."
    measure: "El meta name=viewport contiene viewport-fit=cover, width=device-width e initial-scale=1."
    test: "tests/mobile/inputs.spec.ts › el viewport cubre el safe area y el foco sigue visible"
  - id: AC-4
    statement: "El zoom del usuario no se bloquea."
    measure: "El export viewport no tiene maximumScale ni userScalable. El meta no contiene maximum-scale ni user-scalable=no."
    test: "__tests__/mobile-inputs.test.ts › exporta viewport-fit cover sin bloquear el zoom"
  - id: AC-5
    statement: "impeccable no reporta bounce-easing y el movimiento respeta reduced-motion."
    measure: "npx impeccable@4.8.0 detect --json registry components app cuenta bounce-easing = 0. Las seis piezas usan cubic-bezier(0.22,1,0.36,1), motion-safe y no contienen transition-all."
    test: "__tests__/mobile-inputs.test.ts › usa la curva sin overshoot y conserva reduced-motion"
  - id: AC-6
    statement: "La suite, el typecheck y el build siguen en verde."
    measure: "pnpm test sale 0 con al menos las pruebas de la base. pnpm exec tsc --noEmit, pnpm lint y pnpm build salen 0."
    test: "pnpm test. El log no vive en el árbol: el gate lo recibe por --suite-log y debe declarar el HEAD del PR."
  - id: AC-7
    statement: "axe no marca serious ni critical en los controles de este ciclo."
    measure: "Axe sobre el input de la cartera, el textarea de onboarding, las fechas, el formulario de cita, la búsqueda JSON, el slider, el mes, la hoja y eclipse: cero serious y cero critical."
    test: "tests/mobile/inputs.spec.ts › axe no marca serious ni critical en los controles de esta IDEA"
---

# IDEA-448 B — ajustes móviles

## Outcome

Once controles que en CPL medían 14 px pasan a 16 px por debajo de `md`. El documento declara `viewport-fit: cover` y apaga el tap-highlight sin quitar el anillo de foco. Los once theme toggles dejan la curva con overshoot.

## Benefit

En un teléfono el foco de esos controles no dispara el zoom de iOS, y el icono de tema se asienta sin rebote.

## Sources

IDEA-448 y la cola 1 del 2026-10-30. La versión de ui-system de este ciclo es **4.0.0**. ui-auditor 1.2.5 está admitido para LITE con esa versión. La 4.1.0 no está mergeada y no se declara aquí.

## Scope

El diff de código de este PR. No entran radios, ni reglas nuevas del hub, ni piezas que el detector marca como side-tab o border-accent.

## Checks

`pnpm test`, `pnpm exec playwright test`, `npx impeccable@4.8.0 detect --json registry components app`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## Stop when

Esos comandos están en verde en el sha evaluado, bounce-easing es 0 y hay capturas antes y después a 390 px. Nadie mergea.

## Deliverable

Código ya en la rama, más este Spec, el status, el direction-map, el fixture, el build-log y `rules/rules.yaml`.

## Estados

| Estado | Qué cubre este ciclo |
| --- | --- |
| idle | Controles en reposo. Eclipse sin pulsar. Hoja abierta en su alto de partida. |
| editing | Celda de la cartera, valor del slider e invitación del onboarding. |
| empty | Fechas Desde y Hasta vacías. |
| error | El tablero ya tiene estado de error. Este diff no lo cambia. |
| loading | Sin estado de carga nuevo. |
| success | La cartera guarda al salir de la celda. Sin flujo nuevo. |
| partial | En 390 px los filtros del tablero están cerrados hasta pulsar «Mostrar filtros». |
| overflow | El nombre largo de la cartera se trunca en la celda, igual que antes. |
| i18n_long | Etiquetas es-MX de las demos (Desde, Hasta, Agendar). |
| pending | No hay petición de red nueva. |
| offline | No cambia. |
| rollback | La cartera ya puede deshacer una edición. No se toca. |
| permission_denied | `readOnly` ya existía. No se toca. |

## Dirección

Heredada del tema del catálogo. Perfil LITE: no hay tablero ni variantes de imagen. Ver `ui/direction/retana-ui-idea448b/direction-map.md`.
