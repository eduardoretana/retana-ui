# bounded-coreografia-touch · carril acotado de UI (retana-ui PR #68)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/emil-choreograph-touch-7860
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/coreografia-touch.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-coreografia-touch-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: `comment-thread`, `dashboard-analitico-ae`, `hero-section`, `multi-view`, `notification-stack`, `shortcut-recorder`, `slide-to-confirm`, `stagger-reveal`, `user-menu`, `view-calendar`, `view-kanban`, `view-timeline` (registry retana-ui; rutas de ejemplo, estrés y escenas)
- **Experience evidence file**: docs/sprints/bounded-coreografia-touch-experience-quality.md

## Scope

- docs/sprints/bounded-coreografia-touch.md
- docs/sprints/bounded-coreografia-touch-experience-quality.md
- ui/specs/coreografia-touch.spec.md

## UI Surface Impact Gate

- **UI Surface Impact**: INTERACTION_FLOW
- **Design delivery profile**: FLOW
- **UI impact evidence**: Coreografía de entrada con tope (registry/lib/motion.ts, compartido) y activación táctil que distingue tap, scroll y arrastre en piezas existentes. El perfil STANDARD lo fijó el UI Lead en `ui/status/coreografia-touch.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.
- **Visible control impact**: YES
- **Interaction flow impact**: YES
- **Visible copy/state impact**: NO
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Referencias del ciclo

- PR: eduardoretana/retana-ui#68 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/coreografia-touch.ui-status.yaml` en `AUDITORIA`, con el tip de código `6cdabab074a6c8b98a1c09b4ea6788ae7d29bfb5`
- Dirección por referencia: `ui/direction/coreografia-touch/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
