# CI Checks Live

Herramienta para leer los checks de un pull request y, si el anfitrión la enciende, fusionarlo. La demo del catálogo no llama a GitHub. Los nombres del Taller Ladrillo son ficticios.

Licencia de la idea de interfaz: **idea only, sin licencia**. Fuente: Phil Pitus, Generative UI #6, https://x.com/pitus_/status/2117270206464631028. No se copió código ni layout. El cliente de la API sigue la documentación pública de GitHub.

## Instalación

1. Instala el núcleo `ci-checks-core`, el adaptador `ci-checks-github` y el bloque `ci-checks-live`. Si el CLI pregunta si debe sobrescribir `button` u otra pieza que el host ya tiene, la respuesta es **no**.
2. Copia las rutas de ejemplo `app/api/ci-checks/...` o llama a `readPullChecks` y `mergePullRequest` desde tu propio servidor.
3. El token vive solo en el servidor:

```bash
CI_CHECKS_GITHUB_TOKEN=          # fine-grained PAT o instalación de GitHub App
CI_CHECKS_WEBHOOK_SECRET=        # solo si usas webhook
CI_CHECKS_MERGE_ENABLED=         # vacío o distinto de true: la fusión queda apagada
```

No pongas el token en `NEXT_PUBLIC_` ni en un bundle de cliente. Una prueba lee los archivos del cliente y falla si aparecen `CI_CHECKS_GITHUB_TOKEN`, `process.env`, `ghp_` o `github_pat_`.

### Permisos mínimos

Fine-grained PAT o GitHub App, solo sobre el repositorio que vas a leer:

| Permiso | Cuándo |
|---|---|
| `checks:read` | check runs |
| `statuses:read` | commit statuses, incluidos los de Vercel |
| `pull_requests:read` | título, SHA, diff y commits |
| `contents:write` | solo si enciendes la fusión (`PUT /pulls/{n}/merge`) |

No pidas `contents:write` si la fusión sigue apagada. No pidas administración del repositorio.

## Referencia de API

El núcleo exporta funciones puras desde `@/lib/ci-checks` (en el catálogo, `registry/lib/ci-checks.ts`).

| Función | Qué hace |
|---|---|
| `normalizeCheckRunsPayload` / `normalizeStatusesPayload` | Llevan el JSON de GitHub al modelo `NormalizedCheck`. |
| `mergeChecks` | Si el mismo nombre está en las dos APIs, se queda el check run. |
| `estimateProgress` | Barra 0–1. En curso se estima. Ver limitaciones. |
| `interpretPoll` | 200, 304, 401, 403, 404, 422, límite primario y secundario. Devuelve `waitMs`. |
| `pollRequestHeaders` | Manda `If-None-Match` cuando hay ETag. |
| `readWebhook` / `verifyGithubSignature` | HMAC-SHA256 de `X-Hub-Signature-256`. El HMAC se inyecta. |
| `decideMerge` / `performMerge` | No llaman a la red. Sin confirmación, `send` no corre. |
| `alwaysAskApproval` | `ApprovalGate` que pide `confirmed` y `grantedBy`. |
| `createAgentFixPort` | Publica y escucha pasos. No hay agente. |
| `stripSecrets` | Quita `token`, `authorization`, `secret` y campos parecidos. |

El adaptador `createGithubAdapter({ token, fetchImpl })` es el único que habla con `api.github.com`. No lee `process.env`.

`readPullChecks` y `mergePullRequest` arman la respuesta HTTP. El navegador habla con tu ruta, no con GitHub.

### Modelo

`CheckStatus`: `queued | running | passed | failed | skipped | cancelled`.

Un check run `queued` sigue en cola. `in_progress` es `running`. `completed` + `success` o `neutral` es `passed`. `failure`, `timed_out` y `action_required` son `failed`. `skipped` y `stale` son `skipped`. `cancelled` es `cancelled`.

Un commit status `pending` se muestra como `running` porque esa API no separa cola y ejecución. `success` es `passed`. `failure` y `error` son `failed`.

## Sondeo y webhook

El sondeo manda `If-None-Match`. Un 304 no reemplaza el snapshot. Si `x-ratelimit-remaining` baja de 2, la espera llega hasta `x-ratelimit-reset`. Un 403/429 con `retry-after` o el texto "secondary rate limit", y con cupo restante, es límite secundario.

