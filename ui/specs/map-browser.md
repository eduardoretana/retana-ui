---
artifact_id: spec-map-browser
owner: lead
spec_id: map-browser
version: 1.0.0
profile: STANDARD
states: [filled, empty, loading, error, nomatch, map-error, cluster, selected, hover, overflow, i18n_long]
direction:
  mode: visual
  references:
    - {reference_id: REF-propxyz-browse, screen_id: map-browser, path: ui/direction/map-browser/ref-propxyz-browse.png, sha256: 2de484fd8069ede6bf38f369cc0c724310c0869f947edc41e59234ec0140838e, status: current, valid_for_spec_version: "1.0.0"}
    - {reference_id: REF-propxyz-detail, screen_id: map-browser, path: ui/direction/map-browser/ref-propxyz-detail.png, sha256: e8d0c28f7005cc982e78643ddd3c15b8194a10eaa76dc1b65e36a5cb51dc4eee, status: current, valid_for_spec_version: "1.0.0"}
data:
  fixture: ui/direction/fixtures/map-browser.yaml
---

# map-browser · spec y ciclo de calidad

- spec_id: `map-browser` · ui-system 4.0.0 · Interaction flow: SÍ
- **Profile**: STANDARD
- **States**: filled, loading, error, nomatch, map-error, cluster, selected, hover, empty
- Decisión: Eduardo, "Si hazlo end to end" (2026-11-13). Fuente del brief: fase 1 (veredicto ADAPT).
- Constructor: Retana UI · Design Engineer. Auditor: pendiente (no es el constructor).

## 1. Preguntas (Emil) y respuestas

| Pregunta | Respuesta |
|---|---|
| ¿Quién la usa y cuántas veces al día? | Quien busca entre decenas o cientos de lugares (sucursales, propiedades, puntos de entrega). Muchas veces al día: el hover y la selección no pueden tener animaciones largas. |
| ¿Qué es lo primero que hay que ver? | El conteo y la lista. El mapa ayuda a ubicar; nunca es la única vía. |
| ¿Dónde vive el filtrado? | En el anfitrión (`places` ya filtrados + `total`). La pieza no sabe qué es un precio. |
| ¿Qué pasa sin WebGL o sin red? | La lista sigue sola; el mapa dice "No se pudo mostrar el mapa. La lista sigue disponible." |
| ¿Qué se anima y por qué? | Solo lo que explica causa y efecto: el pin que sube cuando su tarjeta tiene hover o foco, y el panel que entra desde el mapa. La cámara salta con reduced motion. |
| ¿Quién paga los tiles? | El anfitrión. La pieza no trae proveedor; CARTO queda como helper documentado con su tope y su atribución. |

## 2. Matriz de estados

| Estado | Escena | Lista | Mapa | Prueba |
|---|---|---|---|---|
| filled | `filled` | 16 tarjetas, "16 resultados" | 16 pines | MB-SYNC-HOVER, CONTRACT-API |
| loading | `loading` | 5 skeletons, "Cargando resultados" | skeleton | MB-STATES |
| error | `error` | empty-state + Reintentar | atenuado | MB-STATES |
| empty | `empty` | "Aún no hay lugares." | vista inicial | MB-STATES, CONTRACT-STATES |
| nomatch | `nomatch` | "Ningún resultado con estos filtros." + Limpiar filtros | sin pines | MB-STATES, CONTRACT-STATES |
| map-error | `map-error` | sigue funcionando | aviso en la región | MB-MAP-ERROR |
| selected | `selected` | `aria-current` | pin con anillo + panel o sheet | MB-SELECT, MB-DETAIL |
| hover | `hover` | tarjeta con `data-active` | pin activo | MB-SYNC-HOVER |
| cluster | `cluster` | 120 tarjetas | burbujas "N resultados, acercar" | MB-CLUSTER |
| overflow / i18n | stress | 0, 1, 500, textos de 60 caracteres sin espacio, 390, EN, RTL | clúster con 500 | break-ui |

## 3. Tres variantes de layout y elección

Capturas en la evidencia (`variants/overlay|split|stacked-{1280,390}.png`), renderizadas con la pieza real y `classNames`.

| Variante | Qué es | A favor | En contra |
|---|---|---|---|
| A · overlay | lista flotante sobre el mapa a sangre (como la referencia) | mapa grande, look de producto | el panel de detalle tapa la lista; la lista tapa pines; pide vidrio (RUI-GLASS-001 pendiente); a 390 no cabe |
| **B · split** | lista a la izquierda (18–24rem) y mapa a la derecha; detalle flotante dentro del mapa | lista y detalle visibles a la vez; la lista, que es la fuente accesible, nunca queda tapada; orden de lectura = orden visual | el mapa es más angosto |
| C · stacked | mapa arriba y lista abajo a todo el ancho | natural en móvil | en escritorio desperdicia ancho y el mapa queda bajo |

