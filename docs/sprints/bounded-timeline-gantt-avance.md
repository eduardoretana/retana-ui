# bounded-timeline-gantt-avance · carril acotado de UI (retana-ui PR #69)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gantt-progress-panel-fc07
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/timeline-gantt-avance.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-timeline-gantt-avance-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `timeline-gantt` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-timeline-gantt-avance-experience-quality.md

## Scope

- docs/sprints/bounded-timeline-gantt-avance.md
- docs/sprints/bounded-timeline-gantt-avance-experience-quality.md
- ui/specs/timeline-gantt-avance.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: El cronograma muestra avance y resumen de fase y permite editar una tarea desde un panel. Extensión de la pieza timeline-gantt. El perfil STANDARD lo fijó el UI Lead en `ui/status/timeline-gantt-avance.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: NO
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Referencias del ciclo

- PR: eduardoretana/retana-ui#69 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/timeline-gantt-avance.ui-status.yaml` en `AUDITORIA`, con el tip de código `a28a5a7c36b7c0701db6f3e12c4701adf20d9b49`
- Dirección por referencia: `ui/direction/timeline-gantt-avance/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
