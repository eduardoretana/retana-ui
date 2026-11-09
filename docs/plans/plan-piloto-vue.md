# Plan Sprint — Piloto Vue: tokens DTCG y tres piezas

- spec_id: `piloto-vue`
- version: 1.0.0
- perfil: LITE
- retana_ui.sha: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- ui_system: 4.0.0
- base: rama `CPL`, commit `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- PR: borrador contra `CPL`. Sin merge, sin deploy, sin paquete npm.

## 1. Brief

| Campo | Texto |
|---|---|
| Outcome | Un host Vue 3 + Vuetify, sin Tailwind, puede pintar tres piezas de retana-ui y heredar el color por variables. Un host con Tailwind usa el mismo contrato. Razor pinta `time-off-stats` sin JS. |
| Benefit | El catálogo deja de ser solo React sin reescribir las 422 piezas ni publicar un tema. |
| Sources | Plan multiframework (CPL `6671cfac`), validación de gestos, guía ui-system, snapshot `419ad648`, `rules/brand/cenit.tokens.json` y `ui/specs/cenit-paleta.token-map.md` de canal-semilla. |
| Scope | `tokens/`, `vue/`, `fixtures/`, `catalog/retana.catalog.json`, `hosts/razor/`, `docs/plans/`, `docs/vue/`, `ui/status/`, `ui-tests/`, y los `fixtures.ts` / `scenes.tsx` de las tres piezas para leer el JSON compartido. |
| Checks | AC0–AC9 de la sección 6. `pnpm test`, `pnpm registry:build` y `pnpm build` en verde. axe serious y critical en cero. |
| Stop when | Los AC pasan en el head del PR y el status queda en `AUDITORIA`. No se autoaudita. |
| Deliverable | PR borrador. Evidencia de capturas y logs por ruta y sha256, fuera del commit de predispatch. |

## 2. Decisiones D1–D7

Quedan como las recomendaciones de la sección 9 del plan de lectura. Eduardo las autorizó al arrancar el piloto.

| Id | Decisión | Cómo quedó |
|---|---|---|
| D1 | Runtime | SFC de Vue 3 escritos a mano. Sin Lit, sin Mitosis, sin Web Components. |
| D2 | Overlay | `lightbox`. `layered-panel` queda fuera: arrastra `next/navigation`. |
| D3 | Tokens | Contrato de nombres obligatorio. Valores demo opt-in. Style Dictionary. Nada de paleta dentro de `registry/`. |
| D4 | Dónde se anota Vue | Manifiesto `retana.catalog/v1`. `registry.json` no gana un campo. |
| D5 | Razor | Solo HTML estático de `time-off-stats`. `lightbox` se prueba en Vue. |
| D6 | Dónde vive el código | Carpeta `vue/` de este repo, fuera de `files` del registry. Sin paquete publicado. |
| D7 | Gate | Contrato, axe y lista de llamadas. Capturas como evidencia. Sin umbral de píxeles. |

Hecho posterior, también de Eduardo: la app viva es `eduardoretana/canal-semilla` en `f93d77813207c979758cab3270f17ba7bac07694`. `app-aldo-pensiones` no es la app viva. No se abre PR en ese repo.

Eso afina D1 y D3, no los cambia:

- El host no tiene Tailwind ni shadcn-vue. Tiene Vue `^3.5.42`, Vuetify `^3.13.5`, `vite-plugin-vuetify`, `@mdi/font`, Pinia y Vue Router 5. Vite 8, Vitest 5, TypeScript `~6.0`.
- El backend .NET está en `api/src/Tramo.Canal.*`. Este piloto no lo toca.
- Los primitivos entran por slot o por un interno mínimo. No se exige shadcn-vue.
- Los iconos entran por slot o por una clase (`@mdi/font`). La pieza no importa `lucide`.
- La hoja compilada lleva prefijo `rt:` y no incluye el preflight de Tailwind, para no pisar `vuetify/styles` ni las clases `v-*` ni utilidades `bg-primary` de Vuetify.
- `tokens/bridge.css` es opt-in: traduce `--v-theme-*` a los nombres del contrato. No se importa desde la app.

## 3. Arquitectura

```
tokens/retana.tokens.json     DTCG. Nombres del contrato. $value = demo oklch del sitio, no la marca CENIT.
tokens/contract.css           Nombres que el host debe definir. Sin color.
tokens/demo.css               Opt-in. oklch de :root y .dark. Sin .review-preview ni .ae-ember.
tokens/tailwind-alias.css     @theme inline, solo alias var(--*). Sin literales.
tokens/bridge.css             Opt-in Vuetify. rgb(var(--v-theme-*)). Sin hex.
tokens/RetanaTokenNames.cs    Constantes de cadena. Sin valores.
tokens/fixture-primary.html   Un botón rt:bg-primary. Cambiar --primary cambia el color sin recompilar.

