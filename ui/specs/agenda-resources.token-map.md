# token-map · agenda-resources

Firmado por el Lead de este ciclo como mapa de la extensión. No hay tokens nuevos. `tokens_sha256` no cambia: el tema sigue en `app/globals.css` del demo y no viaja en `registry/`.

| Uso | Clase del tema | Notas |
|---|---|---|
| Fondo del bloque y del canal fijo | `bg-background` | |
| Texto del choque y del cupo excedido | `text-card-foreground` sobre `bg-card` | Medido en el viewport: 19.8:1 en claro y 17.2:1 en oscuro. AA pide 4.5:1. |
| Texto secundario del filtro | `text-muted-foreground` | |
| Bordes del selector, del resumen y de la tarjeta | `border-border` | |
| Día de hoy | `bg-accent`, `bg-primary`, `text-primary-foreground` | Ya estaba. No se toca. |
| Foco | `focus-visible:ring-ring` | Ya estaba en la tarjeta y en las celdas. |
| Sombra de la tarjeta | `shadow-sm` | Ya estaba. |
| Altura del selector | `h-7` | Igual que el botón `size="sm"` del encabezado. |
| Radio del selector | `rounded-lg` | |
| Icono de choque y de exceso | `TriangleAlert` de `lucide-react`, `aria-hidden` | El texto es la señal. |

No se usan hex, `rgb`, `oklch`, ni utilidades `bg-red-500` y similares.

El `Button` del conteo es el primitivo del anfitrión. Su `transition-all` ya vivía en `components/ui/button.tsx`. Esta extensión no lo copia ni lo cambia.

Animación añadida: ninguna. Las columnas no animan layout. Solo se permiten, si en el futuro hiciera falta un realce, `transform` y `opacity`, y se apagan con `prefers-reduced-motion`.
