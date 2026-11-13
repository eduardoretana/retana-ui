# map-browser · spec y ciclo de calidad

- spec_id: `map-browser` · perfil **STANDARD** (Interaction flow: SÍ) · ui-system 4.0.0
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

## 5. review-animations y animation-performance

| Elemento | Antes | Después | Por qué |
|---|---|---|---|
| Pin activo | — | `translateY(-4px)` 150 ms ease-out + anillo; nada con reduced | causa-efecto entre tarjeta y pin, de alta frecuencia, corto |
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
