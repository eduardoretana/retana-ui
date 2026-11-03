# Propuesta RUI-CONFLICT-001

No se toca el hub. Esta nota solo propone la regla para que alguien del sistema la incorpore.

## Id

`RUI-CONFLICT-001`

## Texto

Un choque de reserva no se señala solo con color.

Si dos intervalos del mismo recurso se solapan, la interfaz muestra icono y texto en el evento y un conteo en el encabezado. El texto entra en el nombre accesible. El conteo es un control de teclado que lleva el foco a un evento en conflicto. El color puede acompañar; no puede ser la única señal.

El intervalo es semiabierto: terminar cuando otro empieza no es choque.

## Por qué

El color rojo no lo oye un lector de pantalla y no lo distingue todo el mundo. Un solape de fin con inicio es un relevo, no una doble reserva. Mezclar recursos distintos en el mismo aviso culpa a la persona equivocada.

En el catálogo, `placeOverlaps` solo reparte columnas visuales. No nombra al otro evento ni publica un conteo. Esta extensión de `agenda` es el primer caso; la regla evita que el siguiente calendario vuelva al punto de color.

## Cómo verificarla

1. Dos eventos del mismo recurso con intersección estricta. El evento muestra un icono con `aria-hidden` y un texto que nombra el choque. El nombre accesible del control incluye ese texto.
2. El encabezado muestra la cantidad en texto, no solo un punto de color, y se llega con Tab. Activarlo mueve el foco a un evento en conflicto.
3. Un par cuya hora de fin es igual a la hora de inicio del otro no muestra el aviso.
4. El mismo solape en dos recursos distintos no muestra el aviso.
5. Contraste del texto del aviso contra su fondo, en claro y oscuro, al menos 4.5:1 (WCAG 2.2 AA). El texto no puede ser el único píxel de un color nuevo fuera de los tokens del tema.

Prueba de esta pieza: `__tests__/agenda-resources.test.tsx`, caso «announces a conflict on the event and in the header, and keyboard reaches it».
