# Excepciones de color

Las piezas del registry usan solo tokens del tema del host. Este documento lista los únicos archivos que pueden fijar colores.

## EX-01 · Colores realistas en piezas anatómicas, de imagen médica y moleculares (OrganUI)

- **Motivo:** las escenas anatómicas necesitan un aspecto realista. Los tokens del tema no pueden representar tejido, hueso, piel ni la convención CPK de los elementos químicos. Además, la radiología se muestra sobre negro.
- **Qué se permite:** colores fijos (hex, `oklch()`, `#000`) e iluminación 3D original de OrganUI, **solo** en la escena y en los datos de estas piezas:
  - `registry/ui/organ-*.tsx` (43 modelos) y `registry/ui/organ-viewer.tsx`
  - `registry/ui/molecule-viewer.tsx` (colores CPK, cadenas, estructura secundaria)
  - `registry/ui/dna-helix.tsx` (bases nitrogenadas)
  - `registry/ui/dermatome-map.tsx` (paleta clínica por región)
  - `registry/ui/image-viewer.tsx` (lienzo negro de radiología)
- **Qué NO cambia:** botones, paneles, barras de herramientas, textos, tooltips, bordes y overlays siguen usando tokens del tema. El resto de las piezas de salud (vital-signs, lab-results, body-map, ecg-trace, growth-chart, medication-schedule, anatomy-tree y los bloques) no tienen excepción.
- **Cómo se aplica:** `scripts/validate-registry.ts` → `isScientificColorException()` excluye del escaneo de colores fijos **solo** esos archivos. Cualquier archivo nuevo sigue validándose. Agregar uno a la lista requiere otra entrada en este documento.
