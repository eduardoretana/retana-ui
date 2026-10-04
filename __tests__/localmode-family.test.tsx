import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CharLimit } from "@/registry/ui/char-limit"
import { MessageBranch } from "@/registry/ui/message-branch"
import { extractErrorMessage, MessageError } from "@/registry/ui/message-error"
import { NetworkStatus } from "@/registry/ui/network-status"
import { PushToTalk } from "@/registry/ui/push-to-talk"
import { segmentText } from "@/registry/ui/entity-text"
import { layoutGraph } from "@/registry/ui/force-graph"
import { SlashMenu, useSlashTrigger } from "@/registry/ui/slash-menu"
import { ToolApproval } from "@/registry/ui/tool-approval"
import { useRef, useState } from "react"

describe("ToolApproval", () => {
  it("approves and moves focus to the receipt", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<ToolApproval toolName="archive_shelf" onApprove={onApprove} onDeny={vi.fn()} />)
    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(onApprove).toHaveBeenCalledOnce()
    const receipt = screen.getByText("Approved")
    expect(receipt.closest("p")).toHaveFocus()
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument()
  })

  it("denies and announces the decision", async () => {
    const user = userEvent.setup()
    const onDeny = vi.fn()
    render(<ToolApproval toolName="archive_shelf" onApprove={vi.fn()} onDeny={onDeny} />)
    await user.click(screen.getByRole("button", { name: "Deny" }))
    expect(onDeny).toHaveBeenCalledOnce()
    expect(screen.getByText("Denied")).toBeInTheDocument()
    expect(screen.getByText(/archive_shelf denied/i)).toBeInTheDocument()
  })
})

function SlashHarness() {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("")
  const [picked, setPicked] = useState("")
  const slash = useSlashTrigger(ref)
  return (
    <div>
      <textarea id="composer" aria-label="Composer" ref={ref} value={value} onChange={(event) => setValue(event.target.value)} />
      <SlashMenu
        inputId="composer"
        commands={[
          { id: "sum", name: "summarize", description: "Condense the note", category: "Write" },
          { id: "shelf", name: "shelf", description: "Label", category: "Studio" },
        ]}
        open={slash.open}
        query={slash.query}
        onSelect={(command) => {
          setPicked(command.name)
          slash.replaceTrigger(`/${command.name} `)
          setValue((current) => current.replace(/\/\S*$/, `/${command.name} `))
        }}
        onDismiss={slash.close}
      />
      <p>{picked}</p>
    </div>
  )
}

describe("SlashMenu", () => {
  it("opens from a slash and selects with the keyboard", async () => {
    const user = userEvent.setup()
    render(<SlashHarness />)
    const composer = screen.getByRole("combobox", { name: "Composer" })
    await user.type(composer, "/sh")
    expect(composer).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("option", { name: /shelf/i })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /summarize/i })).not.toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(screen.getByText("shelf")).toBeInTheDocument()
  })

  it("closes on Escape and keeps the typed text", async () => {
    const user = userEvent.setup()
    render(<SlashHarness />)
    const composer = screen.getByRole("combobox", { name: "Composer" })
    await user.type(composer, "/sum")
    await user.keyboard("{Escape}")
    expect(composer).toHaveAttribute("aria-expanded", "false")
    expect(composer).toHaveValue("/sum")
  })
})

describe("CharLimit", () => {
  it("stays hidden until the show threshold, then warns and counts over", () => {
    const { rerender } = render(<CharLimit value={"a".repeat(50)} max={100} />)
    expect(screen.queryByText("50/100")).not.toBeInTheDocument()
    rerender(<CharLimit value={"a".repeat(70)} max={100} />)
    expect(screen.getByText("70/100")).toBeInTheDocument()
    rerender(<CharLimit value={"a".repeat(90)} max={100} />)
    expect(screen.getByText("90/100")).toHaveClass("text-accent-foreground")
    rerender(<CharLimit value={"a".repeat(112)} max={100} />)
    expect(screen.getByText("-12")).toHaveClass("text-destructive")
    expect(screen.getByText(/characters over the limit/i)).toBeInTheDocument()
  })
})

describe("PushToTalk", () => {
  it("starts on press and stops on release", () => {
    const onStart = vi.fn()
    const onStop = vi.fn()
    render(<PushToTalk onStart={onStart} onStop={onStop} />)
    const button = screen.getByRole("button", { name: "Hold to talk" })
    fireEvent.pointerDown(button)
    expect(onStart).toHaveBeenCalledOnce()
    expect(button).toHaveAttribute("aria-pressed", "true")
    fireEvent.pointerUp(button)
    expect(onStop).toHaveBeenCalledOnce()
    expect(screen.getByText("Transcribing…")).toBeInTheDocument()
  })

  it("toggles with click when mode is toggle", async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    const onStop = vi.fn()
    render(<PushToTalk mode="toggle" onStart={onStart} onStop={onStop} />)
    const button = screen.getByRole("button", { name: "Hold to talk" })
    await user.click(button)
    expect(onStart).toHaveBeenCalledOnce()
    await user.click(screen.getByRole("button", { pressed: true }))
    expect(onStop).toHaveBeenCalledOnce()
  })
})

describe("NetworkStatus", () => {
  it("announces online and offline events", () => {
    let online = true
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => online })
    render(<NetworkStatus />)
    expect(screen.getByRole("status")).toHaveTextContent("Online")
    online = false
    act(() => {
      window.dispatchEvent(new Event("offline"))
    })
    expect(screen.getByRole("status")).toHaveTextContent("Offline")
    online = true
    act(() => {
      window.dispatchEvent(new Event("online"))
    })
    expect(screen.getByRole("status")).toHaveTextContent("Online")
  })
})

describe("ported helpers", () => {
  it("extracts an error message", () => {
    expect(extractErrorMessage(new Error("kiln"))).toBe("kiln")
    expect(extractErrorMessage({ message: "shelf" })).toBe("shelf")
    expect(extractErrorMessage(null)).toBe("Something went wrong.")
  })

  it("keeps the longest overlapping entity", () => {
    const segments = segmentText("abcdef", [
      { start: 0, end: 3, type: "short" },
      { start: 0, end: 5, type: "long" },
    ])
    expect(segments.filter((segment) => segment.kind === "entity")).toEqual([
      { kind: "entity", value: "abcde", entity: { start: 0, end: 5, type: "long" } },
    ])
  })

  it("settles a force layout inside the frame", () => {
    const laid = layoutGraph(
      [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      [{ source: "a", target: "b" }],
      200,
      120,
      20,
    )
    expect(laid).toHaveLength(2)
    for (const node of laid) {
      expect(node.x).toBeGreaterThanOrEqual(node.r)
      expect(node.x).toBeLessThanOrEqual(200 - node.r)
    }
  })

  it("pages message variants and hides a single one", async () => {
    const user = userEvent.setup()
    render(
      <MessageBranch count={2}>
        <p>One</p>
        <p>Two</p>
      </MessageBranch>,
    )
    expect(screen.getByText("One")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next version" }))
    expect(screen.getByText("Two")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next version" })).toBeDisabled()
  })

  it("shows a message error as an alert with retry", () => {
    const onRetry = vi.fn()
    render(<MessageError error="The note failed." onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("The note failed.")
    screen.getByRole("button", { name: "Retry" }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
