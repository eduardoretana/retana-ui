import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { segmentsFrom, skipped, sourcesFrom } from "@/app/examples/cited-answer/fixtures"
import { blocksFrom, earlier, filled as mapFilled, MAP_LIMIT, open } from "@/app/examples/context-map/fixtures"
import { filled as windowFilled, full, partsFrom, tight, WINDOW_LIMIT } from "@/app/examples/context-window/fixtures"
import { filled as memoryFilled, forgotten, memoriesFrom, paused, undoFrom } from "@/app/examples/memory-panel/fixtures"
import { filled as libraryFilled, ready, templatesFrom } from "@/app/examples/prompt-library/fixtures"
import { CitedAnswer, visibleCites } from "@/registry/ui/cited-answer"
import { ContextMap, mapUsage } from "@/registry/ui/context-map"
import { ContextWindow, windowPressure, windowUsed } from "@/registry/ui/context-window"
import { MemoryPanel, memoryCount } from "@/registry/ui/memory-panel"
import { PromptLibrary, promptMissing, promptText } from "@/registry/ui/prompt-library"

describe("context map", () => {
  it("keeps free space and opens the quote", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onView = vi.fn()
    const after = blocksFrom(mapFilled.blocks, "en")
    const before = blocksFrom(earlier.before ?? [], "en")
    expect(mapUsage(after, MAP_LIMIT)).toMatchObject({ used: 17100, free: 6900, over: false })
    expect(mapUsage(before, MAP_LIMIT)).toMatchObject({ used: 22100, free: 1900, over: false })
    render(<ContextMap blocks={after} limit={MAP_LIMIT} compare view="after" onSelect={onSelect} onView={onView} selectedId={open.selectedId} />)
    expect(screen.getByText("Cobalt glaze, deposit of $18,400.00 MXN.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Before" }))
    expect(onView).toHaveBeenCalledWith("before")
    await user.click(screen.getByRole("button", { name: "Quote PED-1048, File, 4,200 tokens" }))
    expect(onSelect).toHaveBeenCalledWith("cotizacion")
  })
})

describe("context window", () => {
  it("warns when the window fills and removes a file", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const onCompact = vi.fn()
    const parts = partsFrom(windowFilled.parts, "en")
    expect(windowUsed(parts)).toBe(17000)
    expect(windowPressure(17000, WINDOW_LIMIT)).toBe("room")
    expect(windowPressure(windowUsed(partsFrom(tight.parts, "en")), WINDOW_LIMIT)).toBe("tight")
    expect(windowPressure(windowUsed(partsFrom(full.parts, "en")), WINDOW_LIMIT)).toBe("full")
    render(<ContextWindow parts={parts} limit={WINDOW_LIMIT} onRemove={onRemove} onCompact={onCompact} />)
    expect(screen.getByText("17,000 of 24,000 tokens, 71%")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Compact “Conversation”" }))
    expect(onCompact).toHaveBeenCalledWith("charla")
    await user.click(screen.getByRole("button", { name: "Open “Files”" }))
    await user.click(screen.getByRole("button", { name: "Remove “Quote PED-1048”" }))
    expect(onRemove).toHaveBeenCalledWith("archivos", "cotizacion")
  })
})

describe("memory panel", () => {
  it("counts memories and forgets the Celaya mail", async () => {
    const user = userEvent.setup()
    const onForget = vi.fn()
    const memories = memoriesFrom(memoryFilled, "en")
    expect(memoryCount(memories)).toMatchObject({ total: 4, paused: 0, active: 4 })
    expect(memoryCount(memoriesFrom(paused, "en")).paused).toBe(1)
    expect(undoFrom(forgotten, "es", "celaya")?.text).toContain("Celaya")
    expect(undoFrom(forgotten, "es", null)).toBeNull()
    render(<MemoryPanel memories={memories} enabled onForget={onForget} />)
    await user.click(screen.getByRole("button", { name: "Forget “Mail to Celaya for order PED-990 did not go out.”" }))
    expect(onForget).toHaveBeenCalledWith("celaya")
  })
})

describe("cited answer", () => {
  it("skips a missing source and opens the quote", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const sources = sourcesFrom(skipped.sources, "en")
    const segments = segmentsFrom(skipped.segments, "en")
    expect(visibleCites(segments[0]?.cite, sources)).toEqual(["cotizacion"])
    render(<CitedAnswer segments={segments} sources={sources} pagesRead={3} onOpen={onOpen} />)
    expect(screen.queryByRole("button", { name: /fantasma/ })).not.toBeInTheDocument()
    expect(screen.getByText(/before 14:00/).parentElement).toHaveTextContent("14:00. 1 Delivery")
    await user.click(screen.getAllByRole("button", { name: "Source 1: Quote PED-1048" })[0]!)
    expect(onOpen).toHaveBeenCalledWith("cotizacion")
  })
})

describe("prompt library", () => {
  it("keeps use closed until every blank is filled", async () => {
    const user = userEvent.setup()
    const onUse = vi.fn()
    const templates = templatesFrom(libraryFilled.templates, "en")
    const partial = libraryFilled.values.en.celaya ?? {}
    expect(promptMissing(templates[0]!, partial)).toEqual(["asunto", "tono"])
    const view = render(<PromptLibrary templates={templates} selectedId="celaya" values={partial} onUse={onUse} />)
    expect(screen.getByRole("button", { name: "Use “Note for Celaya”" })).toBeDisabled()
    expect(screen.getByText("2 blanks still open")).toBeInTheDocument()
    view.unmount()
    const done = templatesFrom(ready.templates, "en")
    const values = ready.values.en.celaya ?? {}
    const prompt = promptText(done[0]!.body, values)
    expect(prompt).toBe("Write to Celaya about order PED-990. Say that kiln 2 will not light. The tone is plain.")
    render(<PromptLibrary templates={done} selectedId="celaya" values={values} onUse={onUse} />)
    expect(screen.getByRole("textbox", { name: "asunto. What to say" })).toHaveAttribute("style", expect.stringContaining("width: 24ch"))
    await user.click(screen.getByRole("button", { name: "Use “Note for Celaya”" }))
    expect(onUse).toHaveBeenCalledWith(prompt, "celaya")
  })
})
