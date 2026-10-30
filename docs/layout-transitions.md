# Reglas de layout y continuidad

Fuente pública: Jakub Antalik, “Transitions UI agent”,
https://x.com/jakubantalik/status/2115844862012768541.
El producto no publica licencia de reutilización. Esta nota es **clean-room**:
describe el comportamiento, no copia fuente, datos de ejemplo, iconos ni assets.
La implementación de `number-roll` y `stagger-list` es propia. Ver `NOTICE`.

Cada regla tiene un ejemplo de qué no hacer y uno de qué sí. La galería vive en
`/examples/layout-rules` y cabe en 390 px, en es-MX y en inglés. Solo usa tokens
del tema (`bg-muted`, `text-foreground`, `rounded-lg`, …) y los pasos de radio
de RUI-RADIUS-001. No usa `transition-all` ni easing con rebote.

El movimiento, cuando lo hay, es solo `transform` y `opacity`.
`prefers-reduced-motion: reduce` deja el estado final sin recorrido.

## RUI-LAYOUT-WIDTH-001 · Anchos acotados

Nunca estirar un texto o un control al ancho de la pantalla. La columna tiene
`max-width` y una medida de lectura cómoda.

### No

La burbuja y el campo ocupan todo el ancho, aunque la frase sea corta.

```tsx
<div className="w-full">
  <p className="w-full border px-3 py-2">¿Nos vemos el sábado en el taller?</p>
  <input className="w-full border" />
</div>
```

### Sí

La columna se detiene antes del borde. La burbuja mide lo que dice, no el marco.

```tsx
<div className="mx-auto w-full max-w-[17.5rem]">
  <p className="w-fit max-w-full rounded-lg bg-muted px-3 py-2">¿Nos vemos el sábado en el taller?</p>
  <input className="w-full rounded-lg bg-muted" />
</div>
```

## RUI-LAYOUT-BORDER-001 · Sin bordes redundantes

No apilar borde sobre borde. Separar con espacio, con una superficie (`bg-muted`,
`bg-card`) o con una sombra muy ligera del tema (`shadow-sm`).

### No

Burbuja, campo y botón, cada uno con su propio `border`.

```tsx
<div className="rounded-lg border p-3">
  <p className="rounded-lg border px-3 py-2">Aparto el horno de las diez.</p>
  <input className="rounded-lg border" />
</div>
```

### Sí

La superficie basta. El botón primario no necesita otro trazo.

```tsx
<div className="flex flex-col gap-2 rounded-xl bg-card p-3 shadow-sm">
  <p className="w-fit rounded-lg bg-muted px-3 py-2">Aparto el horno de las diez.</p>
  <div className="flex gap-2">
    <input className="min-w-0 flex-1 rounded-lg bg-muted px-3" />
    <button type="button" className="rounded-lg bg-primary text-primary-foreground">Enviar</button>
  </div>
</div>
```

## RUI-LAYOUT-COLOR-001 · Color fuerte solo en lo activo o primario

`bg-primary` y el peso fuerte marcan la acción primaria o el dato activo.
Lo demás queda en `bg-muted` y `text-muted-foreground`. El color no es la única
pista: el dato activo también cambia peso tipográfico o lleva nombre.

### No

Todas las barras y todos los días compiten con el mismo color.

```tsx
{days.map((day) => (
  <div key={day}>
    <div className="bg-primary" style={{ height: day.value }} />
    <span className="bg-primary text-primary-foreground">{day.label}</span>
  </div>
))}
```

### Sí

Solo el día en curso usa color fuerte. El resto es superficie. La etiqueta activa
va en `font-medium`, no solo en color.

```tsx
{days.map((day) => (
  <div key={day}>
    <div className={day.active ? "origin-bottom bg-primary" : "bg-muted"} style={{ height: day.value }} />
    <span className={day.active ? "font-medium text-foreground" : "text-muted-foreground"}>{day.label}</span>
  </div>
))}
```

Si esas barras se animan, el alto no se interpola. Crecen con `scaleY` desde
`origin-bottom`. Así el layout no se anima (RUI-ANIM-PERF-002).

## RUI-TYPE-HIERARCHY-001 · Jerarquía tipográfica dentro de un mismo valor

El entero y los decimales no pesan igual. El nombre y el estado tampoco.
La fracción es más chica y más ligera, en `em` del entero, no con un token de
tipo nuevo. El contraste del token `text-muted-foreground` se mantiene.

### No

`$18,640.50` en un solo estilo. El ojo no sabe dónde parar.

```tsx
<span className="text-2xl font-medium tabular-nums">$18,640.50</span>
```

### Sí

El entero manda. La fracción, el punto y el contexto quedan en segundo plano.
`number-roll` hace este corte en el DOM (`data-slot="number-roll-fraction"`).

```tsx
<span className="inline-flex items-baseline tabular-nums">
  <span className="text-2xl font-medium">$18,640</span>
  <span className="text-[0.65em] font-normal text-muted-foreground">.50</span>
</span>
<p className="text-xs text-muted-foreground">Esta semana</p>
```

## RUI-MOTION-CONTINUITY-001 · Animar con continuidad

Un cambio de posición, de lista o de cifra no corta. El elemento compartido
sigue en `transform`. Una lista entra y sale con slide y fade escalonados.
Un dato interpola. No hay rebote. El retraso total del stagger tiene tope
(`stagger-list`, 0.4 s). Solo `transform` y `opacity`. Nunca `transition-all`
ni `width` / `height` animados.

### No

El bloque nuevo reemplaza al viejo en un frame. La cifra anima su ancho.
La barra anima `height`.

```tsx
{open ? <List /> : null}
<motion.span animate={{ width: "auto" }} />
<motion.div animate={{ height: bar }} />
```

### Sí

La salida sube y se desvanece. La entrada sube desde abajo, con un retraso
que no pasa del tope. La cifra rueda con `translateY`. La barra usa `scaleY`.
Con movimiento reducido, la duración es 0.

```tsx
<StaggerList items={events} maxStagger={0.4}>
  {(event) => <EventRow event={event} />}
</StaggerList>
<NumberRoll value={18640.5} decimals={2} hierarchy />
<motion.div className="origin-bottom" animate={{ scaleY: bar / max, opacity: 1 }} />
```
