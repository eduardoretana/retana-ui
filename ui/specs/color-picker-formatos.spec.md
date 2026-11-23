---
spec_id: color-picker-formatos
version: 0.1.0
profile: STANDARD
ui_system: 4.0.0
retana_ui:
  sha: bf1682d4dfb8696ddb01bf84aedda111f47b086c
  registry_source: git-sha
spec_changelog:
  - version: 0.1.0
    origin: builder
    note: "Spec inicial. Encargo de EduardoBot (2026-11-23) relayado por el builder Retana UI; puntos (a)-(f)."
states: [filled, empty, loading, error, invalid, no-eyedropper, full, popover, keyboard, reduced, "390"]
data_fixture: ui/direction/fixtures/color-picker-formatos.yaml
direction:
  mode: visual
  reference_meta: ui/direction/color-picker-formatos/reference-meta.yaml
  references:
    - reference_id: REF-cpl-color-picker
      screen_id: color-picker
      kind: visual
      path: ui/direction/color-picker-formatos/ref-cpl-color-picker.md
      sha256: 5aab58fcf2f7c0455551b31d224c57d6f735b9cf557d58e6e2e4cd749949ef57
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
    - reference_id: REF-shadcnstudio-color-picker
      screen_id: all
      kind: code
      path: ui/direction/color-picker-formatos/ref-shadcnstudio-color-picker.md
      sha256: fc4f171ae6160ad8d292adde0c17203a94adfba532a6dd531e245a3ed63380ea
      chosen_at_spec_version: "0.1.0"
      valid_for_spec_version: "0.1.0"
      status: current
---

# Selector de color: formatos, copia, popover, cuentagotas y guardados

Perfil STANDARD propuesto por el builder: cambia comportamiento visible de una pieza existente (cuentagotas, validación, guardados) y agrega un modo (popover). La confirmación del perfil es del UI Lead.

## Perfil y estados

- **Profile**: STANDARD
- **UI intent**: APPLIES
- **States**: filled, empty, loading, error, invalid, no-eyedropper, full, popover, keyboard, reduced, 390

## Criterios de aceptación

| ID | Criterio | Medida | Prueba |
| --- | --- | --- | --- |
| AC-1 | El campo acepta HEX, RGB y HSL en sus grafías comunes y rechaza fuera de rango, parciales, vacíos y > 64 caracteres. | `parseColor` devuelve color o `null`. | `__tests__/color-picker-formats.test.tsx` «CP-PARSE» ×3; `__tests__/color-picker-break.test.tsx` «CP-BREAK-TRAILING» |
| AC-2 | El grupo de formato (botones `aria-pressed`) cambia la etiqueta del campo y reimprime el valor. | Etiqueta y valor del campo. | «CP-FORMAT-SWITCH»; «CP-BREAK-ONE-FORMAT» |
| AC-3 | Un valor inválido, tecleado o pegado, no se aplica: se queda en el campo con `aria-invalid` y un error en texto ligado por `aria-describedby`; Escape revierte. Un valor válido en otro formato se aplica y se muestra en el formato activo. | `onValueChange` sin llamar; atributos y texto. | «CP-FORMAT-VALIDATE» ×2; «CP-FORMAT-PASTE»; «CP-BREAK-LONG-PASTE» |
| AC-4 | Copiar escribe el valor en el formato activo y lo anuncia en una región `role="status"`; si el portapapeles se niega, lo anuncia con una salida manual. | `navigator.clipboard.writeText` y texto de la región. | «CP-COPY» ×2 |
| AC-5 | `ColorPickerPopover` muestra muestra y valor en el disparador y abre el selector; en es-MX el nombre dice la acción y el valor. | Nombre accesible y contenido abierto. | «CP-POPOVER»; «CP-BREAK-POPOVER-ES» |
| AC-6 | Sin API EyeDropper, el botón sigue visible con `aria-disabled` y explica por qué; `eyedropper="hide-unsupported"` conserva el comportamiento de CPL. | Botón, `aria-describedby`, texto. | «CP-EYEDROPPER» ×2 |
| AC-7 | Guardados: Alt+flechas mueve, Supr borra, el foco sigue; botones de un solo puntero mueven y borran el activo; al límite, «Guardar» explica en vez de esconderse; borrar el último lleva el foco a «Guardar». | `onSwatchesChange`, foco y textos. | «CP-SWATCH-KEYS»; «CP-SWATCH-BUTTONS»; «CP-SWATCH-SAVE»; «CP-BREAK-LAST»; «CP-BREAK-TOOLBAR»; «CP-BREAK-NONE-SELECTED» |
| AC-8 | `onValueCommit` llega una vez al soltar el puntero o la tecla; `onValueChange` sigue en cada cambio. | Conteo de llamadas. | «CP-COMMIT» ×2 |
| AC-9 | La pieza opta a PLP con filled, empty, loading, error, invalid, no-eyedropper, full y popover; declara `popover` en `registryDependencies` y el crédito clean-room. `pnpm registry:build` en verde. | `registry.json` y `scenes.tsx`. | «CP-PLP»; `pnpm registry:build` |
| AC-10 | Sin hex, sin `dark:` de color, sin `transition-all`; animaciones solo de `scale`/`opacity`; 390 sin overflow horizontal; WCAG 2.2 AA sin violaciones de axe en las escenas interactivas. | Validador del registry, `anim_perf_lint`, capturas y axe. | `pnpm registry:build` (validate-registry); `anim_perf_lint` pass; `/workspace/color-picker-2026-11-23/capturas/despues-interaccion-records.json` |

## Dirección

Por referencia (`direction.mode: visual`). Detalle en `ui/direction/color-picker-formatos/reference-meta.yaml`; mapa de desviaciones en `ui/direction/color-picker-formatos/direction-map.md`; fixture en `ui/direction/fixtures/color-picker-formatos.yaml`.

- `REF-cpl-color-picker` (visual): `ui/direction/color-picker-formatos/ref-cpl-color-picker.md`
- `REF-shadcnstudio-color-picker` (code, clean-room): `ui/direction/color-picker-formatos/ref-shadcnstudio-color-picker.md`

## Brief

- Outcome: el selector acepta y copia HEX, RGB y HSL, se abre desde un disparador, explica cuando no hay cuentagotas y deja ordenar y borrar guardados sin arrastrar.
- Sources: CPL `bf1682d4`; ui-system 4.x (`cbdaaf62` / hub `0218369e`, blobs iguales); idea clean-room de shadcn/studio (MIT + Commons Clause).
- Scope: `registry/ui/color-picker.tsx`, `registry.json`, `public/r/**`, `app/examples/color-picker/**`, pruebas, `NOTICE`, `README.md`.
- Stop when: test, lint, typecheck:strict-host, registry:build sin diff y build en verde. PR solo draft, sin abrir desde este agente.

## Non-goals

Sin espacios de color nuevos (OKLCH, P3), sin paleta del tema, sin dependencia de `motion` en el ítem, sin cambiar `color-palette`.
