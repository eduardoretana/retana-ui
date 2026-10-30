import { describe, expect, it } from "vitest"

import { GET } from "@/app/api/health/route"
import { captureLocale, captureReduced, captureTheme } from "@/app/catalog/capture-query"

describe("capture query", () => {
  it("maps es-MX and EN from the query", () => {
    expect(captureLocale("es-MX")).toBe("es")
    expect(captureLocale("en")).toBe("en")
    expect(captureLocale("en-US")).toBe("en")
    expect(captureLocale(null)).toBe("es")
  })

  it("accepts only light and dark", () => {
    expect(captureTheme("light")).toBe("light")
    expect(captureTheme("dark")).toBe("dark")
    expect(captureTheme("system")).toBeNull()
  })

  it("treats motion=reduce as reduced", () => {
    expect(captureReduced("reduce")).toBe(true)
    expect(captureReduced("full")).toBe(false)
    expect(captureReduced(null)).toBe(false)
  })
})

describe("health", () => {
  it("returns 200 and does not redirect", async () => {
    const response = GET()
    expect(response.status).toBe(200)
    expect(response.headers.get("location")).toBeNull()
    expect(await response.json()).toEqual({ ok: true })
  })
})
