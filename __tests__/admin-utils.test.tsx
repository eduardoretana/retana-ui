import { describe, expect, it } from "vitest"

import { slugify } from "@/registry/lib/admin-utils"

describe("admin-utils", () => {
  it("strips accents when it builds a slug", () => {
    expect(slugify("Diseño de producto")).toBe("diseno-de-producto")
    expect(slugify("")).toBe("")
  })
})
