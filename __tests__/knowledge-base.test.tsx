import { readFileSync } from "node:fs"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import type { KnowledgePort, KnowledgeSource, KnowledgeSourceType } from "@/registry/lib/knowledge-base"
import { KnowledgeBase } from "@/registry/ui/knowledge-base"

const types: KnowledgeSourceType[] = [
  { id: "docs", label: "Documents", hint: "Daily", glyph: "docs" },
  { id: "notes", label: "Notes", hint: "Weekly", glyph: "notes" },
]

const initial: KnowledgeSource[] = [
  { id: "manual", typeId: "docs", name: "Sales manual", detail: "Daily", status: "disconnected", chunks: 0 },
]

function Harness({
  onConnect = async () => {},
  onSync = async (_id, ctx) => {
    ctx.report({ progress: 100, chunks: 12 })
  },
  onDisconnect = async () => {},
  onReset = async () => {},
  sources = initial,
}: {
  onConnect?: KnowledgePort
  onSync?: KnowledgePort
  onDisconnect?: () => Promise<void>
  onReset?: () => Promise<void>
  sources?: KnowledgeSource[]
}) {
  const [list, setList] = useState(sources)
  return (
    <KnowledgeBase
      title="Knowledge base"
      types={types}
      sources={list}
      onSourcesChange={setList}
      onConnect={onConnect}
      onSync={onSync}
      onDisconnect={async () => onDisconnect()}
      onReset={async () => onReset()}
      locale="es-MX"
    />
  )
}

describe("KnowledgeBase", () => {
  it("connects, reports progress, and toasts the chunk count", async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn<KnowledgePort>(async (_id, ctx) => {
      expect(ctx.signal).toBeInstanceOf(AbortSignal)
    })
    render(<Harness onConnect={onConnect} />)
    await user.click(screen.getByRole("button", { name: "Connect", exact: true }))
    expect(await screen.findByText("Sales manual connected. 12 chunks")).toBeInTheDocument()
    expect(onConnect).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Connected")).toBeInTheDocument()
  })

  it("marks an error when sync fails halfway and offers a retry", async () => {
    const user = userEvent.setup()
    const onSync = vi.fn<KnowledgePort>(async () => {
      throw new Error("cut off")
    })
    render(<Harness onSync={onSync} />)
    await user.click(screen.getByRole("button", { name: "Connect", exact: true }))
    expect((await screen.findAllByText("cut off")).length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })

  it("asks before reset and clears chunks", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn(async () => {})
    render(
      <Harness
        onReset={onReset}
        sources={[{ id: "manual", typeId: "docs", name: "Sales manual", detail: "Daily", status: "connected", chunks: 40 }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Reset" }))
    await user.click(screen.getByRole("button", { name: "Reset knowledge base" }))
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(await screen.findByText("The knowledge base was reset")).toBeInTheDocument()
    expect(screen.getByText("Disconnected")).toBeInTheDocument()
  })

  it("shows empty, loading, and error", () => {
    const { rerender } = render(<Harness sources={[]} />)
    expect(screen.getByText("No sources")).toBeInTheDocument()
    const ports = {
      types,
      sources: [] as KnowledgeSource[],
      onSourcesChange: () => {},
      onConnect: async () => {},
      onSync: async () => {},
      onDisconnect: async () => {},
      onReset: async () => {},
    }
    rerender(<KnowledgeBase title="Knowledge base" {...ports} status="loading" />)
    expect(screen.getByLabelText("Loading sources")).toBeInTheDocument()
    rerender(<KnowledgeBase title="Knowledge base" {...ports} status="error" error="The catalog timed out." />)
    expect(screen.getByText("The catalog timed out.")).toBeInTheDocument()
  })

  it("omits motion when reduced motion is on", () => {
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    render(
      <Harness
        sources={[{ id: "manual", typeId: "docs", name: "Sales manual", detail: "Daily", status: "connected", chunks: 4 }]}
      />,
    )
    expect(document.querySelector("[data-motion]")).toHaveAttribute("data-motion", "off")
  })

  it("does not fetch or import supabase", () => {
    const source = readFileSync("registry/ui/knowledge-base.tsx", "utf8")
    expect(source).not.toMatch(/@supabase/)
    expect(source).not.toMatch(/\bfetch\s*\(/)
  })
})
