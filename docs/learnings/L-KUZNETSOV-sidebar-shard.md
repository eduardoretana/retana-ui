# L-KUZNETSOV-sidebar-shard

- **Fuente:** Maxim Kuznetsov, https://x.com/disarto_max/status/2117664457862033627. El post no trae código ni licencia. La lectura de interacción, layout y motion salió del video subido con el encargo, no del HTML del post.
- **Fecha de revisión:** 2026-11-04.
- **Licencia:** sin licencia, solo idea. Clean-room: no se copió código, copy, iconos, datos de ejemplo ni assets. El demo es Taller Norte (ficticio).
- **ui-system:** snapshot `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0. `knowledge/rules.yaml` sigue etiquetado 3.4.1; el changelog de 4.0.0 no añade ids. La prosa de `rules/*.md` no tiene ids.
- **Pieza:** `sidebar-islands`. El anillo del segundo video no se construye.

## Qué ya había en el catálogo

| Pieza | Qué cubre | Decisión |
| --- | --- | --- |
| `rail-sidebar` | Riel de iconos y panel in-flow sobre el sidebar de shadcn, con hoja que atrapa el foco. | **No se extiende.** La preview por hover no puede ser un dialog ni animar `width`. |
| `tree-nav` | Árbol WAI-ARIA con flechas, Home/End y type-ahead. | **Se compone** en el submenú. `className` aplana el chrome de tarjeta. |
| `workspace-switcher` | Selector de equipo. | **Se compone** en la cabecera de la isla. |
| `user-menu` | Popover de cuenta. | **No se importa.** No compila con `exactOptionalPropertyTypes`. El perfil es un popover propio. |
| `dock-nav` | Barra magnética. | No aplica. |

## Variantes

1. **Extender `rail-sidebar`.** Rechazada. El foco de la hoja y la animación de layout chocan con la preview y con `RUI-ANIM-PERF-002`.
2. **Isla nueva que compone árbol y equipo.** Elegida. Un solo contrato controlado. El anfitrión persiste `collapsed`, `activeId` y `teamId`.
3. **Un dialog por sección.** Rechazada. Un dialog al hover roba el foco. La preview es un `region`.

## Contrato

Familia `navigation`, en `__tests__/navigation.contract.test.tsx`.

- `NavSection` y `NavItem` (hijos, badge, `href` o `onSelect`).
- `collapsed` + `onCollapsedChange`, `activeId` + `onNavigate`, `teamId` + `onTeamChange`.
- Sin persistencia dentro de la pieza.
- Por debajo de 480 px, o con `layout="sheet"`, un tap abre la hoja (`RUI-TOUCH-001`, ya propuesta en el PR #68; aquí se aplica, no se reescribe).

## Matriz de estados

| Estado | Qué se ve |
| --- | --- |
| Lleno | Isla con equipo, búsqueda, badges, informes abiertos y perfil. |
| Vacío | Qué es la navegación y la acción de crear la primera sección. |
| Cargando | Skeleton y `aria-busy`. |
| Error | Qué falló y cómo reintentar. |
| Riel | Iconos, tooltip, preview tras intent delay. El foco no se mueve. Escape cierra. |
| Rol | Secciones `hidden` fuera. Conteos grandes con separador de miles. |

Break-ui en `/examples/sidebar-islands/stress`: 50 ítems, nombre de 60 caracteres, tres niveles, RTL, 320 px, hoja a 390 px, emoji.

## Motion

El ancho visible se recorta con `clip-path`. La preview entra con `transform` y `opacity`. Con reduced motion la transición dura 0. La altura del grupo anidado no se anima. `anim_perf_lint` debe quedar en pass sobre `registry/ui/sidebar-islands.tsx`. `tree-nav` sigue con `grid-template-rows`; este cambio no lo toca.

## Shard ring — veredicto: **discard**

El segundo video es un anillo isométrico de cilindros. El drain baja el relleno en el eje Y y repite el porcentaje que la fila ya muestra. No sirve como vista de capacidad de agentes ni de colas:

- **Valor.** `agent-queue`, `ranked-bars` y `usage-meter` ya dicen quién espera y cuánto cabe, con nombre y número.
- **Accesibilidad.** El vínculo fila–segmento es el color. Drain y tooltip son solo hover.
- **Mantenimiento.** Perspectiva, mallas y drain son una superficie propia sin un segundo uso en el CRM.

No hay contrato ni código para una fase posterior.

## Comparación con ui-system 4.0.0 (`419ad648`)

| Regla | Cita | Veredicto |
| --- | --- | --- |
| RUI-TOKEN-001 | `rules.yaml` L17 | Cumple. Sin color propio. |
| RUI-RADIUS-001 | L28 | Cumple. Solo pasos `rounded-*`. |
| RUI-ELEV-001 | L46 | Cumple. `shadow-md` estático. |
| RUI-TYPE-001 | L56 | Cumple. Sin `--text-*` propio. |
| RUI-HEIGHT-001 | L67 | Cumple. Controles a 44 px (`size-11`). |
| RUI-DARK-001 | L76 | No aplica. No hay tokens de marca. |
| RUI-CONTRAST-001 | L88 | Cumple con clases semánticas. Capturas en claro y oscuro. |
| UIS-COVERAGE-001 | L89 | Cumple en la página de estrés. |
| UIS-LAYOUT-001 | L90 | Cumple. La preview no ensancha el documento. |
| UIS-LAYOUT-002 | L91 | No se duplica. No habla de gestos. |
| UIS-CONSOLE-001 | L92 | Cumple. |
| UIS-DESIGN-001, UIS-TOKENMAP-001, UIS-DONT-001 | L94–96 | No aplica. Ciclo de host. |
| UIS-PRESET-001 | L97 | Cumple. Sin `shadcn init`. |
| UIS-COMP-ISP-001 | L99 | Excepción: el contrato pedido es una sola superficie. Guía, no check. |
| UIS-COMP-OCP-001 | L100 | Cumple. No se copia un primitivo. |
| UIS-COMP-DIP-001, DIP-002 | L101–102 | Cumple. Sin Supabase. Fixtures en memoria. |
| UIS-REFACTOR-001…003 | L104–108 | No aplica. |
| UIS-YAGNI-001…003, UIS-KISS-001 | L109–112 | Cumple. Sin factory. Las partes opcionales se omiten. |
| UIS-CATALOG-GAP-001 | L113 | Cumple. La pieza cierra el hueco. |
| RUI-CONTRACT-001 | L115 | Cumple en `__tests__/navigation.contract.test.tsx`. |
| RUI-ANIM-PERF-001…007 | L117–123 | Cumple. `clip-path`, `transform`, `opacity`. Sin `transition-all`, sin `width`, sin blur, sin `will-change`, sin handler por frame. |
| Prosa a11y, copy, layout, tokens | `rules/*.md` | Cumple: landmark, árbol, tooltips, Escape, 44 px, un idioma por superficie, radio exterior = interior + padding. |
| RUI-TOUCH-001 | Propuesta del PR #68 | Aplicada. El tap abre. El hover no existe en touch. |

Veredicto: **la pieza cabe en 4.0.0.** Falta una regla de preview.

## Propuesta — `RUI-PREVIEW-001`

No duplica `RUI-ANIM-PERF-*`, `RUI-TOUCH-001` ni `UIS-LAYOUT-002`.

```yaml
- id: RUI-PREVIEW-001
  title: "La preview por puntero no mueve el foco; el foco del teclado abre la misma preview; Escape la cierra"
  description: >-
    Un panel que se abre al hover es un region, no un dialog. No llama a focus()
    al abrirse. El mismo contenido se abre cuando el control recibe foco por
    teclado, también sin mover el foco. El retraso de intención solo aplica al
    puntero fino. Escape cierra la preview y devuelve el foco solo si estaba
    dentro. En touch, un tap abre (RUI-TOUCH-001).
  severity: major
  category: a11y
  check: test
  check_tool: "retana-ui __tests__/sidebar-islands.test.tsx"
  origin:
    source: "Clean-room. Maxim Kuznetsov, https://x.com/disarto_max/status/2117664457862033627, sin licencia y sin código."
    date: 2026-11-04
  status: proposed
```

## Deuda conocida

- `user-menu` no participa: errores previos de `exactOptionalPropertyTypes` y `RUI-ANIM-PERF-005`.
- `tree-nav` anima `grid-template-rows`. No se tocó.
- Al terminar el `clip-path`, el ancho de layout pasa de `w-68` a `w-14` de un salto. El ancho no se transiciona.
- El cierre de la hoja de shadcn dice "Close" en inglés.
- Capturas en `/cursor/stores/self/ai-crm/sidebar-islands/`. La tira de frames cayó en el riel ya asentado: el clip de 240 ms terminó antes del primer disparo. El colapso instantáneo está en `reduced-light-1280.png`.
- El anillo isométrico queda descartado.
