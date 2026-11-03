import { mergePullRequest, readPullChecks } from "@/registry/lib/ci-checks/http"

/**
 * Example server handler. The token is read here and nowhere in the client.
 * Merge stays off unless CI_CHECKS_MERGE_ENABLED=true.
 * Permissions, if you connect a real GitHub App or fine-grained PAT:
 * checks:read, statuses:read, pull_requests:read.
 * contents:write only when merge is enabled.
 */

type RouteContext = { params: Promise<{ owner: string; repo: string; pull: string }> }

function token() {
  return process.env.CI_CHECKS_GITHUB_TOKEN
}

function mergeEnabled() {
  return process.env.CI_CHECKS_MERGE_ENABLED === "true"
}

export async function GET(request: Request, context: RouteContext) {
  const { owner, repo, pull } = await context.params
  const result = await readPullChecks({
    token: token(),
    owner,
    repo,
    pull: Number(pull),
    checkRunsEtag: request.headers.get("if-none-match"),
    statusEtag: request.headers.get("x-ci-checks-status-etag"),
    pullEtag: request.headers.get("x-ci-checks-pull-etag"),
  })
  return Response.json(result.body, { status: result.status, headers: result.headers })
}

export async function POST(request: Request, context: RouteContext) {
  const { owner, repo, pull } = await context.params
  const body = (await request.json().catch(() => ({}))) as { confirmed?: boolean; grantedBy?: string; sha?: string }
  const result = await mergePullRequest({
    token: token(),
    mergeEnabled: mergeEnabled(),
    owner,
    repo,
    pull: Number(pull),
    sha: typeof body.sha === "string" ? body.sha : "",
    confirmed: body.confirmed === true,
    grantedBy: typeof body.grantedBy === "string" ? body.grantedBy : undefined,
  })
  return Response.json(result.body, { status: result.status, headers: result.headers })
}
