---
artifact_id: spec-retana-ui-collection-views
owner: lead
spec_version: 0.1.1
head: 8cfdaf29c71d087391da72a6176449a82faec02f
profile: STANDARD
spec_id: retana-ui-collection-views
version: 0.1.1
spec_changelog:
  - version: 0.1.0
    origin: new
    note: Primera spec de la pieza. Perfil STANDARD.
  - version: 0.1.1
    origin: capture
    note: Seed versionado, healthcheck y la dependencia de DESIGN.md del PR 59.
ui_system: "4.0.0"
brief:
  outcome: Una colección cambia entre tablero, lista y línea de tiempo con un morph continuo, gobernado por una píldora.
  benefit: Quien lee la colección reconoce el mismo elemento al cambiar de vista, sin un corte duro.
  sources:
    - url: https://x.com/desdivj/status/2115772554199867776
      license: no publicada
      use: clean-room, solo idea, interacción, layout y motion
    - catalog: segmented-control
    - catalog: avatar
  scope: registry/ui/collection-views.tsx, registry/lib/collection-morph.ts y el ejemplo PLP. No modifica multi-view.
  checks: Vitest, Playwright en 390 y 1280, animación solo con transform y opacity, tokens del host.
  stop_when: Las tres vistas comparten grupo, cáscara, título y avatares; el resorte no rebota; con reduced-motion no hay morph; vacío, carga y error se leen; el build del registry no introduce color literal.
  deliverable: Pieza collection-views en el registry, ejemplo PLP, pruebas y este expediente.
scope_paths:
  - registry/ui/collection-views.tsx
  - registry/lib/collection-morph.ts
  - app/examples/collection-views
  - __tests__/collection-morph.test.ts
  - __tests__/collection-views.test.tsx
  - __tests__/collection-views-reduced.test.tsx
  - e2e/collection-views.spec.ts
users:
  - Lector de una colección que alterna tablero, lista y cronograma.
  - Lector con prefers-reduced-motion.
  - Lector de español de México y de inglés.
states:
  idle: Escena filled. Tablero con pedidos del Taller Lumen.
  pending: Escena loading. El cuerpo es un esqueleto y aria-busy.
  success: onViewChange deja la vista elegida y el elemento compartido sigue en el árbol.
  error: Alerta con el texto del host y botón Reintentar.
  empty: Colección sin elementos.
  partial: Búsqueda sin coincidencias. El cromo sigue; el cuerpo explica que no hay resultados.
  offline: No aplica. La pieza no llama a la red.
  rollback: El reintento limpia la bandera de error de la escena. La persistencia es del host.
  permission_denied: No aplica. No hay autorización.
  overflow: Escena crowded y título de 60 caracteres sin espacios. El tablero hace scroll horizontal.
  i18n_long: Etiquetas es-MX por defecto y collectionViewsLabelsEn. El título largo se parte en el tablero y se recorta en la fila.
data:
  items: id, groupId, title, detail opcional, people opcional, start y end inclusivos YYYY-MM-DD en UTC.
  groups: id y label.
  today: día UTC que marca el cronograma. El ejemplo fija 2026-10-30.
brand_constraints:
  - Heredar el tema del host. Sin cssVars, hex, ni paleta de Tailwind.
  - RUI-RADIUS-001. Radios por paso. El círculo 1:1 queda en el avatar del host.
  - Color fuerte solo en la píldora activa y en la barra que cubre today.
  - La marca no se copia aquí. La trae el PR 59 en rules/brand/retana-ui.tokens.json y ui/design/retana-ui/DESIGN.md.
retana_ui:
  sha: 8cfdaf29c71d087391da72a6176449a82faec02f
  registry_source: git-sha
components:
  retana:
    - segmented-control
  candidates_local:
    - collection-views
    - collection-morph
  retana_ui_layer: native
visual_risk: medium
copy:
  locale_default: es-MX
  english: collectionViewsLabelsEn
direction:
  reference_id: desdivj-collection-views
  profile: STANDARD
  note: La imagen es dirección, no especificación. No se copia al bundle.
non_goals:
  - Extender multi-view o su esquema de campos.
  - El encuadre, el zoom y el blur de la grabación.
  - El cromo de aplicación (barra lateral de producto) de la referencia.
  - Fork del control segmentado para cambiarle el resorte.
acceptance:
  - id: AC-VIEW-001
    measure: La píldora expone Tablero, Lista y Cronograma. data-view sigue el valor presionado.
    test: __tests__/collection-views.test.tsx
  - id: AC-KEYS-001
    measure: Flecha derecha mueve la selección de Tablero a Lista.
    test: __tests__/collection-views.test.tsx
  - id: AC-MORPH-001
    measure: El resorte es type spring, bounce 0 y visualDuration entre 0.6 y 0.8 s.
    test: __tests__/collection-morph.test.ts
  - id: AC-MORPH-002
    measure: Con movimiento, el título tiene data-shared que termina en :title:<id>.
    test: __tests__/collection-views.test.tsx
  - id: AC-MORPH-003
    measure: La barra anima scaleX y opacity. El fuente no contiene transition-all, blur(), will-change ni box-shadow animado.
    test: __tests__/collection-morph.test.ts
  - id: AC-REDUCED-001
    measure: Con reduced-motion, data-motion es crossfade y no hay data-shared.
    test: __tests__/collection-views-reduced.test.tsx
  - id: AC-STATE-EMPTY
    measure: Sin items se lee «Esta colección no tiene elementos.»
    test: __tests__/collection-views.test.tsx
  - id: AC-STATE-LOADING
    measure: role=status y aria-busy, sin los títulos de los pedidos.
    test: __tests__/collection-views.test.tsx
  - id: AC-STATE-ERROR
    measure: role=alert y Reintentar llama onRetry.
    test: __tests__/collection-views.test.tsx
  - id: AC-STATE-PARTIAL
    measure: Una búsqueda sin aciertos muestra el vacío de coincidencias y conserva la píldora.
    test: __tests__/collection-views.test.tsx
  - id: AC-I18N-001
    measure: collectionViewsLabelsEn muestra Board y el texto en inglés de sin coincidencias.
    test: __tests__/collection-views.test.tsx
  - id: AC-INPUT-001
    measure: El buscador es searchbox y su clase incluye text-base (16 px en el teléfono).
    test: __tests__/collection-views.test.tsx
  - id: AC-TIMELINE-001
    measure: Con today 2026-10-30 hay dos barras y una sola data-current=true, más la marca de hoy.
    test: __tests__/collection-views.test.tsx
  - id: AC-LAYOUT-001
    measure: En 390×844 y 1280×800 el documento no desborda en X. En cronograma la barra llega a opacidad y escala de reposo.
    test: e2e/collection-views.spec.ts
  - id: AC-TOKEN-001
    measure: registry:build rechaza hex, rgb/oklch y clases de paleta en registry/.
    test: pnpm registry:build
  - id: AC-SEED-001
    measure: El seed imprime tablero, lista y cronograma con filled no vacío, más vacío, carga, error, es-MX, EN y reduced=1. /api/health responde 200 sin redirección.
    test: node scripts/collection-views-seed.mjs --base http://127.0.0.1:40000
---

# Vistas de colección

Pieza propia. No extiende `multi-view`. El morph vive en `registry/lib/collection-morph.ts` y no conoce el taller del ejemplo.

La referencia pública no tiene licencia. Se toma la interacción: tablero, lista y cronograma con elementos compartidos, resorte sin rebote de 0.6 a 0.8 s, y una píldora. El texto de la spec manda sobre la imagen.