El webhook de ejemplo está en `app/api/ci-checks/webhook/route.ts`. Acepta `check_run`, `check_suite` y `status`. Cualquier otra cabecera `x-github-event` se ignora después de verificar la firma. Una firma mala responde 401 y no parsea el efecto.

```ts
import { createHmac } from "node:crypto"
import { readWebhook } from "@/lib/ci-checks"

const rawBody = await request.text()
const result = await readWebhook({
  event: request.headers.get("x-github-event"),
  rawBody,
  signatureHeader: request.headers.get("x-hub-signature-256"),
  secret: process.env.CI_CHECKS_WEBHOOK_SECRET ?? "",
  hmac: (key, body) => createHmac("sha256", key).update(body).digest("hex"),
})
```

En GitHub, el webhook del repositorio necesita el secreto y los eventos Check runs, Check suites y Statuses. No suscribas push ni el contenido del repositorio si solo quieres checks.

## Fusión

Apagada por defecto. Hace falta `CI_CHECKS_MERGE_ENABLED=true` y, aun así:

1. La persona pulsa Fusionar.
2. Confirma. Sin ese segundo paso no hay `PUT`.
3. `ApprovalGate.review` tiene que devolver `granted`. `alwaysAskApproval` solo lo hace si llegan `confirmed` y `grantedBy`.
4. Si GitHub responde 405 o 422 por la protección de la rama, la interfaz muestra el `message` (y los `errors[].message`) y no insiste.

Cuando exista el motor de guardas, sustituye el gate. El puerto ya se llama con la regla `require_approval`.

## El arreglo

`onCheckFailed` avisa al host. `AgentFixPort.publish` mete un paso en la línea de tiempo. Esta herramienta no clasifica logs ni edita archivos.

## Límites de GitHub

Los números cambian y manda la documentación vigente: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

- El cupo principal de REST para una GitHub App de instalación es distinto al de un PAT. Lee `x-ratelimit-limit`, `x-ratelimit-remaining` y `x-ratelimit-reset`.
- El límite secundario no se anuncia con un número fijo. Hay que honrar `retry-after`.
- Cada sondeo de esta herramienta puede gastar dos llamadas (check runs y status) más una del pull request cuando no hay 304.
- Un sondeo cada 15 segundos (`DEFAULT_POLL_MS`) contra muchos PR agota el cupo. Sube el intervalo o usa el webhook.
- La API de checks lista como máximo 100 runs por página. Esta versión lee la primera página. Si un SHA tiene más, el total puede quedar corto: es una limitación conocida.

## Limitaciones

- Los tiempos de las barras **son estimados** cuando el check sigue en curso, o cuando no hay `started_at` y `completed_at`. La estimación usa la mediana de duraciones previas de ese nombre y, si no hay historial, 60 segundos. La barra en curso no pasa de 0.95. La interfaz lo dice con la palabra «estimado».
- Vercel llega como commit status (`context` que contiene "Vercel"), no como check run. No trae una duración propia; el intervalo entre `created_at` y `updated_at` es lo único medible y a menudo es corto.
- La demo y las escenas PLP no salen a la red.
- No se pagina. No se reintenta un merge solo. No se borra un token de un log que el host escriba por su cuenta: no lo registres.

## Solución de problemas

| Síntoma | Qué mirar |
|---|---|
| 503 `missing_token` | `CI_CHECKS_GITHUB_TOKEN` está vacío en el servidor. No lo pongas en el cliente para «arreglarlo». |
| 401 | El token caducó o no es el de ese repo. |
| 403 sin límite | Falta `checks:read`, `statuses:read` o `pull_requests:read`, o la App no está instalada en el repo. |
| 404 | El número de PR o el SHA no existen, o el token no puede ver el repo privado. |
| 422 al fusionar | Protección de rama, SHA desactualizado o reviews pendientes. El texto de GitHub va al aviso. |
| 429 o 403 con espera | Límite. Respeta `retryAfterMs`. No bajes el intervalo. |
| La barra no coincide con GitHub | Es estimada. Mira la palabra junto al tiempo. |
| El panel sale abierto | No debería. `open` empieza en falso. Si el host pasa `open`, es el host. |
| Se fusionó sin querer | Con el flag apagado el `PUT` no sale. Si estaba encendido, hizo falta confirmación y un `grantedBy`. Revisa quién puso `CI_CHECKS_MERGE_ENABLED=true`. |

## Punto de unión

`docs/herramientas/union.md` y `docs/herramientas/RUI-TOOLS-001.md`.
