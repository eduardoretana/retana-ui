---
spec_id: ci-checks-live
version: 0.1.0
profile: STANDARD
origin: brief
ui_system: 4.0.0
---

# Spec — CI Checks Live

## Fuente y licencia

Misma idea que la familia de biblioteca: Phil Pitus, Generative UI #6, https://x.com/pitus_/status/2117270206464631028. **Idea only, sin licencia.** El cliente HTTP sigue la documentación pública de GitHub y usa payloads de ejemplo anonimizados. No se llama a un repositorio real en las pruebas.

## Brief

1. **Outcome.** Un host lee checks de GitHub (check runs y commit statuses, Vercel incluido) y los muestra con las piezas de la familia. La fusión, si se enciende, pide confirmación y pasa por `ApprovalGate`.
2. **Benefit.** El token no llega al navegador. El panel nace cerrado. Los tiempos estimados se declaran.
3. **Sources.** El brief, la familia `ci-checks-library`, la convención del UI Lead (`retana-ui.json`, `registry:lib`, RUI-TOOLS-001) y la REST de GitHub.
4. **Scope.** `registry/lib/ci-checks/**` (núcleo y adaptador), `registry/hooks/use-ci-checks.ts`, `registry/blocks/ci-checks-live.tsx`, las rutas de ejemplo, `app/herramientas`, los docs y las pruebas. No incluye el motor de guardas real: solo el puerto.
5. **Checks.** Las pruebas de `__tests__/ci-checks-*.test.ts`, pureza, `pnpm typecheck:strict-host`, `pnpm test`, `pnpm build`.
6. **Stop when.** Sin confirmación no hay `PUT`. El token no está en los archivos de cliente. El núcleo no importa React.
7. **Deliverable.** PR borrador apilado sobre `cursor/ci-checks-library-ac89`.

## Criterios

### AC-L1
- measure: un check run documentado y un status de Vercel salen del normalizador con `passed` y el status marcado como Vercel.
- test: `__tests__/ci-checks-core.test.ts` "maps a documented check run".

### AC-L2
- measure: la secuencia queued → running → failed → queued (otro id) → passed.
- test: "walks queued, running, failed, rerun, and passed".

### AC-L3
- measure: 304 conserva el ETag; 401, 403, 404 y 422 tienen código; el límite secundario espera `retry-after`; el primario espera el reset.
- test: "poll errors".

### AC-L4
- measure: una firma HMAC mala no parsea; check_run, check_suite y status con firma buena sí.
- test: "webhook".

### AC-L5
- measure: `performMerge` no llama a `send` si no hay confirmación, si la fusión está apagada, o si el gate no concede.
- test: "merge guard".

### AC-L6
- measure: sin token no hay fetch. Con token, la petición a GitHub lleva `Bearer` y el JSON devuelto al cliente no contiene el token.
- test: "server handler".

### AC-L7
- measure: el panel de la herramienta nace cerrado. Con la fusión apagada el botón está deshabilitado. Con la fusión encendida, el primer clic no llama al transporte.
- test: `__tests__/ci-checks-live.test.tsx`.

### AC-L8
- measure: los archivos del cliente y del núcleo no contienen `CI_CHECKS_GITHUB_TOKEN` ni `process.env`. El barrel no importa el adaptador.
- test: `__tests__/ci-checks-token.test.ts`.

### AC-L9
- measure: el ítem `ci-checks-core` no importa react, react-dom, next, CSS ni components. Un texto que sí lo hace hace fallar el detector.
- test: `__tests__/tool-core-purity.test.ts`.

## No objetivos

- Un agente que edite código.
- Fundir con el motor de guardas que todavía no está en `CPL`. El puerto queda listo.
- Paginar más de 100 check runs.

## Riesgos

Cupo de GitHub, fusión accidental (apagada por defecto), Vercel como status y no como check run, barras estimadas. El panel cerrado baja la carga cognitiva.
