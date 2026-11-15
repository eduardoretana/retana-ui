---
spec_id: piloto-vue
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
    note: "Spec de despacho escrita por el builder sobre el código del head 4476214dbabe. Los AC se trasladan de docs/plans/plan-piloto-vue.md y de las pruebas del PR; no hay AC nuevos. Pendiente de la revisión del UI Lead antes del despacho. Rev. 2 (revisión del UI Lead, 2026-11-15): se agrega AC10, el reenvío de las etiquetas del lightbox que ya hacen 4f44233a y 470588b8 y que ya miden sus pruebas; no hay comportamiento nuevo. La Spec y el reference-meta se fijan en el mismo commit."
states: [filled, empty, loading, error, zero, pending, answered, folded, "390"]
data_fixture: ui/direction/fixtures/piloto-vue.yaml
direction:
  mode: visual
  reference_meta: ui/direction/piloto-vue/reference-meta.yaml
  references:
    - reference_id: REF-cpl-time-off-stats
      screen_id: time-off-stats
      kind: visual
      path: ui/direction/piloto-vue/ref-cpl-time-off-stats.md
      sha256: b47b1a798f3edbc6b053ac1aa82928ee58fdfc141a01c77711e80db3bb2bd31f
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-decision-inbox
      screen_id: decision-inbox
      kind: visual
      path: ui/direction/piloto-vue/ref-cpl-decision-inbox.md
      sha256: dda4cf9be5d00c5422db71ac4289531fc6b7adbbe7a6b02774f9e2863182d60a
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
    - reference_id: REF-cpl-lightbox
      screen_id: lightbox
      kind: visual
      path: ui/direction/piloto-vue/ref-cpl-lightbox.md
      sha256: f8ab547dddee4a3aca9c227ce79a79817c98a67e84dce5a7c4fff16328c1c555
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      status: current
---

# Piloto Vue: tokens DTCG y tres piezas

Perfil STANDARD fijado por VibeBot (UI Lead), que lo subió desde LITE (`docs/plans/plan-piloto-vue.md` §9).

Autoría: el builder escribió esta Spec para el despacho, con los AC que ya miden las pruebas del PR. El dueño de la Spec es el UI Lead (SKILL §4): la revisa y la confirma en el sobre. No hay firma de Eduardo ni excepción D2 en este archivo.

## Perfil y estados

- **Profile**: STANDARD
- **States**: filled, empty, loading, error, zero, pending, answered, folded, 390

Estados de AC2 y AC8 del plan (`docs/plans/plan-piloto-vue.md` §6). `zero` y `pending` son de `time-off-stats`; `answered` y `folded`, de `decision-inbox`.

## Criterios de aceptación

