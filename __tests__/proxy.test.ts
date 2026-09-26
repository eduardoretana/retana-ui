import { NextRequest } from "next/server"
import { afterEach, describe, expect, it } from "vitest"

import { proxy } from "../proxy"

const envKeys = ["NODE_ENV", "VERCEL_ENV", "REGISTRY_TOKEN", "REGISTRY_PUBLIC"] as const

const previous = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))

afterEach(() => {
  for (const key of envKeys) {
    if (previous[key] === undefined) delete process.env[key]
    else process.env[key] = previous[key]
  }
})

function setEnv(values: Partial<Record<(typeof envKeys)[number], string | undefined>>) {
  for (const key of envKeys) {
    if (!(key in values) || values[key] === undefined) delete process.env[key]
    else process.env[key] = values[key]
  }
}

function request(authorization?: string) {
  const headers = new Headers()
  if (authorization) headers.set("authorization", authorization)
  return new NextRequest("http://localhost/r/layered-panel.json", { headers })
}

describe("registry proxy", () => {
  it("returns 401 in production when no token and no opt-in", async () => {
    setEnv({ NODE_ENV: "production" })
    expect((await proxy(request())).status).toBe(401)

    setEnv({ NODE_ENV: "development", VERCEL_ENV: "production" })
    expect((await proxy(request())).status).toBe(401)
  })

  it("returns 200 in production when REGISTRY_PUBLIC=true", async () => {
    setEnv({ NODE_ENV: "production", REGISTRY_PUBLIC: "true" })
    expect((await proxy(request())).status).toBe(200)
  })

  it("returns 200 for the correct bearer token", async () => {
    setEnv({ NODE_ENV: "production", REGISTRY_TOKEN: "secret-token" })
    expect((await proxy(request("Bearer secret-token"))).status).toBe(200)
  })

  it("returns 401 for the wrong bearer token", async () => {
    setEnv({ NODE_ENV: "production", REGISTRY_TOKEN: "secret-token" })
    expect((await proxy(request("Bearer other-token"))).status).toBe(401)
    expect((await proxy(request())).status).toBe(401)
  })

  it("returns 200 in development when no token is set", async () => {
    setEnv({ NODE_ENV: "development" })
    expect((await proxy(request())).status).toBe(200)
  })
})