**Elegida: B desde 48rem del propio ancho de la pieza y C por debajo** (container query, no viewport, para que funcione dentro de un sheet o de una miniatura del catálogo). A 390 el detalle abre en el `BottomSheet` modal existente (v1), con `detents=[0.5, 0.92]`.

## 4. break-ui (navegador real, red externa bloqueada)

| Caso | Resultado |
|---|---|
| 0 lugares | `empty`, 0 pines, sin overflow |
| 1 lugar | 1 tarjeta, 1 pin |
| 500 lugares | 500 tarjetas; mapa con 1 pin + clústeres que suman 499 (Σ = 500, AC-3) |
| Texto largo (60 "N" sin espacio) a 390 | **Encontrado:** overflow horizontal de 262 px en layout apilado (la columna implícita del grid medía el min-content). **Arreglado** con `grid-cols-[minmax(0,1fr)]`. Ahora sin overflow |
| Teclado | 1 tab stop en pines; flechas siguen el orden de la lista y el mapa no se desplaza; Enter abre detalle; **Encontrado:** Escape solo cerraba con el foco dentro del panel. **Arreglado:** Escape se maneja en la raíz y el foco vuelve al pin de origen |
| Red lenta (400 ms, 500 kbit/s) a 390 | lista visible en DCL (~2.7 s, SSR); skeleton del mapa mientras carga; mapa en idle a ~28 s (maplibre + worker ≈ 450 KB gz) |
| Pin seleccionado debajo del panel | **Encontrado:** el panel tapaba el pin elegido. **Arreglado:** `revealInset` lleva la cámara con offset cuando el pin queda bajo el panel o fuera de vista |
| Mapa encogido al montar | **Encontrado:** el encuadre inicial se calculaba antes de medir. **Arreglado:** `resize()` + `fitBounds` en `load` y `ResizeObserver` |
| Stress con detalle abierto en 390 | el sheet es modal; abrirlo al cargar bloqueaba los demás casos. El stress ya no preselecciona |
| Capturas (harness 21db9481, 07e04e4): selección inicial | **Encontrado:** `scrollIntoView` de la tarjeta elegida también desplazaba la página del anfitrión (~22 px en 1280 y 390; el encabezado quedaba cortado). **Arreglado** en 6311f9c: solo se desplaza el contenedor de la lista (`data-map-browser-scroll`). Prueba MB-SCROLL-LOCAL |
| Capturas: pin activo y seleccionado | **Encontrado:** el anillo usaba `--ring` (gris medio); en dark casi no se distinguía del pin normal y con reduced motion era la única señal del hover sincronizado. **Arreglado** en 6311f9c: `ring-foreground` (contraste con el fondo del mapa en ambos temas). Prueba MB-PIN-CONTRAST |

## 5. review-animations y animation-performance

| Elemento | Antes | Después | Por qué |
|---|---|---|---|
| Pin activo | — | `translateY(-4px)` 150 ms ease-out + anillo `foreground`; con reduced solo el anillo | causa-efecto entre tarjeta y pin, de alta frecuencia, corto |
| Panel de detalle | — | `x: 16 → 0` + opacidad, 240 ms `ease.enter`; solo opacidad con reduced | entra desde el mapa, sin escala |
| Tarjeta hover | `transition-colors` | sin transición | se repite cientos de veces al día; el color cambia al instante y no se animan colores |
| Cámara | `easeTo` 400 ms | `duration: 0` con reduced | maplibre respeta reduced motion; la pieza también lo hace explícito |
| Canvas | — | `transition-opacity` 200 ms al pasar de loading a idle | evita el destello del canvas vacío |

