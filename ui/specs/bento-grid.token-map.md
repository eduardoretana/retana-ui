# Token map — bento-grid

Firmado por el Lead de este ciclo antes del código de las piezas. `retana_ui.sha`: `6671cfac72f736739d2d3dd2740cc5f13416acb3`. Perfil STANDARD. Sin color literal, sin `cssVars`, sin tokens nuevos.

| Pieza | Parte | Utilidad | Token del host |
| --- | --- | --- | --- |
| bento-grid | Pista | `gap-4` (default), `gap-3`, `gap-6` | escala de spacing |
| bento-grid | Columnas | `grid-cols-1` … `grid-cols-6` | ninguna medida en px |
| bento-grid | Quiebre intermedio | `@min-[30rem]/bento` | 30rem = 480 px, arriba de 390 px |
| bento-grid | Quiebre desktop | `@min-[56rem]/bento` | 56rem = 896 px |
| bento-grid | Celda | `min-w-0`, `col-span-*`, `row-span-*` | sin padding propio |
| bento-feature-card | Superficie | `bg-card text-card-foreground ring-foreground/10 rounded-xl` | card, foreground, radius |
| bento-feature-card | Copia | `p-4`, `gap-2`, `max-w-[17.5rem]`, `text-sm`, `text-muted-foreground` | spacing, medida de lectura, foreground |
| bento-feature-card | Icono | `size-8 rounded-lg bg-muted text-muted-foreground` | spacing, radius, muted |
| bento-feature-card | Ilustración | `min-h-40 rounded-none bg-muted` | spacing, muted |
| bento-feature-card | CTA | `text-sm font-medium text-primary` | primary, sin botón anidado |
| bento-feature-card | Foco | `focus-within:ring-2` en `Card`, que ya trae `rounded-xl` y el anillo | ring, background. El article no suma otro radio ni un border |
| bento-feature-card | Error | `text-sm font-medium text-destructive`, `role=alert` | destructive 4.91:1 sobre blanco; el peso y el texto no dejan el aviso solo en el color |
| bento-feature-card | Carga | `Skeleton` del host (`bg-muted`) | muted |
| bento-feature-card | Hover | `transition-transform`, `transition-[transform,opacity]`, `-translate-y-0.5`, `scale-[1.02]`, `opacity-90` | solo transform y opacity |
| bento-feature-card | Reduced motion | `motion-reduce:transition-none motion-reduce:hover:translate-none motion-reduce:will-change-auto` | media query del sistema |
| bento-feature-card | will-change | `hover:will-change-transform` y `group-hover/feature:will-change-transform`. Nada quieto | RUI-ANIM-PERF-006 |
| magnetic preset | Pista | las clases ya publicadas: `gap-4`, `@min-[36rem]/mb`, `@min-[56rem]/mb` | sin cambio de contrato |
| magnetic preset | Celda 2×2 | `col-span-1`, `@min-[36rem]/mb:col-span-2`, `@min-[56rem]/mb:col-span-2`, `row-span-2`, `min-h-80` | contrato histórico |
| magnetic preset | Separación | `shadow-sm`, `gap-3` interno, `gap-4` de la pista. Sin `border` | sombra y spacing del tema |
| magnetic preset | Lectura | `max-w-[17.5rem]` en título, descripción y CTA | misma cota que la tarjeta |
| magnetic preset | CTA | `text-foreground`, `opacity` y `translate`. Sin color de acento en el texto | foreground. `chart-1` como texto mide 1.48:1 |
| magnetic preset | Icono | sin `transition-colors`. El activo puede usar `--mb-item-accent` al instante | sin transición de color |
| bento-grid | Entrada | `opacity` y `translateY`, tope `0.4` s, duración `0` con reduced motion | solo transform y opacity |

No entra `transition-all`. No se anima width, height, margin, padding ni box-shadow. El anillo de la tarjeta es el `ring` de `Card`, estático.
