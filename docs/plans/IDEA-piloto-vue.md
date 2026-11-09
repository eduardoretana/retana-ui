# IDEA — Piloto de tokens y tres piezas Vue

- spec_id: `piloto-vue`
- fecha: 2026-11-09
- perfil: STANDARD (UI Lead, VibeBot, sube el piloto desde LITE)
- retana_ui.sha: `6671cfac72f736739d2d3dd2740cc5f13416acb3`
- ui-system: 4.0.0 (snapshot `419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`; el Hub vivo respondió 404)

## Problema

retana-ui es un registry de shadcn: se copia fuente React. La app viva de Eduardo es Vue 3 + Vuetify, sin Tailwind y sin shadcn-vue. Razor necesita HTML y variables, no un runtime de componentes. Hoy el contrato de color no tiene nombre: vive en las clases del demo.

## Propuesta

Fase 0: un JSON DTCG con los nombres semánticos que el host ya usa. Los valores son de cada marca. El demo del sitio queda opt-in. Tres piezas Vue escritas a mano (`time-off-stats`, `decision-inbox`, `lightbox`), fuera de `registry.json`, con una hoja compilada que solo usa `var(--*)` y un prefijo para no chocar con Vuetify.

## Aprobación

Eduardo, citado: «Sí, arranca el piloto de tokens y 3 piezas en Vue en PR borrador.»

Después confirmó: «La app viva es canal-semilla.»

## Qué no es

No es un paquete npm. No es un PR a canal-semilla. No es merge ni deploy. No porta las 422 piezas. No mete Vaul ni código de gestos.
