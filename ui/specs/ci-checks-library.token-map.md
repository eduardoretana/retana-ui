# Token map — ci-checks-library

Firmado por el rol de UI Lead de este encargo antes de construir. ui-system 4.0.0. Perfil STANDARD.

`tokens_sha256`: no hay archivo de tokens del host en este repo. Las piezas usan solo las clases semánticas que ya resuelve `app/globals.css` en el demo y el tema del host en una instalación. No se añaden tokens.

| Región | Clases | Notas |
|---|---|---|
| Superficie de tarjeta y chip | `bg-card`, `text-card-foreground`, `border-border`, `rounded-xl`, `shadow-sm` | Elevación del host (`shadow-sm`), verbatim del tema. |
| Pastilla en reposo | `bg-background`, `border-border`, `rounded-full` | |
| Texto secundario, SHA, tiempos | `text-muted-foreground`, `font-mono`, `text-xs` | Sin tamaño `--text-*` propio. |
| Texto principal | `text-foreground`, `text-sm` | |
| Estado positivo / barra en curso o pasada | `bg-primary`, `text-primary` | El icono y la palabra acompañan el color. |
| Estado de fallo | `bg-destructive`, `text-destructive`, `border-destructive` | Igual: icono + palabra. |
| Pista de la barra | `bg-muted` | La barra es `scaleX` sobre `bg-primary` o `bg-destructive`. |
| Foco | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none` | |
| Aviso en vivo | `sr-only` en el nodo `status`, salvo el estado de fusión que también es visible | |
| Movimiento | `transition-[opacity,transform]`, `motion-reduce:transition-none`, `motion-reduce:animate-none` | Prohibido `transition-all`. Sin animar width, height, top o left. |
| Radios | `rounded-full` en el chip y en el punto del riel (1:1, círculo). `rounded-xl` en la tarjeta. `rounded-md` en filas. | RUI-RADIUS-001. El punto es cuadrado de `size-2` con `rounded-full`. |

## Desviaciones citadas

- `catalog-gap:` no existe un medidor de progreso en el catálogo sin `transition-all`. `components/ui/progress.tsx` anima con `transition-all`. La barra de esta familia no lo importa. AC-11.
- `rule:RUI-ANIM-PERF-002` la apertura no anima el layout. Entra con opacidad y `y` de Motion, o aparece de golpe si el movimiento está reducido.
- `wcag:1.4.1` el estado no depende del color. AC-2 y AC-5.
- `wcag:2.2 AA` nombre accesible, foco visible, región en vivo, botón deshabilitado mientras no se puede fusionar.

## Variante

`variant="rail"` (elegida) y `variant="compact"` usan los mismos tokens. Cambia la composición, no la paleta.
