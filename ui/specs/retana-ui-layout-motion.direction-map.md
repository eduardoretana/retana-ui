---
artifact_id: retana-ui-layout-motion.direction-map
owner: builder
spec_version: 1.0.0
head: 0d966603d6ef0b3adc27a50e5996a7d2235cbe3f
profile: STANDARD
spec_id: retana-ui-layout-motion
ui_system: "4.0.0"
---

# Direction map — retana-ui-layout-motion

No hay imagen generada. `direction.images: none`. `generators_used: []`. La referencia de comportamiento es el texto clean-room, no un asset.

`reference_id: text:jakub-transitions` · fuente https://x.com/jakubantalik/status/2115844862012768541 · licencia: no hay licencia de reutilización · trato: clean-room.

| Región | reference_id | Qué se construyó | Cita |
| --- | --- | --- | --- |
| Galería, anchos | text:jakub-transitions#width | Columna `max-w-[390px]`. El sí mide `max-w-[17.5rem]`. El no ocupa el ancho del marco. | AC-1 · rule:RUI-LAYOUT-WIDTH-001 · spec:brand_constraints · token:typography.sans |
| Galería, bordes | text:jakub-transitions#border | El no usa `border`. El sí usa `bg-muted`, `gap-2` y `shadow-sm`. El envío es `bg-primary` con `rounded-lg`, no un círculo. | AC-2 · rule:RUI-LAYOUT-BORDER-001 · rule:RUI-RADIUS-001 · token:colors.muted · token:colors.primary · token:rounded.lg |
| Galería, color | text:jakub-transitions#color | Una barra `bg-primary`. El resto `bg-muted`. El día activo también va en `font-medium` (`aria-current=date`). | AC-3 · rule:RUI-LAYOUT-COLOR-001 · wcag:1.4.1 · token:colors.primary · token:colors.muted · token:colors.muted-foreground |
| Saldo | text:jakub-transitions#type | `NumberRoll` con `hierarchy`. Entero `font-medium` en `colors.foreground`. Fracción `text-[0.65em] font-normal` en `colors.muted-foreground`. | AC-4 · AC-6 · rule:RUI-TYPE-HIERARCHY-001 · token:colors.foreground · token:colors.muted-foreground · token:typography.sans |
| Desviación de tipo | text:jakub-transitions#type | La fracción usa `em` del entero. El tema no trae un peldaño de tamaño: `typography.sans` solo fija `fontFamily`. | spec:brand_constraints · rule:RUI-TYPE-001 · token:typography.sans · catalog-gap: no hay token de «fracción de la misma cifra» |
| Lista | text:jakub-transitions#motion | `StaggerList` con `y` y `opacity`. Tope 0.4 s. Ease de `motionPresets.ease.enter` y `ease.exit`, sin rebote. | AC-5 · AC-9 · AC-10 · rule:RUI-MOTION-CONTINUITY-001 · rule:RUI-ANIM-PERF-001 · rule:RUI-ANIM-PERF-002 |
| Contador ya publicado | text:jakub-transitions#motion | `AnimatedCounter` deja de animar `width`. El valor es `NumberRoll` con `announce={false}` para no duplicar el nombre accesible. | AC-8 · spec:non_goals |
| Aviso de error | text:jakub-transitions#color | `role=alert` en `text-foreground`, no en `text-destructive`. El rojo del tema de demo no llega a 4.5:1 sobre blanco. | AC-12 · wcag:1.4.3 · rule:RUI-CONTRAST-001 |
| #55 y #56 | text:jakub-transitions | No hay diff. La lista de cambios queda en el PR, fuera de estos archivos. | spec:non_goals |
