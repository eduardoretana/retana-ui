# Build log · text-scramble

## needs

- `text-scramble` depende de `@retana/motion-preference` (registryDependencies) por `useMotionPreference`. Sin dependencias de runtime.
- Riesgo declarado de `RUI-ANIM-PERF-007` (`ui-system/knowledge/rules.yaml:117-123`, manual): la pieza usa rAF mientras la página puede estar hidratando. Cambiar glifos es contenido y no puede ir al compositor. Mitigación: progreso por reloj, una escritura de `textContent` cada 50 ms como máximo, sin `setState` por frame (solo al empezar y al terminar) y sin lecturas de layout (AC-6). Medido en Chromium headless: 0 long tasks en las escenas con decode. **Falta grabación en dispositivo de gama media.**
- Aclaración de `ui-system/rules/a11y.md:10` («nada de parpadeos > 3/s»): el ruido cambia glifos ~20 veces por segundo, pero solo en la superficie del texto, en `text-muted-foreground` y sin cambio de luminancia de área grande. No es un destello en el sentido de WCAG 2.3.1. Se declara aquí y se propone aclarar la regla en una propuesta local, sin PR. **Falta medición con PEAT.**
- 600 ms por defecto (tope 1200 ms) supera los 300 ms de UI corriente. Es una excepción de marketing o primera vez (`emil-design-eng/SKILL.md:73` y `:131`). La pieza solo se usa en título o hero, una vez.
- `trigger="mount"` oculta el texto final antes de hidratar (con failsafe de 1.2 s). Puede retrasar el LCP si el título es el elemento LCP. Por eso el default es `visible`, que no oculta nada en SSR.

## spec_defect

Ninguno.

## candidates_detected

Tres huecos en ui-system o en el Auditor 1.2.5: (1) falta una regla de «motion temático de entrada única»; (2) `anim_perf_lint` no ve escrituras de `textContent` en rAF; (3) el Auditor renderiza con `reducedMotion: 'reduce'` (`AUDITOR.v1.2.5.md:197`) y nunca ve el estado animado. Quedan como propuesta local fuera del repo (`/workspace/emil-decode-2026-11-24/propuesta/`), sin PR.

## commands

```
node anim_perf_lint.mjs <repo> --files registry/ui/text-scramble.tsx,app/examples/text-scramble/scenes.tsx,app/examples/text-scramble/demo.tsx,app/examples/text-scramble/preview.tsx,app/examples/text-scramble/page.tsx,app/examples/text-scramble/stress/page.tsx,app/examples/text-scramble/fixtures.ts --json
```

Salida (herramienta 0.1.0 de ui-system, blob `9dfd98454a46698bdde96c31bc96758c3aae9e2c`):

```json
{
  "tool": "anim-perf-lint",
  "version": "0.1.0",
  "status": "pass",
  "checked": 7,
  "failed": 0,
  "results": []
}
```

Skills aplicadas: emil-design-eng, animation-performance, choreograph, animate, review-animations y break-ui (4 pruebas `TS-BREAK-*`). break-ui encontró que un texto nuevo a mitad del decode escribía basura; se corrigió (AC-7). UI/UX Pro Max («Excessive Motion») llevó a cortar el decode de las specs en la escena de terminal: quedan dos textos animados por vista (`a8ff6976`). Pasada completa en `/workspace/emil-decode-2026-11-24/design-pass/README.md`.
