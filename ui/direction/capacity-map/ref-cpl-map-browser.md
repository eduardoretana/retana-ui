# REF-cpl-map-browser

- kind: visual / código ya en CPL
- origen: `eduardoretana/retana-ui@bf1682d4dfb8696ddb01bf84aedda111f47b086c`, piezas `map-browser` (`registry/blocks/map-browser.tsx`, `registry/lib/map-browser.ts`) y, como contraste, `planning-grid` y `WorkSlaCell`.
- qué se reutiliza: la regla de que la lista o la tabla es la fuente accesible, y el resaltado al pasar o enfocar. No se extiende `map-browser` (es un mapa geográfico) ni `planning-grid` (plan por periodo).
- qué no se copia: el motor de tiles, los clústeres ni el slider de crecimiento del plan.
