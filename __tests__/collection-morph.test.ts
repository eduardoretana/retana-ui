import { describe, expect, it } from "vitest"

import {
  COLLECTION_MORPH_MAX_S,
  COLLECTION_MORPH_MIN_S,
  COLLECTION_TIMELINE_SIDEBAR,
  collectionBar,
  collectionBarMotion,
  collectionDomain,
  collectionMorphMode,
  collectionMorphSpring,
  collectionQueryMatch,
  collectionSharedMotion,
  parseCollectionDay,
} from "@/registry/lib/collection-morph"

describe("collection morph contract", () => {
  it("uses a critically damped spring inside 0.6–0.8s", () => {
    expect(collectionMorphSpring.bounce).toBe(0)
    expect(collectionMorphSpring.type).toBe("spring")
    expect(collectionMorphSpring.visualDuration).toBeGreaterThanOrEqual(COLLECTION_MORPH_MIN_S)
    expect(collectionMorphSpring.visualDuration).toBeLessThanOrEqual(COLLECTION_MORPH_MAX_S)
  })

  it("drops layoutId when motion is reduced", () => {
    expect(collectionMorphMode(true)).toBe("crossfade")
    expect(collectionMorphMode(false)).toBe("morph")
    const full = collectionSharedMotion(false, "scope", "title", "jar")
    const quiet = collectionSharedMotion(true, "scope", "title", "jar")
    expect(full.layoutId).toBe("scope:title:jar")
    expect(full.transition).toBe(collectionMorphSpring)
    expect(quiet).not.toHaveProperty("layoutId")
    expect(quiet.transition).toEqual({ duration: 0 })
  })

  it("grows timeline bars on scaleX only", () => {
    const full = collectionBarMotion(false)
    const quiet = collectionBarMotion(true)
    expect(full.animate).toMatchObject({ opacity: 1, scaleX: 1 })
    expect(full.transition).toMatchObject({ scaleX: collectionMorphSpring })
    expect(quiet.animate).not.toHaveProperty("scaleX")
    expect(COLLECTION_TIMELINE_SIDEBAR).toBeCloseTo(0.3)
  })

  it("places an inclusive bar inside the domain", () => {
    const start = parseCollectionDay("2026-10-20")
    const end = parseCollectionDay("2026-10-22")
    expect(start).not.toBeNull()
    expect(parseCollectionDay("2026-02-31")).toBeNull()
    const domain = { start: start!, end: start! + 10 * 86_400_000 }
    const bar = collectionBar(start!, end!, domain)
    expect(bar?.origin).toBe(0)
    expect(bar?.scale).toBeCloseTo(3 / 10)
    expect(collectionDomain([], start!).start).toBeLessThan(start!)
  })

  it("matches title and detail without caring about case", () => {
    const item = { title: "Jarrón cobalto", detail: "Casa León" }
    expect(collectionQueryMatch(item, "  jarrón ")).toBe(true)
    expect(collectionQueryMatch(item, "león")).toBe(true)
    expect(collectionQueryMatch(item, "zzzz")).toBe(false)
    expect(collectionQueryMatch(item, "   ")).toBe(true)
  })
})
