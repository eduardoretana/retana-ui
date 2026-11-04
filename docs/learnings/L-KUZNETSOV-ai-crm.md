# L-KUZNETSOV-ai-crm

- **Fuente:** Maxim Kuznetsov, https://x.com/disarto_max/status/2117664457862033627. Los videos de referencia son la interacción observada (enrutador de modelos y base de conocimiento). No se publicó código.
- **Licencia:** sin licencia, solo idea. Clean-room: layout, interacción, motion y estilo visual. No se copió código, datos de ejemplo, iconos ni assets.
- **Fecha:** 2026-11-04.
- **ui-system:** snapshot `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0. Los ids viven en `knowledge/rules.yaml` (el archivo todavía dice semilla 3.4.1; 4.0.0 no retira esas reglas). `rules/*.md` es prosa sin ids.

## Costo mezclado y cost-waterfall

`cost-waterfall` se construye en otra rama. Su core puro de pricing es inyectable: precio por 1M de tokens de input, output, cache read y cache write, con moneda configurable (USD/MXN).

`model-router` no importa esa rama y no dibuja el costo por paso. El blend por 1K está aislado en `registry/lib/model-router-cost.ts` (`blendCostPer1k`). Solo pondera partes que el anfitrión ya expresó por 1K. Es el candidato a delegar en ese core cuando se mergee: el anfitrión (o el core) entrega un `amountPer1k` y esta función sigue mezclando shares.

El formato es `Intl.NumberFormat` vía `formatRouterAmount({ locale, currency })`. Los montos ya vienen en esa moneda. La pieza no convierte USD ↔ MXN.

## Variantes

### Enrutador

| Variante | Qué hace | Decisión |
| --- | --- | --- |
| A. Diagrama de tráfico + tabla | El reparto se ve y se lee. La tabla es la alternativa textual. | **Elegida.** Cubre el contrato y WCAG. |
| B. Una tarjeta por modelo | Mejor en 390 px, peor para comparar p95 y precio. | Descartada. |
| C. Solo el preset, sin sliders | Menos estado, no cumple el share editable. | Descartada. |

El respaldo se ordena con botones y flechas, sin drag. Un asa con long-press (RUI-TOUCH-001) no aporta en una cadena corta. El slider de share usa `touch-pan-y` para ceder el scroll vertical.

### Base de conocimiento

La pieza vive en su propio PR. La variante elegida es ilustración que se arma con las fuentes conectadas, lista de estados y odómetro. Una tabla sola no cumple la ilustración. Un kanban por estado no es el flujo de ingesta.

## Comparación con ui-system 4.0.0

| Regla | Cita | Relación con estas piezas | Veredicto |
| --- | --- | --- | --- |
| RUI-TOKEN-001 | `rules.yaml` L17 | No hay tokens de color propios ni conversión hex↔OKLCH. | **Ya cubierto.** La pieza no trae tema. |
| RUI-RADIUS-001 | L28 | Solo `rounded-xl`, `rounded-lg`, `rounded-md`, `rounded-full`. | **Cumple.** |
| RUI-ELEV-001 | L46 | `shadow-sm` de la escala del anfitrión. | **Cumple.** |
| RUI-TYPE-001 | L56 | Utilidades `text-*` de Tailwind. Sin `--text-*` propio. | **Cumple.** |
| RUI-HEIGHT-001 | L67 | Botones y selects en la altura del primitivo (`h-8`). No se desalinea un control. | **Cumple**, con deuda: el primitivo mide 32 px, por debajo de los 44 px recomendados en `layout.md` L12. |
| RUI-DARK-001 | L76 | No se declara modo oscuro de marca. El demo usa los semánticos del anfitrión. | **No aplica** a la pieza. El sitio demo ya tiene tema. |
| RUI-CONTRAST-001 | L88 | Texto sobre `bg-card` / `text-foreground` y `text-muted-foreground`. | **Hereda el host.** No se midió un par nuevo. |
| UIS-COVERAGE-001 | L89 | Estrés en `/examples/model-router/stress`. | **Cumple** en la página de estrés. |
| UIS-LAYOUT-001 | L90 | La tabla y el diagrama hacen scroll dentro de la pieza. | **A verificar** en captura a 390 px. |
| UIS-LAYOUT-002 | L91 | La demo no fuerza `scrollY`. | **No aplica** al componente. |
| UIS-CONSOLE-001 | L92 | Sin `console.error` en la pieza. | **Cumple** en código. |
| UIS-DESIGN-001 / TOKENMAP / DONT / PRESET | L94–L97 | Ciclo de marca del hub, no de una pieza de registry. | **No aplica.** |
| UIS-COMP-ISP-001 | L99 | `ModelRouter` pasa de 10 props. El contrato pedido (policy, deploy, locale, currency, estados) no cabe en el umbral. | **Deuda.** La regla está `deferred`. |
| UIS-COMP-OCP-001 | L100 | No se copia ni edita otra pieza `@retana/*`. El slider del demo reenvía `aria-label` al thumb. | **Cumple** en registry. El ajuste del slider es del primitivo local del catálogo. |
| UIS-COMP-DIP-001 | L101 | Sin `@supabase` ni `fetch` en la pieza. | **Cumple.** |
| UIS-COMP-DIP-002 | L102 | Fixtures y la página de estrés cubren los puertos. | **Cumple.** Regla `deferred`. |
| UIS-REFACTOR-001…003 | L104–L106 | No es un fix de reglas de negocio previas. | **No aplica.** |
| UIS-YAGNI-001 | L108 | `blendCostPer1k` tiene prueba y un solo llamador hoy. Existe para no mezclar el core de cost-waterfall aquí. | **Aceptado.** El aislamiento es el encargo. |
| UIS-YAGNI-002 | L109 | No hay factory nueva. | **No aplica.** |
| UIS-YAGNI-003 | L110 | La pieza es del catálogo, no un candidato con un solo uso de host. | **No aplica.** |
| UIS-KISS-001 | L111 | `currency` y `locale` los usa la demo. | **Cumple.** |
| UIS-CATALOG-GAP-001 | L113 | Se reusan segmented-control, status-pill, empty-state, table, slider, select, switch. | **Cumple.** |
| RUI-CONTRACT-001 | L115 | `contracts/model-router.contract.ts` fija tipos, shares, fallback y el blend local. | **Cumple** como contrato de la familia. No sustituye otra pieza. |
| RUI-ANIM-PERF-001…007 | L117–L123 | `anim_perf_lint` en los archivos de la pieza: exit 0. Partículas con `transform` (`x`/`y`) y opacidad. Sin `transition-all`. Sin `setState` por frame. | **Cumple.** |
| RUI-TOUCH-001 | Propuesta en `docs/learnings/L-EMIL-touch-activate.md` (PR #68, no está en el hub) | El slider declara `touch-pan-y`. El respaldo no arrastra. | **Cumple** el eje del scroll. El thumb sigue siendo el del primitivo. |
| `rules/a11y.md` L9 | Objetivo ≥ 24 px | El thumb del primitivo es 12 px con `after:-inset-2` (área ~28 px). Botones de icono `size-8` (32 px). | **Cumple** AA. 44 px queda como recomendación. |
| `rules/a11y.md` L10 | Reduced motion | Sin partículas si `prefers-reduced-motion` o `MotionConfig`. | **Cumple.** |
| `rules/layout.md` L12 | Táctil ≥ 44 px | No se sube el botón del host a 44 px (RUI-HEIGHT-001). | **Deuda conocida.** |
| `rules/copy.md` | Verbo + objeto, es-MX y EN separados | «Desplegar política» / «Deploy policy». El idioma no se mezcla en una misma superficie: lo elige `labels`. | **Cumple.** |
| `rules/tokens.md` | Semánticos, `tabular-nums`, truncado | `bg-card`, `text-muted-foreground`, cifras tabulares, `truncate` con `title`. | **Cumple.** |

## Reglas propuestas

No hace falta un id nuevo para el blend: el candidato es una función, no una regla del hub. RUI-TOUCH-001 sigue propuesto en el aprendizaje de Emil y no se duplica aquí.

Si el core de cost-waterfall publica un puerto, la sustitución queda así (no se escribió en el hub):

```yaml
- id: RUI-PRICE-001
  title: "El precio por token vive en un solo core; el router solo mezcla partes por 1K"
  description: >-
    Un enrutador no calcula tarifas de input, output, cache read ni cache write.
    Recibe un monto por 1K ya expresado en la moneda del anfitrión y lo pondera
    por el share. El formato es Intl.NumberFormat con locale y currency.
    Cuando existe el core de cost-waterfall, ese monto sale de ahí.
  severity: minor
  category: arquitectura
  check: manual
  origin:
    source: "Coordinación con cost-waterfall, 2026-11-04. Sin código de esa rama."
    date: 2026-11-04
  status: proposed
```

## Deuda conocida

- El primitivo `slider` del catálogo reenvía `aria-label` al thumb. Un host con el slider de shadcn sin ese reenvío deja el thumb sin nombre; la pieza igual pasa `aria-label`.
- Altura de control 32 px, no 44 px.
- `ModelRouter` supera las 10 props de UIS-COMP-ISP-001 (deferred).
- Las partículas se dibujan como translate en línea recta de tres puntos, no como un flujo muestreado por frame.
