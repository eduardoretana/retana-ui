import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MagneticDropzone } from "@/registry/ui/magnetic-dropzone"

describe("MagneticDropzone", () => {
  it("rejects a file that is too large", () => {
    render(<MagneticDropzone maxSize={10} tooLargeLabel="File is too large" label="Drop files here" />)
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = new File(["0123456789abc"], "anexo.pdf", { type: "application/pdf" })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText("File is too large")).toBeInTheDocument()
  })

  it("reports upload progress and a failure", async () => {
    render(
      <MagneticDropzone
        label="Drop files here"
        onUpload={async (_file, { onProgress }) => {
          onProgress(40)
          throw new Error("Kiln offline")
        }}
      />,
    )
    const input = document.querySelector("input[type=file]") as HTMLInputElement
    const file = new File(["clay"], "bowl.stl", { type: "model/stl" })
    fireEvent.change(input, { target: { files: [file] } })
    expect(await screen.findByText("Kiln offline")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Retry bowl.stl" })).toBeInTheDocument()
  })
})