`anim_perf_lint` 0.1.0 (hub PR #323 @dfa2b8b7) sobre los 5 archivos de la pieza: **pass, 0 señales**. No hay `transition-all`, ni propiedades de layout, ni `box-shadow` animado, ni `will-change` propio (maplibre pone `will-change: transform` en `.maplibregl-marker`, que es transform).

## 6. Desviaciones del brief

1. `clusterPlaces` (JS) no existe: el clúster es el nativo de maplibre (`cluster: true` en la fuente GeoJSON) y la pieza solo dibuja los botones DOM (`markersFrom`, `renderedCount`). Sin supercluster.
2. `cartoProvider` no está en `registry/lib`: AC-8 prohíbe URLs de cartocdn en `registry/**`, así que va como helper documentado en `docs/map-browser.md`.
3. `MapStyle` acepta además una función `(token) => style`, para que los colores del canvas salgan de tokens.
4. La atribución es texto plano y no tiene enlaces, así que no recibe foco (AC-9 lo pedía "si hay enlaces").
5. El layout cambia por el ancho de la pieza (container query, 48rem), no por el viewport.
6. En el layout apilado el mapa va arriba visualmente y la lista primero en el DOM: la lista es la fuente accesible y el mapa es complementario.
7. `pnpm tokens` no existe en CPL (solo en `vue/` de #86/#88). La verificación de tokens es `registry:build` (`validate-registry.ts`) + `anim_perf_lint` + grep.

## 7. Criterios de aceptación (measure + test)

Traídos sin cambios del brief de fase 1 (§4).

| AC | Measure | Test |
|---|---|---|
| AC-1 Sincronía de hover y foco | con hover o foco en la tarjeta *i*, el pin *i* tiene `data-active="true"` en ≤ 1 frame, y al revés; solo hay un activo a la vez | Playwright `hover`/`focus` en las dos direcciones + RTL `fireEvent.pointerEnter` con maplibre mockeado |
| AC-2 Selección única | clic o Enter en el pin o en la tarjeta → los dos con `aria-current="true"`/`data-selected`; se llama `onSelectedChange(id)` una vez; la tarjeta queda visible en el scroll (`getBoundingClientRect` dentro del contenedor) | Vitest + Playwright |
| AC-3 Filtros en vivo | si el host cambia `places`, el número de pines + Σ `point_count` de los clústeres es igual al de tarjetas, en el mismo commit de React | Vitest (helpers) + Playwright con `filter-toolbar` real |
| AC-4 Clúster | con más de 50 lugares (o `cluster: true`), los pines cercanos se agrupan; el clúster es un `<button>` con nombre "N resultados, acercar" y con Enter o clic hace zoom a la expansión | Vitest `clusterPlaces` + Playwright |
| AC-5 Detalle responsive | a 1280 px el detalle es un panel lateral de ≤ 400 px sin tapar la lista; a 390 px es `BottomSheet` con `detents=[0.5,0.92]`; Esc o cerrar devuelve el foco al pin o tarjeta de origen | Playwright perfiles desktop y touch; `document.activeElement` |
| AC-6 Estados | las 6 escenas PLP (filled, empty, nomatch, loading, error, map-error) se renderizan con su copy; `viewState` devuelve el estado correcto para las 5 combinaciones | Vitest tabla + capturas del harness |
| AC-7 Atribución | el texto `provider.attribution` es visible (no colapsado, no `display:none`, dentro del viewport) a 390 y 1280, con contraste ≥ 4.5:1; un `attribution` vacío lanza error | Playwright + axe `color-contrast` + Vitest |
| AC-8 Proveedor configurable | `registry/**` no tiene ninguna URL de cartocdn, maptiler ni unpkg; el demo y el harness corren con la red externa bloqueada (`page.route('**', abort)` salvo localhost) y cero requests fuera | grep en CI + Playwright `request` listener = 0 externos |
| AC-9 Teclado | Tab llega a la lista (un tab stop), al grupo de pines (un tab stop, roving con flechas en el orden de la lista), a los controles de zoom y a la atribución; Enter selecciona; Esc cierra el detalle | Playwright keyboard |
| AC-10 Anuncios | después de cambiar filtros, `role="status"` dice "N resultados" una sola vez (debounce de 300 ms) y no repite el anuncio de `filter-toolbar` | Vitest + Playwright (texto del live region) |
| AC-11 Targets | los pines y clústeres tienen un área táctil ≥ 24 px (RUI-TOUCH-001) y ≥ 44 px en el perfil touch, o bien un aviso explicado | harness RUI-TOUCH |
| AC-12 Tokens | 0 hex, rgb u oklch en `registry/`; los pines usan `bg-primary`/`bg-chart-n`/`ring-background`; el contraste del pin contra el fondo del mapa es ≥ 3:1 (WCAG 1.4.11) en claro y oscuro | `registry:build` + `contrast_pairs` |
| AC-13 Motion | solo se animan `transform` y `opacity`; `anim_perf_lint` limpio; con `prefers-reduced-motion` la cámara salta (`duration: 0`) y no hay escalas | `anim_perf_lint` + Playwright `emulateMedia({reducedMotion})` |
| AC-14 Carga y peso | maplibre se carga con `import()` solo en cliente; con slow-3g la lista y su conteo se ven en DCL+1000 ms y el mapa muestra el skeleton; el bundle del primer render no trae maplibre | harness slow-3g + reporte de `next build` |
| AC-15 jsdom | la suite de Vitest pasa sin WebGL (con `vi.mock("maplibre-gl")`) | `pnpm test` |
| AC-16 Licencias | NOTICE con "MIT License · Copyright (c) 2025 Anmoldeep Singh" (MapCN) y el aviso BSD-3-Clause de MapLibre; `docs` del item dice "PropXYZ: referencia clean-room, no se copió código ni assets" | revisión + test de que NOTICE contiene las líneas |
