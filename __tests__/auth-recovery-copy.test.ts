import { describe, expect, it } from "vitest"

import { authRecoveryCopy, recoveryCopyLeaksAccount, recoverySentBody } from "@/registry/blocks/auth-recovery-copy"

const leak = /no account|not found|does not exist|doesn't exist|no existe|sin cuenta|no encontramos|unknown user|user not found|correo no registrado|email not registered/i

describe("auth recovery copy", () => {
  it("uses one sent sentence per locale, with no existence argument", () => {
    expect(recoverySentBody).toHaveLength(1)
    expect(recoverySentBody("en")).toBe(recoverySentBody("en"))
    expect(recoverySentBody("es-MX")).toBe(recoverySentBody("es-MX"))
    expect(recoverySentBody("en")).not.toBe(recoverySentBody("es-MX"))
    expect(recoveryCopyLeaksAccount(recoverySentBody("en"))).toBe(false)
    expect(recoveryCopyLeaksAccount(recoverySentBody("es-MX"))).toBe(false)
  })

  it("keeps every static string free of account enumeration", () => {
    const texts: string[] = []
    const walk = (value: unknown) => {
      if (typeof value === "string") texts.push(value)
      else if (value && typeof value === "object") Object.values(value).forEach(walk)
    }
    walk(authRecoveryCopy)
    expect(texts.length).toBeGreaterThan(20)
    for (const text of texts) expect(text).not.toMatch(leak)
  })
})