vue/src/<pieza>/*.vue         SFC. Clases rt:*. Raíz .retana.
vue/dist/pilot.css            Hoja compilada. Solo var(--*). Prefijo rt:. Sin preflight.
vue/demo/                     VApp de Vuetify con los hex del token-map. Solo aquí hay hex de marca.
vue/preview/                  Escenas React y Vue para axe y capturas.

fixtures/<pieza>.json         Textos es y en. Una sola copia.
catalog/retana.catalog.json   retana.catalog/v1
hosts/razor/TimeOffStats.cshtml
docs/vue/gestos.md            Equivalencias. Sin código de gestos.
```

El generador es `vue/scripts/build-tokens.mjs`. Importa Style Dictionary 5.8.0 (Apache-2.0). Lee `app/globals.css` para que el diff de nombres quede vacío y escribe el JSON y las cuatro salidas más el puente.

## 4. Contrato de nombres

Los nombres son los de `:root` en `app/globals.css` y los de `color.light` / `color.dark` en el DTCG de CENIT, sin el grupo `canal.*` (ese grupo es de la bandeja, no del registry).

Un host sustituye `$value` y conserva la clave. CENIT usa hex. El demo de este repo usa oklch. Ninguno de los dos entra en `registry/`.

### 4.1 Puente Vuetify

Vuetify 3.13.5 (`packages/vuetify/src/composables/theme.ts`, tag `v3.13.5`) hace, para cada color del tema:

```
--v-theme-<clave>: <r>,<g>,<b>
```

Son canales RGB separados por coma, sin espacios y sin la función `rgb()`. El propio Vuetify los consume como `rgb(var(--v-theme-<clave>))`. El prefijo por defecto es `v-`. Las variables del tema que no son color (por ejemplo `medium-emphasis-opacity`) salen como `--v-<nombre>`.

El token-map de CENIT no es 1:1 con el nombre. El puente sigue esa tabla:

| Contrato | Valor en `bridge.css` | Nota del token-map |
|---|---|---|
| `--background` | `rgb(var(--v-theme-background))` | fondo de página |
| `--foreground` | `rgb(var(--v-theme-on-background))` | texto |
| `--card`, `--popover` | `rgb(var(--v-theme-surface))` | superficie; popover = card |
| `--card-foreground`, `--popover-foreground` | `rgb(var(--v-theme-on-surface))` | texto de superficie |
| `--primary`, `--ring` | `rgb(var(--v-theme-primary))` | primario; el foco es el primario |
| `--primary-foreground` | `rgb(var(--v-theme-on-primary))` | texto sobre primario |
| `--muted` | `rgb(var(--v-theme-serie-pista))` | pista de gráfica |
| `--muted-foreground` | `rgb(var(--v-theme-secondary))` | el `secondary` de Vuetify es este rol, no el `secondary` de RETANA |
| `--destructive` | `rgb(var(--v-theme-error))` | peligro |
| `--chart-1` | `rgb(var(--v-theme-serie-agente))` | serie |
| `--chart-2` | `rgb(var(--v-theme-serie-humana))` | serie |
| `--chart-3` | `rgb(var(--v-theme-serie-neutra))` | serie |
| `--sidebar` | `rgb(var(--v-theme-barra))` | barra y riel |
| `--sidebar-foreground` | `rgb(var(--v-theme-on-barra))` | texto de la barra |
| `--sidebar-primary` | `rgb(var(--v-theme-senal))` | señal |
| `--sidebar-primary-foreground` | `rgb(var(--v-theme-on-senal))` | texto sobre la señal |
| `--border` | `rgba(var(--v-theme-on-surface), 0.12)` | hueco: Vuetify pinta el borde de tarjeta al 12 % |
| `--input` | `rgba(var(--v-theme-on-surface), 0.5)` | hueco: campo al 50 % |
| `--sidebar-accent` | `rgba(var(--v-theme-on-barra), 0.16)` | hueco: papel al 16 % sobre la tinta |
| `--secondary` | `rgb(var(--v-theme-retana-secondary))` | hueco: no es `--v-theme-secondary` |
| `--secondary-foreground` | `rgb(var(--v-theme-on-retana-secondary))` | hueco |
| `--accent` | `rgb(var(--v-theme-retana-accent))` | hueco |
| `--accent-foreground` | `rgb(var(--v-theme-on-retana-accent))` | hueco |
| `--chart-4` | `rgb(var(--v-theme-chart-4))` | hueco: la semilla no lo registra hoy |
| `--chart-5` | `rgb(var(--v-theme-chart-5))` | hueco |
| `--sidebar-border` | `rgb(var(--v-theme-sidebar-border))` | el host lo añade si quiere el rol |
| `--sidebar-accent-foreground`, `--sidebar-ring` | `rgb(var(--v-theme-on-barra))` | en CENIT coinciden con el papel de la barra |
| `--radius` | `var(--retana-radius, 0.5rem)` | Vuetify 3.13 no emite un `--v-theme-*` de radio. 0.5rem son 8 px, el radio de tarjeta que cita el token-map. No es un color. |

La demo de `vue/demo/` registra en el tema de Vuetify los colores del token-map, incluidos los huecos, para que el puente se vea. Esos hex no salen de esa carpeta.

## 5. Piezas

| Pieza | React | Vue | Razor |
|---|---|---|---|
| `time-off-stats` | ya en CPL; el fixture pasa a JSON | SFC con slot `skeleton` | HTML estático: filled, empty, error y loading |
| `decision-inbox` | igual | SFC con slots `badge`, `choice`, `dismiss`, `skeleton`, `answered-icon` | no |
| `lightbox` | sin PLP en el registry; el piloto añade escenas locales, sin tocar `registry.json` | Dialog de reka-ui. Slots de icono | no |

Props de `meta.api` con el mismo nombre. `onAnswer(id, choiceId)` y `onDismiss(id)` se anotan con `formatSceneCall`. Iconos: prop `answeredIcon`, `previousIcon`, `nextIcon`, `closeIcon`, `zoomInIcon`, `zoomOutIcon` (clase MDI) o el slot homónimo. Si no hay ninguno, un SVG mínimo propio, no un path de Lucide.

Animación: solo `transform` y `opacity`. Nada de `transition-all` ni de `transition` sin propiedad. `prefers-reduced-motion` apaga el pulso y la transición del zoom.

Idioma: `es` en el JSON es copy es-MX (`lang="es-MX"`). `en` es inglés. El default del componente sigue siendo el inglés, como en React.

## 6. Criterios de aceptación

Cada uno tiene medida y prueba. La prueba vive en `ui-tests/piloto-vue.test.ts` y, donde hace falta el navegador o el mount, en `vue/tests/`.

| Id | Medida | Prueba |
|---|---|---|
| AC0 | Diff vacío, en los dos sentidos, entre las custom properties de `@theme inline` y los `tailwind` del DTCG. Cada nombre de `:root` tiene entrada DTCG y aparece en `contract.css`, `bridge.css` y `RetanaTokenNames.cs`. El alias y el puente no tienen `oklch(`, hex ni `rgb(` de color literal (el puente usa `rgb(var(--v-theme-*))`, que es referencia, no un canal escrito). `demo.css` tiene los oklch de `:root` y `.dark` y no los de `.ae-ember` ni `.review-preview`. `registry/` no importa `demo.css`. | `ui-tests/piloto-vue.test.ts` |
| AC1 | Los nombres de `meta.api` están en el SFC. La lista de llamadas de `decision-inbox` es `onAnswer("anticipo", "hoy")` y `onDismiss(...)`, igual que `formatSceneCall`. | lectura del SFC + `vue/tests/parity.test.ts` |
| AC2 | `filled`, `empty`, `loading`, `error` (y `zero`, `pending`, `answered`, `folded`) salen del mismo JSON en React y en Vue. `loading` tiene nombre accesible. `error` tiene `role="alert"` donde React ya lo tiene. | fixtures + parity |
| AC3 | Con la hoja compilada, cambiar `--primary` cambia el fondo de un botón `rt:bg-primary` sin recompilar. `.dark` redefine variables; el SFC no usa `dark:`. | `tokens/fixture-primary.html` en el navegador |
| AC4 | Al abrir el lightbox el foco entra. Tab no sale. Escape cierra. El foco vuelve al botón que abrió. El título accesible es el `alt`. | `vue/tests/browser.test.ts` |
| AC5 | Cada choice es un botón con nombre accesible. Activarlo deja `aria-live="polite"` con el texto de respuesta. | parity + navegador |
| AC6 | `hosts/razor/TimeOffStats.cshtml` no tiene `<script`. Muestra filled, empty y error. `loading` es HTML estático. | lectura del archivo + axe del HTML |
| AC7 | `pnpm test`, `pnpm registry:build` y `pnpm build` pasan. `validateRegistryTree` no reporta errores. `registry.json` no declara frameworks. Las dependencias nuevas están solo en `vue/package.json` `devDependencies`. | CI existente + AC7 |
| AC8 | axe serious y critical = 0 en claro y oscuro, React y Vue, es-MX y EN, viewport 390. `scrollWidth` no pasa de 1 px el ancho. Con `prefers-reduced-motion: reduce` el esqueleto tiene `animation-name: none`. | `vue/tests/browser.test.ts` |
| AC9 | `docs/vue/gestos.md` nombra motion-v 2.11.1 MIT, vaul-vue 0.4.1 MIT, `@formkit/drag-and-drop` 0.7.0 MIT y `@vueuse/gesture` inactivo. `vue/src` no importa esos paquetes. | lectura |

No hay umbral de píxeles. Las capturas (React junto a Vue, anchos de `sceneSizePx` y 390) son evidencia, no un gate.

## 7. Pruebas antes del build

`ui-tests/expected-red.yaml` y el log `ui-tests/logs/expected-red.log` salen de un commit anterior al código. Cada `it` falla con su firma. Un verde en ese commit invalidaría la fase.

## 8. Fuera de alcance

Las 29 piezas fáciles. Órganos, tablas, drag, Liveblocks, Supabase, `layered-panel`. Publicar npm. Editar `registry.json`. Abrir PR en canal-semilla. Instalar el registry dentro de la app. `shadcn init` o un preset. Código de gestos. Autoauditoría.

## 9. Perfil

LITE. No hay flujo nuevo en la app: son tres piezas que ya existen en React y un contrato de nombres. La dirección se hereda (ley 7: el host trae el tema). No se generan imágenes. El Auditor, cuando VibeBot lo despache, puede subir el perfil; este plan no lo baja después.

## 10. Hechos, supuestos, preguntas abiertas

Van en el cuerpo del PR, separados. Aquí solo el ancla: el sha de retana-ui de este plan es `6671cfac72f736739d2d3dd2740cc5f13416acb3`. El DTCG de CENIT cita `832737290b0374d20db27e8963549267880b020b` (`Merge pull request #50`). Es un commit anterior de este repo. Este piloto no reescribe ese archivo en la app.
