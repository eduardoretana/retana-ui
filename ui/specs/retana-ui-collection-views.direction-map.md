---
artifact_id: direction-map-retana-ui-collection-views
owner: lead
spec_version: 0.1.0
head: 8cfdaf29c71d087391da72a6176449a82faec02f
profile: STANDARD
spec_id: retana-ui-collection-views
ui_system: "4.0.0"
reference_id: desdivj-collection-views
source_url: https://x.com/desdivj/status/2115772554199867776
license: no publicada / clean-room
---

# Direction map

Una sola pantalla, tres regiones de vista. La imagen no entra al bundle.

| Región | reference_id | Qué se conserva | Desviación y cita |
| --- | --- | --- | --- |
| Píldora | desdivj-collection-views | Se traslada y cambia de ancho. El texto activo es el de primer plano. | Se reutiliza `segmented-control`. Su resorte sigue en `motionPresets.spring.morph` (0.42 s, bounce 0.16). No se forkea. Cita: `catalog:segmented-control`, `spec:non_goals`. |
| Tablero | desdivj-collection-views | Columnas que contienen tarjetas. Título y avatares viven en la tarjeta. | Sin barra lateral de producto. Cita: `spec:non_goals`. El fondo de columna es `bg-muted/70` y se apaga con opacidad. Cita: `rule:RUI-ANIM-PERF-001`. |
| Lista | desdivj-collection-views | La tarjeta se vuelve fila. El encabezado de columnas aparece. | Bajo 36 rem del contenedor el encabezado no se muestra y los campos se apilan. Cita: `AC-LAYOUT-001`, `wcag:1.4.10`. |
| Cronograma | desdivj-collection-views | La fila ocupa cerca del 30 % a la izquierda. La barra crece en X. Una máscara recorta el carril. | `COLLECTION_TIMELINE_SIDEBAR` es 0.3. El crecimiento es `scaleX`, no `width`. Cita: `AC-MORPH-003`, `rule:RUI-ANIM-PERF-002`. |
| Color | desdivj-collection-views | Un solo acento marca lo activo. | Primario solo en la barra que cubre `today` y en el control ya activo del host. El resto usa `muted-foreground`. Cita: `spec:brand_constraints`, `rule:RUI-COLOR-001`. |
| Movimiento reducido | desdivj-collection-views | La vista cambia sin recorrer el layout. | Fundido de opacidad de 0.2 s, sin `layoutId`. Cita: `AC-REDUCED-001`. |
| Encuadre | desdivj-collection-views | Nada del encuadre. | Zoom, blur y cámara quedan fuera. Cita: `spec:non_goals`. |

El ejemplo es Taller Lumen, inventado. No se usan nombres, fotos ni colores de la referencia.
