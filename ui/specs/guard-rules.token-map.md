# Token map — guard-rules

Firmado por el builder en el rol de Lead de este ciclo de catálogo, antes de las pantallas. No hay tokens nuevos. `tokens_sha256` no aplica: el tema vive en `app/globals.css` del demo y las piezas no lo importan.

| Uso | Clase |
| --- | --- |
| Fondo de pieza | `bg-card text-card-foreground` |
| Página | `bg-background text-foreground` |
| Borde | `border-border` |
| Texto secundario | `text-muted-foreground` |
| Error | `text-destructive` y `role="alert"` |
| Énfasis de decisión | `Badge` `outline`, `secondary` o `destructive` (primitivo del host) |
| Control | `border-input`, `focus-visible:ring-ring`, `focus-visible:border-ring` |
| Separador | `Separator` |
| Carga | `Skeleton` |
| Vacío | `EmptyState` de `@retana/empty-state` |
| Radio | `rounded-lg` `rounded-xl` del host |

Prohibido en `registry/`: hex, `rgb`, `oklch`, paleta de Tailwind, `cssVars`, `transition-all`.

La animación propia de estas cuatro piezas no usa transición. El vacío reutiliza `empty-state`, que ya apaga el movimiento cuando el lector lo pide.
