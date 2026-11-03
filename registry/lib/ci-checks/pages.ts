/**
 * GitHub paginates check runs at 100 per page and points at the next page
 * with a Link header. Parsing that header is pure. Walking the pages takes
 * an injected fetch so this file still does not open a socket itself.
 * https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api
 */

import { normalizeCheckRunsPayload } from "./normalize"
import type { CiError, NormalizedCheck } from "./types"

export function nextLink(header: string | null | undefined): string | null {
  if (!header) return null
  for (const part of header.split(",")) {
    const url = part.match(/<([^>]+)>/)
    const rel = part.match(/rel="?([^";]+)"?/i)
    if (url?.[1] && rel?.[1]?.toLowerCase() === "next") return url[1]
  }
  return null
}

export type CheckRunPage = {
  status: number
  body: string
  link: string | null
  error: CiError | null
}

export async function collectCheckRuns(input: {
  firstUrl: string
  fetchPage: (url: string) => Promise<CheckRunPage>
  maxPages?: number
}): Promise<{ checks: NormalizedCheck[]; pages: number; error: CiError | null }> {
  const maxPages = input.maxPages ?? 20
  const checks: NormalizedCheck[] = []
  let url: string | null = input.firstUrl
  let pages = 0
  while (url && pages < maxPages) {
    const page = await input.fetchPage(url)
    pages += 1
    if (page.error) return { checks, pages, error: page.error }
    checks.push(...normalizeCheckRunsPayload(parse(page.body)))
    url = nextLink(page.link)
  }
  return { checks, pages, error: null }
}

function parse(body: string): unknown {
  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}
