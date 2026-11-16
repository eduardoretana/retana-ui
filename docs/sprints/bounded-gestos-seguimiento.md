# bounded-gestos-seguimiento · carril acotado de UI (retana-ui PR #84)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-seguimiento-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-seguimiento.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-seguimiento-ui/enrollment.json
- **UI surface impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES

## Dimensiones de impacto

- **Visible control impact**: NO
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

Base de la clasificación: El asa de slide-to-confirm y la barra de view-timeline siguen el dedo 1:1 durante el arrastre; mismos controles, nuevas escenas de estado. Piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-seguimiento.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.

## Referencias del ciclo

- PR: eduardoretana/retana-ui#84 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-seguimiento.ui-status.yaml` en `AUDITORIA`, con el tip de código `f572f34b4fca79d38c0bf811dd4aee737cf533d3`
- Dirección por referencia: `ui/direction/gestos-seguimiento/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
