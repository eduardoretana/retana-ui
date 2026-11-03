# Dirección — ci-checks-library

Perfil STANDARD. Eje de variante: **densidad de la pieza abierta**. Misma información, distinta composición. Sin imágenes generadas: el proveedor de dirección no se usa porque el eje cabe en una prop y los datos son los de la fixture. Degradado de texto, no de marca (`text-degraded`). La imagen del post es dirección de interacción, no de píxeles (ley 12 y 13).

## Variante A — `rail` (elegida)

Riel vertical. El commit, el check y el paso del arreglo ocupan una fila completa: texto, meta y barra apilados. El chip y la pastilla siguen siendo una sola línea cuando están cerrados.

## Variante B — `compact`

La pieza abierta reparte commits y checks en una retícula de dos columnas a partir de `sm`. En 390 px cae a una columna porque el breakpoint `sm` es 640. La barra y la palabra de estado se conservan. El botón de fusión mete la frase de estado en su nombre visible, en vez de ponerla encima.

## Elección

Se queda `rail` como `variant` por defecto.

Criterio:

1. A 390 px una retícula de dos columnas aprieta el nombre del check. El riel ya es una columna y no depende del breakpoint.
2. El post original recibió la crítica de carga cognitiva. Una fila por hecho se lee en orden; la retícula obliga a saltar.
3. El teclado encuentra un disclosure y después una lista, no una nube de celdas.
4. `compact` se conserva en la prop para un host que ya tiene un escritorio ancho y quiere densidad. No es la miniatura del catálogo.

Elegido por el UI Lead de este encargo (perfil STANDARD: elige el Lead). No es D1.
