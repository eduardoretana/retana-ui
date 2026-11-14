---
artifact_id: spec-filter-toolbar-labels
owner: builder
spec_id: filter-toolbar-labels
version: 1.0.0
profile: LITE
states: [filled, empty, change, cleared, i18n_long]
---

# filter-toolbar-labels · spec LITE

- spec_id: `filter-toolbar-labels` · ui-system 4.0.0 · Interaction flow: NO (solo copy y anuncios)
- **Profile**: LITE
- **States**: filled, change, cleared, i18n_long, empty
- Decisión: Eduardo, "Si hazlo end to end" (2026-11-13), dentro de map-browser: "la extensión LITE de labels (es-MX/EN) para filter-toolbar va en un PR draft pequeño aparte".
- Constructor: Retana UI · Design Engineer. Auditor: pendiente (no es el constructor).

## Brief

- **Qué:** `FilterToolbar` acepta `labels?: Partial<FilterToolbarLabels>` y exporta `filterToolbarLabelsEn` (por defecto) y `filterToolbarLabelsEs`.
- **Para qué:** que `map-browser` y cualquier anfitrión en es-MX no muestren "Clear all", "Remove …" ni anuncios en inglés.
- **Alcance:** `registry/ui/filter-toolbar.tsx`, su fila de API en `registry.json`, los artefactos de `registry:build` y el ejemplo (`?lang=es`).
- **Fuera:** cambios visuales, tokens, tema, layout, otras piezas.
- **Compatibilidad:** sin `labels` todo sigue en inglés como en CPL 6671cfac; los props explícitos (`emptyLabel`, `label`, `addFilter.label`) ganan sobre el juego.

## Criterios de aceptación

| AC | Criterio | Medida | Prueba |
|---|---|---|---|
| AC-1 | El inglés sigue por defecto | sin `labels`: "Clear all", "Remove <campo>: <valor>", "No filters applied", "Add filter", grupo "Active filters" | `FT-LABELS-DEFAULT`, `FT-LABELS-DEFAULTS-EN`, `FTL-DEMO-EN` |
| AC-2 | El juego es-MX cubre todo el chrome | con `filterToolbarLabelsEs`: "Limpiar todo", "Quitar <campo>: <valor>", "Sin filtros aplicados", "Agregar filtro", grupo "Filtros activos", "Volver a los campos" | `FT-LABELS-ES`, `FT-LABELS-DEFAULTS-ES`, `FTL-DEMO-ES` |
| AC-3 | Los anuncios de `role=status` salen en el idioma del juego | quitar, agregar y limpiar anuncian "Se quitó …", "Se agregó …", "Se quitaron todos los filtros" | `FT-LABELS-ES` |
| AC-4 | Un juego parcial completa con inglés | `labels={{ clearAll: "Borrar" }}` cambia solo ese texto | `FT-LABELS-PARTIAL` |
| AC-5 | Los props explícitos ganan | `emptyLabel`, `label` y `addFilter.label` explícitos se respetan con cualquier juego | `FT-LABELS-DEFAULTS-PROPS` |
| AC-6 | Sin cambio visual ni overflow | 0 px de overflow horizontal a 390 y 1280 en claro y oscuro, EN y es-MX | capturas del harness 21db9481 (`renders.yaml`) |

## Estados

| Estado | Qué se ve | Prueba |
|---|---|---|
| filled | chips con botón de quitar y "Limpiar todo"/"Clear all" | `FT-LABELS-ES`, capturas |
| change | anuncio "Se agregó/Se quitó/cambió a" | `FT-LABELS-ES` |
| cleared | anuncio "Se quitaron todos los filtros" | `FT-LABELS-ES` |
| i18n_long | valor sin espacios a 320 px | capturas (`StressCases`) |
| empty | "Sin filtros aplicados" y "Agregar filtro" | `FT-LABELS-DEFAULTS-ES`, capturas |

## Rojo y verde

- Rojo declarado en `ui-tests/expected-red.yaml` (FT-LABELS sobre la fuente de CPL: 2 fallan y 1 pasa; FTL-* antes de este spec y del demo; FT-LABELS-DEFAULTS sobre 8cd562f).
- Hallazgo de las capturas (8cd562f): con el juego es-MX el vacío, "Add filter" y el nombre del grupo seguían en inglés. Se agregaron `empty`, `addFilter` y `group` al juego.