AC0…AC9 trasladados de `docs/plans/plan-piloto-vue.md` §6. El texto de la medida queda igual; la columna Criterio lo resume. AC10 lo pidió el UI Lead en su revisión: documenta el reenvío de etiquetas que el PR ya hace (`4f44233a`, `470588b8`) con sus pruebas existentes. No hay comportamiento nuevo.

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC0 | El contrato de nombres de tokens es el mismo en Tailwind, DTCG, CSS, puente Vuetify y C#. | Diff vacío en los dos sentidos entre `@theme inline` y los `tailwind` del DTCG. Cada nombre de `:root` aparece en `contract.css`, `bridge.css` y `RetanaTokenNames.cs`. Alias y puente sin `oklch(`, hex ni `rgb(` literal. `demo.css` con los oklch de `:root` y `.dark`, sin `.ae-ember` ni `.review-preview`. `registry/` no importa `demo.css`. | `ui-tests/piloto-vue.test.ts` |
| AC1 | Las props y callbacks del SFC Vue son los de `meta.api`. | Nombres de `meta.api` presentes en el SFC. Lista de llamadas de `decision-inbox`: `onAnswer("anticipo", "hoy")` y `onDismiss(...)`, igual que `formatSceneCall`. | lectura del SFC y `vue/tests/parity.test.ts` |
| AC2 | React y Vue pintan los mismos estados desde el mismo JSON. | `filled`, `empty`, `loading`, `error` (y `zero`, `pending`, `answered`, `folded`) salen del mismo JSON. `loading` tiene nombre accesible. `error` tiene `role="alert"` donde React ya lo tiene. | fixtures y `vue/tests/parity.test.ts` |
| AC3 | El color se hereda por variables sin recompilar. | Con la hoja compilada, cambiar `--primary` cambia el fondo de un botón `rt:bg-primary`. `.dark` redefine variables; el SFC no usa `dark:`. | `tokens/fixture-primary.html` en el navegador |
| AC4 | El lightbox atrapa y devuelve el foco. | Al abrir, el foco entra. Tab no sale. Escape cierra. El foco vuelve al botón que abrió. El título accesible es el `alt`. | `vue/tests/browser.test.ts` |
| AC5 | Cada opción de `decision-inbox` es un botón con nombre y la respuesta se anuncia. | Cada choice es un botón con nombre accesible. Activarlo deja `aria-live="polite"` con el texto de respuesta. | parity y navegador |
| AC6 | La vista Razor de `time-off-stats` no usa JS. | `hosts/razor/TimeOffStats.cshtml` sin `<script`. Muestra filled, empty y error. `loading` es HTML estático. | lectura del archivo y axe del HTML |
| AC7 | El registry y el build siguen en verde y Vue no entra al registry. | `pnpm test`, `pnpm registry:build` y `pnpm build` pasan. `validateRegistryTree` sin errores. `registry.json` no declara frameworks. Dependencias nuevas solo en `vue/package.json` `devDependencies`. | CI existente |
| AC8 | Accesibilidad y desborde en claro, oscuro, es-MX, EN y 390. | axe serious y critical = 0 en claro y oscuro, React y Vue, es-MX y EN, viewport 390. `scrollWidth` no pasa de 1 px el ancho. Con `prefers-reduced-motion: reduce` el esqueleto tiene `animation-name: none`. | `vue/tests/browser.test.ts` |
| AC9 | La nota de gestos nombra las librerías y el SFC no las importa. | `docs/vue/gestos.md` nombra motion-v 2.11.1 MIT, vaul-vue 0.4.1 MIT, `@formkit/drag-and-drop` 0.7.0 MIT y `@vueuse/gesture` inactivo. `vue/src` no importa esos paquetes. | lectura |
| AC10 | `LightboxGallery` reenvía al lightbox las etiquetas de cerrar, anterior, siguiente y zoom. | Con `closeLabel`, `previousLabel`, `nextLabel`, `zoomInLabel` y `zoomOutLabel` tomados de `fixtures/lightbox.json` (es-MX: Cerrar, Anterior, Siguiente, Acercar, Alejar), al abrir la galería los cinco botones tienen ese nombre accesible; con solo `closeLabel="Cerrar"`, el botón de cerrar se llama Cerrar. El SFC Vue declara las mismas cinco props. | `__tests__/lightbox.test.tsx` («pone el nombre accesible del closeLabel en el botón de cerrar» y «pone los cinco nombres accesibles de es-MX cuando se pasan a LightboxGallery»); `ui-tests/piloto-vue.test.ts` (`AC1-LIGHT-closeLabel`, `-previousLabel`, `-nextLabel`, `-zoomInLabel`, `-zoomOutLabel`) |

## Dirección

Por referencia (`direction.mode: visual`). Detalle y sha256 en `ui/direction/piloto-vue/reference-meta.yaml`; mapa de desviaciones en `ui/direction/piloto-vue/direction-map.md`; fixture E14 en `ui/direction/fixtures/piloto-vue.yaml`.

- `REF-cpl-time-off-stats` (visual): `ui/direction/piloto-vue/ref-cpl-time-off-stats.md`
- `REF-cpl-decision-inbox` (visual): `ui/direction/piloto-vue/ref-cpl-decision-inbox.md`
- `REF-cpl-lightbox` (visual): `ui/direction/piloto-vue/ref-cpl-lightbox.md`

La referencia visual es la UI vigente de cada pieza en CPL `33438d12` (Anti-Slop `mode=preserve`). No se generaron imágenes de Dirección. La elección de la referencia en STANDARD es del UI Lead.

## Brief

- Outcome: un host Vue 3 + Vuetify, sin Tailwind, pinta tres piezas de retana-ui y hereda el color por variables; Razor pinta `time-off-stats` sin JS.
- Benefit: el catálogo deja de ser solo React sin reescribir las piezas ni publicar un tema.
- Sources: plan multiframework, validación de gestos, snapshot ui-system `419ad648`, token-map de CENIT en `eduardoretana/canal-semilla@f93d7781` (solo lectura).
- Scope: `tokens/`, `vue/`, `fixtures/`, `catalog/retana.catalog.json`, `hosts/razor/`, `docs/plans/`, `docs/vue/`, `ui/`, `ui-tests/` y los `fixtures.ts`/`scenes.tsx` de las tres piezas.
- Checks: AC0…AC10; `pnpm test`, `pnpm registry:build` y `pnpm build` en verde; axe serious y critical en cero.
- Stop when: los AC pasan en el head del PR y el status queda en `AUDITORIA`. Sin autoauditoría.
- Deliverable: PR borrador contra CPL. Sin merge, sin deploy, sin paquete npm, sin PR en canal-semilla.

## Non-goals

Las otras piezas, drag, Liveblocks, Supabase, `layered-panel`, publicar npm, editar `registry.json`, abrir PR en canal-semilla, código de gestos, autoauditoría.
