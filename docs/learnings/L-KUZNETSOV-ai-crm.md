# L-KUZNETSOV-ai-crm

- **Fuente:** Maxim Kuznetsov, https://x.com/disarto_max/status/2117664457862033627. Los videos son la interacción observada. No se publicó código.
- **Licencia:** sin licencia, solo idea. Clean-room: layout, interacción, motion y estilo visual. No se copió código, datos, iconos ni assets.
- **Fecha:** 2026-11-04, retomado 2026-11-06.
- **ui-system:** snapshot `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0. Los ids viven en `knowledge/rules.yaml` (el archivo todavía dice semilla 3.4.1). `rules/*.md` es prosa sin ids.
- **Pieza de esta rama:** `knowledge-base`. El enrutador está en el PR draft #70 y no se mezcla aquí.

## Variante elegida

| Variante | Qué hace | Decisión |
| --- | --- | --- |
| A. Ilustración que se arma + lista + odómetro | Cada fuente conectada suma un nodo. El contador es `animated-counter`. Los avisos son `toast-stack`. | **Elegida.** |
| B. Solo tabla | No cumple la ilustración. | Descartada. |
| C. Kanban por estado | No es el flujo de ingesta. | Descartada. |

Los puertos `onConnect`, `onSync` y `onDisconnect` reciben `AbortSignal` y `report`. `onReset` corre después de confirmar. No hay `fetch` ni `@supabase`.

## Comparación con ui-system 4.0.0

| Regla | Cita | Relación | Veredicto |
| --- | --- | --- | --- |
| RUI-TOKEN-001 | `rules.yaml` L17 | Sin tokens de color propios. | **Cumple.** |
| RUI-RADIUS-001 | L28 | Solo `rounded-xl`, `rounded-lg`, `rounded-md`, `rounded-full`. | **Cumple.** |
| RUI-ELEV-001 | L46 | `shadow-sm` de la escala del anfitrión. | **Cumple.** |
| RUI-TYPE-001 | L56 | Utilidades `text-*` de Tailwind. Sin `--text-*` propio. | **Cumple.** |
| RUI-HEIGHT-001 | L67 | Botones y selects en la altura del primitivo. | **Cumple**, con deuda: el botón mide 32 px, por debajo de los 44 px de `layout.md` L12. |
| RUI-DARK-001 | L76 | No declara modo oscuro de marca. Usa semánticos del anfitrión. | **No aplica** a la pieza. |
| RUI-CONTRAST-001 | L88 | Texto sobre `bg-card` / `text-foreground`. | **Hereda el host.** |
| UIS-COVERAGE-001 | L89 | Estrés en `/examples/knowledge-base/stress`. | **Cumple.** |
| UIS-LAYOUT-001 | L90 | La lista crece en vertical y trunca nombres. | **A verificar** en captura a 390 px. |
| UIS-LAYOUT-002 | L91 | La demo no fuerza `scrollY`. | **No aplica** al componente. |
| UIS-CONSOLE-001 | L92 | Sin `console.error`. | **Cumple** en código. |
| UIS-DESIGN-001 / TOKENMAP / DONT / PRESET | L94–L97 | Ciclo de marca del hub. | **No aplica.** |
| UIS-COMP-ISP-001 | L99 | La pieza pasa de 10 props por el contrato de puertos y estados. | **Deuda.** Regla `deferred`. |
| UIS-COMP-OCP-001 | L100 | No se copia ni edita otra pieza `@retana/*`. | **Cumple.** |
| UIS-COMP-DIP-001 | L101 | Sin `@supabase` ni `fetch`. | **Cumple.** |
| UIS-COMP-DIP-002 | L102 | Fixtures y estrés cubren los puertos en memoria. | **Cumple.** Regla `deferred`. |
| UIS-REFACTOR-* | L104–L106 | No es un fix de reglas previas. | **No aplica.** |
| UIS-YAGNI-001 | L108 | Los totales viven en el núcleo porque las pruebas y la UI los usan. | **Cumple.** |
| UIS-YAGNI-002 / 003 | L109–L110 | Sin factory. La pieza es del catálogo. | **No aplica.** |
| UIS-KISS-001 | L111 | `locale` lo usa el contador. | **Cumple.** |
| UIS-CATALOG-GAP-001 | L113 | Reusa animated-counter, toast-stack, status-pill, empty-state, progress, select. | **Cumple.** |
| RUI-CONTRACT-001 | L115 | `contracts/knowledge-base.contract.ts`. | **Cumple** como contrato de la familia. No sustituye otra pieza. |
| RUI-ANIM-PERF-001…007 | L117–L123 | Nodos con opacidad. Sin `transition-all`. Sin `setState` por frame. | **Cumple** si `anim_perf_lint` sale 0. |
| RUI-TOUCH-001 | Propuesta del PR #68, no está en el hub | No hay drag. Conectar y restablecer son botones. | **No aplica.** |
| `rules/a11y.md` L9–L10 | 24 px y reduced motion | Botones del host ≥ 32 px. `data-motion="off"` sin animar el odómetro de más: `animated-counter` ya salta. El total va en `aria-live="polite"`. | **Cumple** AA. 44 px queda como recomendación. |
| `rules/copy.md` | Verbo + objeto, un idioma por superficie | «Restablecer la base» / «Reset knowledge base». El idioma lo elige `labels`. | **Cumple.** |
| `rules/tokens.md` | Semánticos, `tabular-nums`, truncado | `bg-card`, cifras tabulares, `truncate` con `title`. | **Cumple.** |

## Deuda conocida

- Altura de control 32 px, no 44 px (`rules/layout.md` L12). No se cambia el botón del anfitrión (RUI-HEIGHT-001).
- `KnowledgeBase` supera las 10 props de UIS-COMP-ISP-001 (deferred) porque el contrato pide cuatro puertos y los estados.
- `knowledge-base.tsx` no entra en `tsconfig.strict-host.json`. Al importar `toast-stack` y `animated-counter` el chequeo arrastra errores que esas piezas ya tenían. `tsc --noEmit` sí cubre el archivo. El núcleo `knowledge-base.ts` sí está en strict-host.
- La ilustración muestra hasta seis fuentes. El resto queda en la lista.
