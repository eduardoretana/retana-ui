import { describe, expect, it } from "vitest"

import { assertAgentConfigContract } from "@/contracts/agent-config.contract"

describe("agent-config family contract", () => {
  it("keeps version, guardrail, pricing, and band shapes", () => {
    expect(() => assertAgentConfigContract()).not.toThrow()
  })
})
