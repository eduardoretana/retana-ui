# Mapa de dirección · capacity-map

| Decisión | Referencia | Nuestra pieza | Motivo |
|---|---|---|---|
| Dominio | Estacionamiento | Clínica ficticia «Alameda» (cubículos y camillas) | Encargo: genérico, sin copiar los datos del ejemplo. |
| Alcance | Tablero completo | Primitiva `capacity-map` + tabla de composición | Tablas, franjas y celdas de acción ya existen o están en #81. |
| Simulación | Slider + aplicar + descartar | Solo previsión y descartar | El encargo pide no guardar nada. |
| Resaltado | Hover fila → cupo | Bidireccional, anillo de `ring`, tabla como fuente accesible | Color solo no basta (1.4.1). Ya lo hace `map-browser` en geo. |
| 390 px | No se observó | Grupos apilados, dos filas si caben, sin pestaña Mapa/Lista | Una pestaña escondería el resaltado cruzado. |
| Celda de tiempo | En la tabla del bloque | Rama local `feat/time-window-cell`, no esta pieza | No acoplar #81 ni inflar el mapa. |
