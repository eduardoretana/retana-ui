# bounded-context-window-eventos · carril acotado de UI (retana-ui PR #75)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/context-window-functional-c9b3
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/context-window-eventos.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-context-window-eventos-ui/enrollment.json
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

Base de la clasificación: La ventana de contexto sigue eventos, avisa al cruzar el umbral, compacta cuando el anfitrión lo decide y estima el costo. Extensión de la pieza context-window. El perfil STANDARD lo fijó el UI Lead en `ui/status/context-window-eventos.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.

## Referencias del ciclo

- PR: eduardoretana/retana-ui#75 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/context-window-eventos.ui-status.yaml` en `AUDITORIA`, con el tip de código `db19a518cddc7b1461f2e47c9470a7de4d93088e`
- Dirección por referencia: `ui/direction/context-window-eventos/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
