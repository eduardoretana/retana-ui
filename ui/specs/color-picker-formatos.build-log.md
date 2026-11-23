# Build log · color-picker-formatos

## needs

- `color-picker` depende ahora de `popover` (registryDependencies) por `ColorPickerPopover`.
- `rule-exception` de `UIS-COMP-ISP-001` (`knowledge/rules.yaml:99`, ≤ 10 props propias): CPL ya tenía 11; el ciclo agrega opcionales (`onValueCommit`, `format`/`defaultFormat`/`onFormatChange`, `formats`, `labels`, `defaultSwatches`/`onSwatchesChange`, `maxSwatches`, `onCopy`, `eyedropper`). Razón: compatibilidad hacia atrás (las etiquetas sueltas viejas siguen y ganan sobre `labels`) y control/no-control por cada estado nuevo. Todas se usan en escenas o estrés (`UIS-KISS-001`).
- Desviación de `better-ui/SKILL.md:44` declarada: el icono Copy/Check cruza con `scale` 0.25→1 y `opacity`, sin `blur` (el encargo limita a transform/opacity). Receta CSS (`cubic-bezier(0.2, 0, 0, 1)`, 300 ms) en vez de spring de `motion`: el ítem del registry no depende de `motion`.
- Cambio de comportamiento: cuentagotas visible con `aria-disabled` cuando no hay API; `eyedropper="hide-unsupported"` lo revierte.

## spec_defect

Ninguno.

## candidates_detected

Dos huecos de regla en ui-system (ocultar vs deshabilitar una capacidad; alternativa al arrastre WCAG 2.5.7). Quedan como propuesta local fuera del repo (`/workspace/color-picker-2026-11-23/propuesta/0001-rui-a11y-unavailable-drag.diff`), sin PR.

## commands

```
node anim_perf_lint.mjs <repo> --files registry/ui/color-picker.tsx,app/examples/color-picker/scenes.tsx,app/examples/color-picker/demo.tsx,app/examples/color-picker/preview.tsx,app/examples/color-picker/stress/page.tsx --json
```

Salida (herramienta 0.1.0 de ui-system, blob `9dfd98454a46698bdde96c31bc96758c3aae9e2c`; TypeScript 5.9 en un directorio aparte):

```json
{
  "tool": "anim-perf-lint",
  "version": "0.1.0",
  "status": "pass",
  "checked": 5,
  "failed": 0,
  "results": []
}
```

Skills aplicadas: better-ui, better-accessibility, emil-design-eng, break-ui, review-animations. review-animations encontró que `transition-[transform,opacity]` no animaba `scale-*` (Tailwind v4 usa la propiedad `scale`); se corrigió a `transition-[scale,opacity]`. axe-core 4.13 encontró contraste bajo en los botones de formato sin presionar (`text-muted-foreground` sobre `bg-muted`, claro); se corrigió a `text-foreground`.
