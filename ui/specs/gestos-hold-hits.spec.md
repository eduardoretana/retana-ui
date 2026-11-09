---
spec_id: gestos-hold-hits
version: 0.1.0
profile: LITE
ui_system: 4.0.0
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
ideas: [4, 8]
---

# Hold, hits y retorno de detent

Perfil LITE. No hay flujo nuevo ni variantes de Dirección.

El plan y los AC están en `docs/plans/2026-11-09-gestos-hold-hits.md`.

## Brief

- Outcome: cancelar el hold es rápido, los blancos táctiles cubren 44 px y el regreso al mismo detent no tarda 0.4 s.
- Benefit: el control no discute en cámara lenta y se puede tocar.
- Sources: validación sobre CPL `6671cfac`, `/gestures` pin `715c180`, snapshot `419ad648`, `rules/a11y.md`.
- Scope: `hold-to-confirm`, `bottom-sheet`, la clase del asa, ejemplos y pruebas.
- Checks: AC-1…AC-4 y `anim_perf_lint` sin flags.
- Stop when: suite y build en verde. Status en AUDITORIA. Sin autoauditoría.
- Deliverable: PR borrador contra CPL.

## Non-goals

Sin cambiar el fill linear. Sin editar `spring.smooth`. Sin reabrir el track de la hoja. Las escenas del asa viven en el PR de seguimiento.
