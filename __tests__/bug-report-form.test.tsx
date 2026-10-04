import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BugReportForm } from "@/registry/ui/bug-report-form"

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: "Title" }), "Save covers the label")
  await user.type(screen.getByRole("textbox", { name: "Description" }), "The save button sits on top of the last field.")
  await user.click(screen.getByRole("radio", { name: "UI issue" }))
}

describe("BugReportForm", () => {
  it("moves bug type selection with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<BugReportForm />)
    const ui = screen.getByRole("radio", { name: "UI issue" })
    ui.focus()
    await user.keyboard("{ArrowRight}")
    const functionality = screen.getByRole("radio", { name: "Functionality" })
    expect(functionality).toHaveFocus()
    expect(functionality).toHaveAttribute("aria-checked", "true")
    expect(ui).toHaveAttribute("aria-checked", "false")
    await user.keyboard("{ArrowLeft}")
    expect(ui).toHaveAttribute("aria-checked", "true")
  })

  it("shows inline errors until title, description, and type are set", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BugReportForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: "Submit bug" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("radiogroup", { name: "Bug type" })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Add a short title.")).toBeInTheDocument()
    expect(screen.getByText("Describe what happened.")).toBeInTheDocument()
    expect(screen.getByText("Choose a bug type.")).toBeInTheDocument()
  })

  it("rejects a file with the wrong type or a file over the size limit", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { container } = render(<BugReportForm />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const text = new File(["notes"], "notes.txt", { type: "text/plain" })
    await user.upload(input, text)
    expect(screen.getByRole("alert")).toHaveTextContent("That file type is not allowed.")
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument()

    const huge = new File([new Uint8Array(6 * 1024 * 1024)], "shot.png", { type: "image/png" })
    await user.upload(input, huge)
    expect(screen.getByRole("alert")).toHaveTextContent("File must be 5 MB or smaller.")
    expect(screen.queryByText("shot.png")).not.toBeInTheDocument()
  })

  it("shows an attached image and removes it", async () => {
    const user = userEvent.setup()
    const { container } = render(<BugReportForm />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const image = new File(["image"], "shot.png", { type: "image/png" })
    await user.upload(input, image)
    expect(screen.getByText("shot.png")).toBeInTheDocument()
    expect(container.querySelector("[data-slot='bug-report-dropzone']")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove shot.png" }))
    expect(screen.queryByText("shot.png")).not.toBeInTheDocument()
    expect(container.querySelector("[data-slot='bug-report-dropzone']")).toBeInTheDocument()
  })

  it("goes from loading to success", async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )
    render(<BugReportForm onSubmit={onSubmit} />)
    await fillRequired(user)
    await user.click(screen.getByRole("button", { name: "Submit bug" }))
    const pending = screen.getByRole("button", { name: "Sending…" })
    expect(pending).toHaveAttribute("aria-busy", "true")
    expect(pending).toBeDisabled()
    expect(screen.getByRole("status")).toHaveTextContent("Sending…")
    release()
    await waitFor(() => expect(screen.getByRole("button", { name: "Sent!" })).toBeInTheDocument())
    expect(screen.getByRole("status")).toHaveTextContent("Sent!")
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Save covers the label",
        type: "ui",
        priority: "medium",
        files: [],
      }),
    )
  })

  it("shows an error when submit is rejected", async () => {
    const user = userEvent.setup()
    render(
      <BugReportForm
        onSubmit={() => {
          throw new Error("offline")
        }}
      />,
    )
    await fillRequired(user)
    await user.click(screen.getByRole("button", { name: "Submit bug" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't send the report. Try again.")
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
  })
})
