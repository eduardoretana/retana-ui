# Experience quality · capacity-map

## Variantes (se eligió una)

| Variante | Qué es | Decisión |
|---|---|---|
| A. Aisle (por defecto) | Dos filas que se miran, con un separador con nombre | Elegida en escritorio: es el patrón espacial que añade la pieza. |
| B. Wrap | Rejilla que envuelve | Mejor en un panel estrecho; se usa en la página de estrés. |
| C. List | Cada cupo es una fila de texto | Alternativa accesible y para nombres largos. |

A 390 px los grupos se apilan. No hay pestaña Mapa/Lista: escondería el resaltado cruzado.

## break-ui

- 500 cupos en una zona abierta (`stressZones(500)` y `/examples/capacity-map/stress`).
- Nombre de cupo y de zona muy largos (`longNameZones`), completos en el nombre accesible.
- Estado propio (`held` / «En espera»).
- Demanda que supera la capacidad: aviso y Descartar.

## Reduced motion

Chevrones y barras usan `motion-reduce:transition-none`. El popover declara `motion-reduce:animate-none`. La previsión cambia de estado sin animar el llenado.

## Evidencia de capturas

Arnés `21db9481b331`. Rutas y manifiesto en `/workspace/shadcnstudio-2026-11-27-capacity-map/capturas/`.
