# bounded-piloto-vue · carril acotado de UI (retana-ui PR #86)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola pieza o extensión, una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/piloto-vue-tokens-5483
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI spec**: ui/specs/piloto-vue.spec.md
- **UI System profile**: STANDARD
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-piloto-vue-ui/enrollment.json
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

Base de la clasificación: Tokens DTCG compartidos y tres piezas existentes (time-off-stats, decision-inbox, lightbox) portadas a SFC Vue y una vista Razor; el lightbox reenvía sus etiquetas. Port de piezas existentes, no pieza ni pantalla nueva del catálogo (el UI Lead puede reclasificar). El perfil STANDARD lo fijó el UI Lead en `ui/status/piloto-vue.ui-status.yaml`; el impacto derivado (flujo de interacción, sin creación ni reestructura de superficie) pide como mínimo STANDARD.

## Referencias del ciclo

- PR: eduardoretana/retana-ui#86 (borrador, base CPL)
- retana_ui sha de partida: `33438d12520bbf9fe18ebc87f29df2a3122d02b6`
- Spec versión 1.0.0; status `ui/status/piloto-vue.ui-status.yaml` en `AUDITORIA`, con el tip de código `4476214dbabe6708f9b3755f0aee6c81e7d5b367`
- Dirección por referencia: `ui/direction/piloto-vue/reference-meta.yaml`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
- El enrollment lo prepara el UI Lead con `retana-ui-system.py enroll`; queda en `PENDING` y no se versiona desde esta rama.
