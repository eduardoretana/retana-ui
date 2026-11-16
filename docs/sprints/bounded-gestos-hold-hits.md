# bounded-gestos-hold-hits · carril acotado de UI (retana-ui PR #85)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-hold-hits-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-hold-hits.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-hold-hits-ui/enrollment.json
- **UI surface impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES

## Dimensiones de impacto

- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

Base de la clasificación: hold-to-confirm cancela rápido, los blancos táctiles pasan a 44 px (clase del asa compartida) y bottom-sheet vuelve al mismo detent sin la espera de 0.4 s. Piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-hold-hits.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.

## Referencias del ciclo

- PR: eduardoretana/retana-ui#85 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-hold-hits.ui-status.yaml` en `AUDITORIA`, con el tip de código `cd46531b8ab39f9a40c31c8dbd6f6b8b2c3eb619`
- Dirección por referencia: `ui/direction/gestos-hold-hits/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
