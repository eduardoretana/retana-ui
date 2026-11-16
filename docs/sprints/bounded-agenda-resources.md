# bounded-agenda-resources · carril acotado de UI (retana-ui PR #67)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/agenda-resource-schedule-fca1
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/agenda-resources.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-agenda-resources-ui/enrollment.json
- **UI surface impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES

## Dimensiones de impacto

- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

Base de la clasificación: La agenda suma eje de recursos, filtro, choque accesible y cupo; sin resources el contrato previo no cambia. Extensión de la pieza agenda; no hay pieza nueva. El perfil STANDARD lo fijó el UI Lead en `ui/status/agenda-resources.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.

## Referencias del ciclo

- PR: eduardoretana/retana-ui#67 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/agenda-resources.ui-status.yaml` en `AUDITORIA`, con el tip de código `d9e01ac8919e999b6c5a22de2590f6017acbc165`
- Dirección por referencia: `ui/direction/agenda-resources/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
