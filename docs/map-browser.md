# map-browser

Lista filtrable y mapa sincronizados. La lista es la fuente accesible y el mapa la repite. El filtrado vive en el anfitrión: pasa `places` ya filtrados y `total` sin filtrar.

## Instalar

```bash
npx shadcn@latest add @retana/map-browser
```

Trae `registry/blocks/map-browser.tsx`, `registry/ui/geo-map.tsx` (interno, no se registra solo), `registry/lib/map-browser.ts` y `registry/lib/motion.ts`. Depende de `maplibre-gl@6.18.0`, `@retana/bottom-sheet` y `@retana/empty-state`.

## Lo que pone el anfitrión

La pieza no trae proveedor de tiles, CSS global, tema, cssVars ni colores fijos.

1. **CSS de maplibre.** Impórtalo una vez en tu layout o en la página: `import "maplibre-gl/dist/maplibre-gl.css"`.
2. **Worker.** Sírvelo desde tu dominio y pasa la URL en `provider.workerUrl`. La pieza nunca usa un CDN. En Next.js basta una route que lea `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs` (ver `app/vendor/maplibre-gl-worker/route.ts` en este repo) o una copia estática en `public/`.
3. **Proveedor.** `MapProvider = { styles: { light, dark? }, attribution, workerUrl?, maxZoom? }`. Un style puede ser una URL, un objeto o una función `(token) => style` que lee tokens del tema (`token("--muted")`), así los colores del canvas salen de tus tokens. `attribution` es obligatorio: vacío lanza error. Se muestra siempre expandido.

```tsx
const provider: MapProvider = {
  styles: { light: "/maps/light.json", dark: "/maps/dark.json" },
  attribution: "© OpenStreetMap contributors",
  workerUrl: "/vendor/maplibre-gl-worker",
}

<MapBrowser
  places={filtered}
  total={all.length}
  provider={provider}
  categories={categories}
  toolbar={<FilterToolbar filters={chips} onRemove={remove} addFilter={add} />}
  onSelectedChange={setSelectedId}
  onClearFilters={clear}
/>
```

### Helper documentado: CARTO

No va en el código del registry. Si usas los basemaps de CARTO:

- Usa **tu propia API key** (parámetro `?key=` en la URL del style). Las keys son por cliente y no se comparten entre proyectos. No la subas al repo: léela de una variable pública del entorno y restríngela por sitio en el dashboard de CARTO (una key aparte para `localhost`).
- La atribución **"© CARTO © OpenStreetMap contributors"** queda visible y sin colapsar (la pieza ya lo hace con `provider.attribution`).
- Tope comercial: **1M de tiles al mes** (aplica a todos desde el 2026-12-01). Pasado el tope necesitas plan Enterprise.
- **No** cachees tiles ni los pases por un proxy en tu servidor.

```ts
export function cartoProvider({ key, workerUrl }: { key: string; workerUrl: string }): MapProvider {
  const style = (name: "positron" | "dark-matter") =>
    `https://basemaps.cartocdn.com/gl/${name}-gl-style/style.json?key=${encodeURIComponent(key)}`
  return {
    styles: { light: style("positron"), dark: style("dark-matter") },
    attribution: "© CARTO © OpenStreetMap contributors",
    workerUrl,
  }
}
```

Revisa los términos vigentes de CARTO antes de publicar; esta nota se escribió con los términos del 2026-09-29 y el FAQ de basemaps consultado el 2026-11-13. Hoy solo los tiles raster exigen key; los styles vectoriales todavía cargan sin ella, pero CARTO recomienda ponerla ya.

## Estados

| `viewState` | Cuándo | Lista | Mapa |
|---|---|---|---|
| `loading` | `status="loading"` | 5 skeletons | skeleton |
| `error` | `status="error"` | empty-state con Reintentar (`onRetry`) | atenuado |
| `empty` | `places=[]`, `total=0` | "Aún no hay lugares." | vista inicial |
| `nomatch` | `places=[]`, `total>0` | "Ningún resultado con estos filtros." + Limpiar filtros | sin pines |
| `ready` | hay lugares | tarjetas | pines o clústeres |
| map-error | el mapa no carga (sin WebGL, style 404) | sigue funcionando | aviso en la región |

El root del mapa expone `data-map-state="loading|moving|idle|error"` para pruebas y capturas.

## Accesibilidad

- La lista es la fuente: un `<ul>` de botones con `aria-current` en el seleccionado. El mapa es una región con nombre y una descripción "Los mismos N resultados están en la lista."
- Los pines y clústeres son `<button>` DOM con nombre ("Nodo Alba, Oficina", "12 resultados, acercar"). El grupo de pines tiene un solo tab stop; las flechas, Inicio y Fin recorren los pines en el orden de la lista y no mueven el mapa.
- Hover o foco en una tarjeta enciende su pin y al revés.
- Escape cierra el detalle y regresa el foco a la tarjeta o el pin de origen.
- Un `role="status"` anuncia "N resultados" 300 ms después de filtrar, y "Seleccionado: X".

## Movimiento

Solo `transform` y `opacity`. El pin activo sube 4 px, el panel entra con `x: 16 → 0` y opacidad en 240 ms con `motionPresets.ease.enter`. Con `prefers-reduced-motion` la cámara salta (`duration: 0`), el panel solo cambia opacidad y los pines no se mueven.

## Créditos

- Comportamiento de referencia: PropXYZ "Map Browser". PropXYZ: referencia clean-room, no se copió código ni assets.
- `geo-map.tsx` adaptado de MapCN, MIT License · Copyright (c) 2025 Anmoldeep Singh.
- maplibre-gl, BSD-3-Clause, Copyright (c) 2023, MapLibre contributors.

Ver NOTICE.
