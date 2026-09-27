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
})
