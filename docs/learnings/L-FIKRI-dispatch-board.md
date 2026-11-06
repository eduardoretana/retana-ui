# L-FIKRI-dispatch-board

- **Fecha:** 2026-11-06
- **Pieza:** `dispatch-board`
- **Base de la rama:** `cursor/agenda-resource-schedule-fca1` @ `159cffae` (PR #67, aún no está en CPL)
- **Fuente:** Fikri Studio, «User Diary & Scheduling», https://x.com/bagus_fikri/status/2117889633367515181
- **Licencia:** sin licencia, solo idea. Clean-room. Cero copia de markup, copy, colores, iconos o datos. El ejemplo es la cooperativa inventada Campo Norte.
- **ui-system:** snapshot hub@`419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, VERSION 4.0.0. El hub no se toca.

## Decisión

Pieza hermana, no `view="dispatch"`.

| Variante | Veredicto |
|---|---|
| A. Vista nueva dentro de `Agenda` | No. El eje es el inverso y el modelo (habilidad, ausencia, cola, estado extensible) no cabe en el contrato de la agenda. |
| B. `dispatch-board` llama a `findResourceConflicts` y `resourceLoads` | **Sí.** El segundo uso reutiliza esas funciones. No hay un motor nuevo. |
| C. Extraer un timeline compartido | No. Un solo llamador nuevo. YAGNI. |

## Reglas del ui-system

| Regla | Veredicto |
|---|---|
| RUI-TOKEN-001, RUI-DARK-001, RUI-ELEV-001, RUI-HEIGHT-001, UIS-DESIGN-001, UIS-TOKENMAP-001, UIS-REFACTOR-*, UIS-YAGNI-003, UIS-CATALOG-GAP-001 | No aplica: no hay tokens propios ni refactor de otra pieza. |
| RUI-RADIUS-001, RUI-TYPE-001, RUI-ANIM-PERF-001…007 | Cumple. Sin `transition-all`, sin layout animado. El arrastre escribe `transform` y no hace `setState` por frame. |
| RUI-CONTRAST-001, a11y «no solo color» | Cumple. Estado, choque, ausencia y ocupación tienen palabra. El anillo es extra. |
| UIS-LAYOUT-001, layout móvil | Cumple. El scroll horizontal vive en el tablero. Bajo 768 px la cola es un sheet. |
| UIS-COMP-OCP-001, UIS-COMP-DIP-001 | Cumple. Primitivos por `registryDependencies`. Sin Supabase. |
| UIS-COMP-ISP-001 | Excepción: el contrato del anfitrión (modelo, rango, tres callbacks, filtros) pasa de 10 props. Partirlo no tiene un segundo uso. |
| RUI-CONTRACT-001 | No sustituye a `agenda`. El test de familia exige que el solape y la suma sigan en el núcleo de la agenda. |
| RUI-CONFLICT-001 (propuesta del #67) | Se aplica: palabra «Choque» y conteo que enfoca. |
| RUI-TOUCH-001 (propuesta del #68) | Se aplica. Tap abre, long-press de 360 ms arrastra, swipe hace scroll. El scroller usa `pan-x` y `pan-y` porque las horas también se desplazan. |

## Propuestas

`RUI-OCCUPANCY-001`: la ocupación muestra número y palabra. Los umbrales son datos mapeados a tonos semánticos.

`RUI-ASSIGN-001`: un drop inválido dice el motivo, no llama al anfitrión, y un rechazo del anfitrión revierte la vista previa. El mismo camino vale para arrastre, menú y teclado.

## Deuda

- El diff contra CPL incluye el #67 hasta que ese PR entre.
- La tarjeta densa cumple 24 px, no los 44 px recomendados. La barra y la cola sí.
- Falta la pasada de capturas en claro y oscuro.
