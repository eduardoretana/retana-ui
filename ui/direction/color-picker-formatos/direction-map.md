# direction-map — color-picker-formatos · spec 0.1.0

Base de código: H = `6f215631b6fcc822e5c6460f899b5f85aabb575e` (los commits de gobierno no cambian código).
Referencias: `REF-cpl-color-picker`, `REF-shadcnstudio-color-picker`. Fichas y sha256 en `ui/direction/color-picker-formatos/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de `ui/specs/color-picker-formatos.spec.md` (sha256 con prefijo `fb9d530c0031`).
Las `rule:` citadas existen en `knowledge/rules.yaml` blob `f16049b5`.

| Región | reference_id | Referencia (CPL bf1682d4) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Área, tono y alfa | REF-cpl-color-picker | área de saturación y brillo, rango de tono y de alfa | igual; `touch-none` en área y rangos; `onValueCommit` al soltar | sí, solo comportamiento | `AC-8`; `rule:RUI-ANIM-PERF-007` |
| R2 Fila de herramientas | REF-shadcnstudio-color-picker | no existe en CPL | grupo HEX/RGB/HSL (`aria-pressed`), copiar (icono Copy/Check con `scale`+`opacity`), cuentagotas | sí, se agrega | `AC-2`; `AC-4`; `AC-6` |
| R3 Campo de valor | REF-cpl-color-picker | campo HEX; inválido se descarta en silencio | campo en el formato activo; inválido se queda con `aria-invalid` y error en texto | sí, comportamiento | `AC-1`; `AC-3`; `wcag:3.3.1` |
| R4 Cuentagotas | REF-cpl-color-picker | se oculta sin API | visible con `aria-disabled` y explicación; `hide-unsupported` conserva CPL | sí, comportamiento | `AC-6` |
| R5 Guardados | REF-cpl-color-picker | muestras de solo lectura (`listbox` sin flechas) | lista con guardar, mover y borrar por teclado y por botones de un solo puntero; arrastre extra | sí | `AC-7`; `wcag:2.5.7`; `wcag:2.1.1` |
| R6 Popover | REF-shadcnstudio-color-picker | no existe en CPL | `ColorPickerPopover`: disparador con muestra y valor; contenido con origen en el disparador; reduced motion deja solo fade | sí, se agrega | `AC-5`; `wcag:2.3.3` |
| R7 Escenas PLP | REF-cpl-color-picker | sin `scenes.tsx` | filled, empty, loading, error, invalid, no-eyedropper, full, popover | sí, se agregan | `AC-9` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta + sha256 en las fichas).
