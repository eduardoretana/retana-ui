import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { assertKnowledgeBaseContract } from "@/contracts/knowledge-base.contract"
import { canRetry, connectedCount, indexingCount, totalChunks, type KnowledgeSource } from "@/registry/lib/knowledge-base"

const sources: KnowledgeSource[] = [
  { id: "a", typeId: "docs", name: "Manual", detail: "Diario", status: "connected", chunks: 1200 },
  { id: "b", typeId: "repo", name: "Plantillas", detail: "Cada hora", status: "syncing", chunks: 40, progress: 50 },
  { id: "c", typeId: "help", name: "Ayuda", detail: "Al publicar", status: "error", chunks: 0, error: "Se cortó" },
  { id: "d", typeId: "notes", name: "Notas", detail: "Semanal", status: "stale", chunks: 80 },
]

describe("knowledge base totals", () => {
  it("holds the family contract", () => {
    expect(() => assertKnowledgeBaseContract()).not.toThrow()
  })

  it("sums chunks and counts connected and in-flight sources", () => {
    expect(totalChunks(sources)).toBe(1320)
    expect(connectedCount(sources)).toBe(2)
    expect(indexingCount(sources)).toBe(1)
    expect(totalChunks([])).toBe(0)
  })

  it("allows retry from disconnected, error, and stale only", () => {
    expect(canRetry("error")).toBe(true)
    expect(canRetry("stale")).toBe(true)
    expect(canRetry("disconnected")).toBe(true)
    expect(canRetry("syncing")).toBe(false)
    expect(canRetry("connecting")).toBe(false)
    expect(canRetry("connected")).toBe(false)
  })

  it("does not import supabase or call fetch from the pure core", () => {
    const source = readFileSync("registry/lib/knowledge-base.ts", "utf8")
    expect(source).not.toMatch(/@supabase/)
    expect(source).not.toMatch(/\bfetch\s*\(/)
  })
})
