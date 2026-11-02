# Plan de pruebas — bento-grid

Estas pruebas se escribieron antes del código. Deben fallar en el head `6671cfac72f736739d2d3dd2740cc5f13416acb3` con la firma de `ui-tests/expected-red.yaml`.

| Archivo | Cubre |
| --- | --- |
| `__tests__/bento-grid.test.tsx` | AC-1 a AC-6. Una columna a 390 px, desktop, spans, orden, una celda, vacío, carga, error. |
| `__tests__/bento-feature-card.test.tsx` | AC-7 a AC-13. Slots, un solo enlace, hover, foco, token largo, composición, dos layouts. |
| `__tests__/bento-magnetic-contract.test.tsx` | AC-14. Preset magnético sobre la base. |
| `__tests__/magnetic-bento.test.tsx` | Contrato previo. No se edita. Tiene que seguir en verde después del build. |

Manual, después del build: 390 px, desktop, zoom 200 %, teclado, `prefers-reduced-motion`, textos largos. Evidencia en capturas, no en esta suite.
