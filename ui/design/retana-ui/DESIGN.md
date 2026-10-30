---
version: alpha
name: "Retana UI"
description: "Tema de demostración del catálogo. Las piezas heredan estos tokens y no traen marca propia."
x-retana:
  generated_by: "ui-system/tools/design_render.mjs@0.1.0"
  source: "rules/brand/retana-ui.tokens.json"
  tokens_sha256: 6280d8fefc5492e2184efc802e776d2798058d6072815e31dbd1b1558361887a
  dark_derived: false
  edit: "NO EDITAR A MANO: editar tokens.json y regenerar"
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  chart-1: "oklch(0.87 0 0)"
  chart-2: "oklch(0.556 0 0)"
  chart-3: "oklch(0.439 0 0)"
  chart-4: "oklch(0.371 0 0)"
  chart-5: "oklch(0.269 0 0)"
  sidebar: "oklch(0.985 0 0)"
  sidebar-foreground: "oklch(0.145 0 0)"
  sidebar-primary: "oklch(0.205 0 0)"
  sidebar-primary-foreground: "oklch(0.985 0 0)"
  sidebar-accent: "oklch(0.97 0 0)"
  sidebar-accent-foreground: "oklch(0.205 0 0)"
  sidebar-border: "oklch(0.922 0 0)"
  sidebar-ring: "oklch(0.708 0 0)"
typography:
  sans: {fontFamily: "var(--font-geist-sans)"}
  heading: {fontFamily: "var(--font-sans)"}
  mono: {fontFamily: "var(--font-geist-mono)"}
rounded:
  base: "0.625rem"
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
  2xl: "calc(var(--radius) * 1.8)"
  3xl: "calc(var(--radius) * 2.2)"
  4xl: "calc(var(--radius) * 2.6)"
---

<!-- Generado. No editar a mano (ui-system 3.3.0, S28). Fuente de verdad: tokens.json con el sha256 de arriba. -->

## Overview

Los valores salen de app/globals.css (:root y .dark) y de las variables de fuente en app/layout.tsx. El color queda en oklch, tal como está escrito. El radio es el paso calc() sobre --radius 0.625rem. El oscuro está declarado token por token, no derivado.

## Do's and Don'ts

- Do: Usar las clases semánticas del host (bg-background, text-foreground, bg-primary, bg-muted, rounded-lg).
- Do: Dejar el color en el oklch de este archivo. No convertirlo a hex ni a rgb.
- Do: Tomar el radio de un paso de este archivo (sm, md, lg, xl, 2xl, 3xl, 4xl).
- Don't: No estirar la prosa al ancho de la pantalla. La columna de lectura se detiene. — `rule:RUI-LAYOUT-WIDTH-001` (check: manual)
- Don't: No apilar borde sobre borde. Separar con superficie, espacio o sombra del tema. — `rule:RUI-LAYOUT-BORDER-001` (check: manual)
- Don't: No usar color fuerte fuera de la acción primaria o el dato activo. — `rule:RUI-LAYOUT-COLOR-001` (check: manual)
- Don't: No pintar entero y decimales con el mismo peso. — `rule:RUI-TYPE-HIERARCHY-001` (check: test)
- Don't: No animar width, height ni usar transition-all. Solo transform y opacity. — `rule:RUI-MOTION-CONTINUITY-001` (check: test)
- Don't: No inventar un radio fuera de los pasos. Un círculo 1:1 es la excepción percent-circle. — `rule:RUI-RADIUS-001` (check: lint)
- Don't: No meter color literal en registry/. — `rule:RUI-COLOR-001` (check: lint)

## Iteration Guide

Editar rules/brand/retana-ui.tokens.json y regenerar ui/design/retana-ui/DESIGN.md con design_render.mjs. No editar DESIGN.md a mano. Verificar con --check.

## Known Gaps

- No hay tamaño, peso ni interlineado propios en app/globals.css. Solo existen los roles sans, heading y mono.
- No hay sombras verbatim en globals.css. shadow-sm y el resto salen del preset de Tailwind que trae shadcn, no de este archivo.
- No hay escala de spacing propia. El espacio usa la escala del preset.
- .review-preview y .ae-ember pisan primary y chart dentro de esas clases. No son tokens de marca y no están aquí.
- Ningún hueco de contraste medido en este archivo (2026-10-30, el render solo copia los valores).
