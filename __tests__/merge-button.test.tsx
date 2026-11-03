import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MergeButton, mergeButtonLabelsEs } from "@/registry/ui/merge-button"

describe("MergeButton", () => {
  it("stays disabled until checks pass", () => {
    const onMerge = vi.fn()
    render(<MergeButton phase="disabled" onMerge={onMerge} labels={mergeButtonLabelsEs} />)
    const button = screen.getByRole("button", { name: "Fusionar" })
    expect(button).toBeDisabled()
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent(/esperando las comprobaciones/i)
    expect(button).toHaveAttribute("aria-describedby", status.id)
  })

  it("does not call onMerge before confirmation", async () => {
    const user = userEvent.setup()
    const onMerge = vi.fn()
    render(<MergeButton phase="ready" onMerge={onMerge} labels={mergeButtonLabelsEs} />)
    expect(screen.getByRole("status")).toHaveTextContent("Todas las comprobaciones pasaron")
    await user.click(screen.getByRole("button", { name: "Fusionar" }))
    expect(onMerge).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Confirmar fusión en main" }))
    expect(onMerge).toHaveBeenCalledTimes(1)
  })

  it("cancels confirmation with Escape and does not merge", async () => {
    const user = userEvent.setup()
    const onMerge = vi.fn()
    render(<MergeButton phase="ready" onMerge={onMerge} labels={mergeButtonLabelsEs} />)
    await user.click(screen.getByRole("button", { name: "Fusionar" }))
    await user.keyboard("{Escape}")
    expect(onMerge).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "Confirmar fusión en main" })).not.toBeInTheDocument()
  })

  it("shows merged into main", () => {
    render(<MergeButton phase="merged" labels={mergeButtonLabelsEs} />)
    expect(screen.getByRole("status")).toHaveTextContent("Fusionado en main")
  })

  it("shows the branch protection reason", () => {
    render(
      <MergeButton phase="rejected" reason="Se requieren revisiones" labels={mergeButtonLabelsEs} />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Se requieren revisiones")
  })

  it("announces the merging phase", () => {
    render(<MergeButton phase="merging" labels={mergeButtonLabelsEs} />)
    expect(screen.getByRole("status")).toHaveTextContent(/fusionando/i)
  })
})
