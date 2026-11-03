# Dirección — constructor de reglas

Modo: text-degraded. No se generaron imágenes. El tema es el del host y la elección es un eje de layout, no de marca. RUI-TOOLS-001 sigue pendiente en el hub.

## Eje

`variant_axis`: disposición del constructor Cuando / Condiciones / Entonces.

## Variante A — tres columnas

En 1280, Cuando | Condiciones | Entonces en tres columnas. En 390 se apilan igual, pero el árbol de condiciones queda angosto entre columnas que ya no existen. El orden de tabulación salta de columna. Se exploró en papel: sirve para escanear las tres partes a la vez en un escritorio y pierde en el ancho que este catálogo exige (390 px).

## Variante B — una columna, elegida

Tres secciones en el orden de la frase, con la lectura (`describeRule`) arriba. Un solo orden de teclado. A 390 no hay columnas que colapsar. A 1280 la columna sigue siendo legible porque la regla se lee de arriba a abajo, no de lado a lado.

Criterio: la condición anidada es la parte alta. Darle el ancho completo importa más que mostrar las tres cabeceras en paralelo. `data-layout="stacked"` marca la variante en el DOM.

## Scorecard

| | A columnas | B apilada |
| --- | --- | --- |
| 390 px | se aplasta | se lee |
| Teclado | salta | sigue la frase |
| Traza y edición | el árbol queda corto | el árbol usa el ancho |
| Traducción es/EN | igual | igual |

Elección del Lead de este ciclo: B.
