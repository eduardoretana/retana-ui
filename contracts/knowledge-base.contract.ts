/**
 * Family contract for the knowledge base.
 * Ports stay on the host. This file does not fetch.
 */

import { canRetry, totalChunks, type KnowledgePort, type KnowledgeSource } from "@/registry/lib/knowledge-base"

export type KnowledgeBaseFamily = {
  source: KnowledgeSource
  connect: KnowledgePort
}

export function assertKnowledgeBaseContract() {
  const sources: KnowledgeSource[] = [
    { id: "a", typeId: "docs", name: "Manual", detail: "Diario", status: "connected", chunks: 10 },
    { id: "b", typeId: "help", name: "Ayuda", detail: "Publicado", status: "error", chunks: 0, error: "corte" },
  ]
  if (totalChunks(sources) !== 10) throw new Error("chunks")
  if (!canRetry("error") || !canRetry("stale") || canRetry("syncing")) throw new Error("retry")
  const port: KnowledgePort = async (_id, ctx) => {
    if (ctx.signal.aborted) return
    ctx.report({ progress: 50, chunks: 4 })
  }
  void port
}
