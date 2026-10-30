---
artifact_id: retana-ui-layout-motion.direction-map
owner: builder
spec_version: 1.2.0
head: fe591983055c98509435159dbfd6b63962bd340b
profile: STANDARD
spec_id: retana-ui-layout-motion
ui_system: "4.0.0"
---

# Direction map — retana-ui-layout-motion

No hay imagen generada. `direction.images: none`. `generators_used: []`. La referencia de comportamiento es el texto de las reglas, no un asset.

`reference_id: text:layout-rules` · fuente: reglas del PR #59 · trato: se aplican a #55 sin copiar `number-roll`.

Dependencia de diseño, sin copia: el PR #59 (`cursor/layout-roll-stagger-8c2f`) es la fuente de `DESIGN.md` y de `rules/brand/retana-ui.tokens.json`. Esos dos archivos no están en este árbol y no se vendan con la familia. El tema y los tokens se heredan cuando #59 se mergee.

| Región | reference_id | Qué se construyó | Cita |
| --- | --- | --- | --- |
| Shell, ancho | text:layout-rules#width | Título, descripción e insight en `max-w-[17.5rem]`. El plot sigue el ancho de la celda. | AC-1 · rule:RUI-LAYOUT-WIDTH-001 |
| Shell, borde | text:layout-rules#border | El root no suma anillo ni `shadow-sm`. El vacío es `bg-muted` y espacio, sin `border-dashed`. | AC-2 · rule:RUI-LAYOUT-BORDER-001 |
| Leyenda | text:layout-rules#radius | El chip pasa de `rounded-full` a `rounded-md`. Lo oprimido sigue en `bg-muted`. El swatch no pasa a `bg-primary`. | AC-3 · rule:RUI-RADIUS-001 · rule:RUI-LAYOUT-COLOR-001 |
| Cifra | text:layout-rules#type | `figure` sin aplanar. Entero en `chart-kpi-integer`. Fracción en `text-[0.65em] font-normal text-muted-foreground`. El hint queda en `text-xs`. El rodillo no está: entra con #59. | AC-4 · AC-6 · rule:RUI-TYPE-HIERARCHY-001 |
| Combo | text:layout-rules#motion | Rect de alto fijo, `scaleY` desde la línea de base. La inactiva va en `var(--muted)` con trazo. El mini usa `scaleY` y `origin-bottom`. | AC-3 · AC-5 · rule:RUI-MOTION-CONTINUITY-001 |
| Columnas | text:layout-rules#motion | `scaleY` por tramo. La key ya no lleva el periodo, así el tramo que sigue interpola. Fuerte solo la serie o la columna en curso. El nombre va en `<title>`. | AC-3 · AC-5 |
| Iso | text:layout-rules#motion | `scaleY` entre el valor viejo y el nuevo. Fuerte solo la barra en curso. El resto en muted con el trazo punteado. La etiqueta activa es `font-medium`. El selector conserva `max-w-40`. | AC-3 · AC-5 · rule:RUI-LAYOUT-WIDTH-001 |
| Plan | text:layout-rules#motion | El relleno ocupa el ancho y anima `scaleX` con `origin-left`. Pista `bg-muted`, relleno `bg-primary`. Con menos movimiento, sin transición. | AC-5 · AC-7 · rule:RUI-LAYOUT-COLOR-001 |
| Gauge | text:layout-rules#motion | El grupo usado es `scaleX` desde la izquierda. Los tramos se reparten con flex, sin animar `width`. Fuerte solo el segmento señalado. El absoluto sigue en el hint. | AC-3 · AC-4 · AC-5 |
| Área | text:layout-rules#motion | Entrada con `scaleX` y opacidad, origen a la izquierda. Sin `clipPath`. El delta es `emphasis=quiet`, más chico que el total. | AC-4 · AC-5 |
| Carriles | text:layout-rules#motion | El tramo es `translate` + `scaleX` sobre el eje medido. Sin selección, cada carril usa su token. Al elegir uno, el resto pasa a `var(--muted-foreground)`. La etiqueta queda fuera del trazo. | AC-3 · AC-5 |
| Polar y panal | text:layout-rules#color | La serie o el gajo no elegido pasa a muted. El centro es `text-foreground`, sin otro primario. La entrada polar sigue en opacity y scale. El panal conserva `max-w-sm`. | AC-1 · AC-3 · AC-5 |
| #59 | text:layout-rules | No hay copia de `number-roll`. El cambio de rodillo queda anotado en el cuerpo del PR. | spec:non_goals |
| Diseño y tokens | pr:59#DESIGN.md | `DESIGN.md` y `rules/brand/retana-ui.tokens.json` se citan como dependencia de #59. No se copian a esta rama. | spec:non_goals |
