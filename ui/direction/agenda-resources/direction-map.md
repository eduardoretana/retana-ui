# direction-map — agenda-resources · spec 0.1.1

Base de código: H = el commit que añade este archivo sobre `9682d29ba97c8f3fd5fabf34318bf7351318f7cc` (el código no cambia en ese commit).
Referencias: `REF-cpl-agenda`, `REF-shadcnstudio-user-schedule-05`. Fichas y sha256 en `ui/direction/agenda-resources/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de la tabla «Criterios de aceptación» de `ui/specs/agenda-resources.spec.md` (sha256 con prefijo `3828b62c695e`; el sha256 completo va en el sobre, para que fixture_lint no lo lea como teléfono).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648` (blob f16049b5).

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Encabezado y navegación | REF-cpl-agenda | título, rango, flechas y cambio de vista | igual; con `resources` se suman el filtro «Recurso» y el conteo de choques | sí, se agrega | `AC-2`; `AC-4` |
| R2 Día y semana sin recursos | REF-cpl-agenda | cuadrícula de fechas | igual; `data-resource-layout=off` | no | `AC-1` |
| R3 Día con recursos | REF-cpl-agenda | no existe | una columna por recurso con `columnheader`; scroll horizontal dentro de la cuadrícula | sí, se agrega | `AC-2`; idea de `REF-shadcnstudio-user-schedule-05` (sin copia); `rule:UIS-LAYOUT-001` |
| R4 390 px | REF-cpl-agenda | cuadrícula estrecha | lista con encabezado por recurso | sí | `AC-3`; `rule:UIS-LAYOUT-001` |
| R5 Tarjeta del evento | REF-cpl-agenda | título y hora | más «Choque con …» con icono `aria-hidden` | sí, se agrega | `AC-4`; `wcag:1.4.1` |
| R6 Cupo | REF-cpl-agenda | no existe | resumen «4 h de 3 h», «1 h de más»; 12 fichas cerradas, «Ver los 30» | sí, se agrega | `AC-6`; `AC-7`; `rule:RUI-CONTRAST-001` (19.8:1 claro, 17.2:1 oscuro) |
| R7 Tema | REF-cpl-agenda | tema del anfitrión | igual; cero tokens nuevos, sin animación nueva | no | `AC-8`; `rule:RUI-TOKEN-001` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta + sha256 en las fichas).
