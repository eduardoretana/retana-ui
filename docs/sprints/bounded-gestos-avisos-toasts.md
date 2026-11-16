# bounded-gestos-avisos-toasts · carril acotado de UI (retana-ui PR #83)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/gestos-avisos-toasts-1153
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/gestos-avisos-toasts.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-gestos-avisos-toasts-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `notification-stack`, `toast-stack` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-gestos-avisos-toasts-experience-quality.md

## Scope

- docs/sprints/bounded-gestos-avisos-toasts.md
- docs/sprints/bounded-gestos-avisos-toasts-experience-quality.md
- ui/specs/gestos-avisos-toasts.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: La pila de avisos y el toast cambian el gesto de salida (seguir el dedo, salir con la velocidad del release) y el Toaster compartido del layout deja el swipe de Sonner. Piezas existentes; no hay pieza ni pantalla nueva. El perfil STANDARD lo fijó el UI Lead en `ui/status/gestos-avisos-toasts.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: YES
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Referencias del ciclo

- PR: eduardoretana/retana-ui#83 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- Spec versión 0.1.1; status `ui/status/gestos-avisos-toasts.ui-status.yaml` en `AUDITORIA`, con el tip de código `bcd4c44d81d8287dde8cf291d7c364ee74d8ea83`
- Dirección por referencia: `ui/direction/gestos-avisos-toasts/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
