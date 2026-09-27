import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { useOptimisticList } from "@/registry/hooks/use-optimistic-list"
import { useUnsavedChanges } from "@/registry/hooks/use-unsaved-changes"

const rows = [{ id: "a" }, { id: "b" }, { id: "c" }]

function ListHarness({
  onReorder,
  notify,
}: {
  onReorder: (ids: readonly string[]) => Promise<void> | void
  notify: { success: (message: string) => void; error: (message: string) => void }
}) {
  const list = useOptimisticList({ items: rows, onReorder, notify })
  return (
    <>
      <output>{list.order.join(",")}</output>
      <button type="button" onClick={() => void list.commit(["c", "a", "b"])}>
        Reordenar
      </button>
      <button type="button" onClick={() => list.moveVisible(["a", "c"], "c", "a")}>
        Mover visible
      </button>
    </>
  )
}

describe("useOptimisticList", () => {
  it("commits the next order and toasts success", async () => {
    const user = userEvent.setup()
    const notify = { success: vi.fn(), error: vi.fn() }
    const onReorder = vi.fn(async () => undefined)
    render(<ListHarness onReorder={onReorder} notify={notify} />)

    await user.click(screen.getByRole("button", { name: "Reordenar" }))

    expect(screen.getByRole("status").textContent ?? screen.getByText("c,a,b")).toBeTruthy()
    expect(onReorder).toHaveBeenCalledWith(["c", "a", "b"])
    expect(notify.success).toHaveBeenCalled()
    expect(screen.getByText("c,a,b")).toBeInTheDocument()
  })

  it("rolls the order back when the save rejects", async () => {
    const user = userEvent.setup()
    const notify = { success: vi.fn(), error: vi.fn() }
    render(
      <ListHarness
        onReorder={async () => {
          throw new Error("sin red")
        }}
        notify={notify}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Reordenar" }))

    expect(screen.getByText("a,b,c")).toBeInTheDocument()
    expect(notify.error).toHaveBeenCalledWith("sin red")
  })

  it("swaps only the visible ids", async () => {
    const user = userEvent.setup()
    const notify = { success: vi.fn(), error: vi.fn() }
    render(<ListHarness onReorder={async () => undefined} notify={notify} />)

    await user.click(screen.getByRole("button", { name: "Mover visible" }))

    expect(screen.getByText("c,b,a")).toBeInTheDocument()
  })
})

function DirtyHarness({ dirty }: { dirty: boolean }) {
  useUnsavedChanges(dirty, "cambios sin guardar")
  return null
}

describe("useUnsavedChanges", () => {
  it("blocks unload only while the form is dirty", () => {
    const { rerender } = render(<DirtyHarness dirty />)
    const leaving = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(leaving)
    expect(leaving.defaultPrevented).toBe(true)

    rerender(<DirtyHarness dirty={false} />)
    const next = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(next)
    expect(next.defaultPrevented).toBe(false)
  })
})
