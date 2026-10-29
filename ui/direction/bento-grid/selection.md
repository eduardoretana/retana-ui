# Elección — bento-grid

Perfil STANDARD. No se generaron imágenes: la dirección son dos variantes reales en código. Eje único: tratamiento de la zona de ilustración. Misma tarjeta, mismo texto, mismo hueco.

| Variante | Layout | Qué cambia |
| --- | --- | --- |
| A `media-first` | `layout="media-first"` | La ilustración ocupa el alto libre arriba. Título, icono, descripción y CTA quedan abajo. |
| B `copy-first` | `layout="copy-first"` | El texto va primero. La ilustración cierra la celda. |

## Scorecard

| Criterio | A media-first | B copy-first |
| --- | --- | --- |
| Se parece a lo visto en el video | La mayoría de las fichas muestran el dibujo arriba y el título abajo. | Aparece en algunas fichas (texto arriba, diagrama abajo). |
| La celda se llena | El dibujo crece con `flex-1`. | También, pero el mensaje compite con el dibujo antes de que el ojo baje. |
| Traducible a tokens | Sí. | Sí. |
| Lectura | El título sigue al dibujo, en orden del DOM. | El título llega antes. Mejor si la celda es baja. |

## Elegida

**A, `media-first`.** Es el default de `BentoFeatureCard`. B queda en la API para celdas donde el texto tiene que leerse antes del dibujo.

Capturas (se agregan al cerrar el build, desde la ruta `/examples/bento-grid/direction`):

- `ui/direction/bento-grid/variant-media-first.png`
- `ui/direction/bento-grid/variant-copy-first.png`

No hay `job_id` ni costo: no hubo proveedor de imágenes.
