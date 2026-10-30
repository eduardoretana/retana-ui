---
artifact_id: retana-ui-idea448b.direction-map
owner: builder
spec_version: 1.0.0
head: fe428f3d4b31a63a51196e4c1016349ebdcf7d75
profile: LITE
reference_id: inherited-host-theme
---

# Direction map — retana-ui-idea448b

Perfil LITE. La dirección se hereda del tema de demostración (`app/globals.css`, `app/layout.tsx`). No hay imágenes nuevas: `direction.images: none`. `reference_id: inherited-host-theme`.

| Región | reference_id | Cita | Desviación |
| --- | --- | --- | --- |
| Input de empresa, responsable y valor en `registry/blocks/crm.tsx` | inherited-host-theme | AC-1, token: `text-base md:text-sm` | Ninguna. Misma caja, mismo anillo `focus-visible:ring-ring`. |
| Textarea de invitaciones en `registry/blocks/onboarding.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| Fechas Desde y Hasta en `registry/blocks/pipeline-board.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| Tipo de cita y fecha en `registry/ui/candidate-detail.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| Búsqueda en `registry/ui/json-viewer.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| Valor en `registry/ui/parameter-slider.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| Mes en `registry/ui/view-calendar.tsx` | inherited-host-theme | AC-1 | Ninguna. |
| `html` en `app/globals.css` | inherited-host-theme | AC-2, wcag: 2.4.7 | Se añade `-webkit-tap-highlight-color: transparent`. No se quita el outline del foco. |
| `viewport` en `app/layout.tsx` | inherited-host-theme | AC-3, AC-4, wcag: 1.4.4 | `viewportFit: cover`. Sin `maximumScale`. |
| Curvas en `registry/ui/theme-toggles/*` | inherited-host-theme | AC-5, rule: RUI-ANIM-PERF-001 | La curva con overshoot pasa a `cubic-bezier(0.22, 1, 0.36, 1)`. Sigue `motion-safe`. La transición de `d` del clip ya estaba; no es una región nueva. |
| Suite, typecheck y build | inherited-host-theme | AC-6 | Ninguna región visual. `pnpm test` sale 0, y también `pnpm exec tsc --noEmit`, `pnpm lint` y `pnpm build`. El log no vive en el árbol: el gate lo recibe por `--suite-log` y ese archivo declara el HEAD del PR. |
| Pulgar de `parameter-slider` | inherited-host-theme | AC-7, rule: RUI-ANIM-PERF-003 | `aria-label` y `aria-valuetext` están en el thumb con `role=slider`. El anillo está en `::before` con la sombra ya puesta y solo anima su opacidad; el color sigue en `transition-[color]`. El foco se ve. axe-core 4.13.0 en claro y oscuro. |
| Filas de `json-viewer` | inherited-host-theme | rule: RUI-ANIM-PERF-002 | Alto fijo, sin animar `height` ni `grid-template-rows`. Al abrir: opacidad y un `translateY` corto. Al cerrar: solo opacidad y luego se desmonta. Con reduced-motion la duración es 0. |

No hay `catalog-gap`. No hay color literal nuevo en `registry/`.
