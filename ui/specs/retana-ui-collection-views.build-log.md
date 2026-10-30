---
artifact_id: build-log-retana-ui-collection-views
owner: builder
spec_version: 0.1.0
head: 8cfdaf29c71d087391da72a6176449a82faec02f
profile: STANDARD
spec_id: retana-ui-collection-views
ui_system: "4.0.0"
---

# Build log

## needs

- El resorte de la píldora no se iguala al de la colección. `segmented-control` ya existe y la spec prohíbe forkealo. El morph de las tarjetas usa `collectionMorphSpring`.
- `anim_perf_lint.mjs` del hub no está en este entorno (el repo del hub no es visible). El sustituto es el chequeo de fuente en `__tests__/collection-views.test.tsx` para RUI-ANIM-PERF-001 a 006: nada de `transition-all`, `blur()`, `will-change`, `box-shadow` ni animación de width/height/top/left.
- El generador de fixtures del hub no está en este repo. La fixture se escribió a la forma y su sha256 queda en el status.

## spec_defect

Ninguno.

## candidates_detected

- `collection-views` es la pieza nueva de este registry. No sustituye a `multi-view`.
- `collection-morph` es el contrato genérico, sin dominio.

## commands

Los logs crudos con este `head` están en `ui/evidence/retana-ui-collection-views/`.
