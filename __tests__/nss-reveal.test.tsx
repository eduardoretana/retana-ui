import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PartyPanel } from "@/registry/ui/party-panel"

describe("NSS reveal", () => {
  it("keeps the NSS masked until reveal and audits that id", async () => {
    const user = userEvent.setup()
    const onReveal = vi.fn()
    render(
      <PartyPanel
        name="Casa Lerma"
        secrets={[
          { id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" },
          { id: "nss", label: "NSS", masked: "•••••••••••", revealed: "00000000000" },
        ]}
        revealLabel="Mostrar"
        onReveal={onReveal}
      />,
    )

    expect(screen.getByText("•••••••••••")).toBeInTheDocument()
    expect(screen.queryByText("00000000000")).not.toBeInTheDocument()
    const row = screen.getByText("NSS").parentElement?.parentElement
    expect(row).toBeTruthy()
    await user.click(screen.getAllByRole("button", { name: "Mostrar" })[1]!)
    expect(screen.getByText("00000000000")).toBeInTheDocument()
    expect(screen.queryByText("•••••••••••")).not.toBeInTheDocument()
    expect(onReveal).toHaveBeenCalledTimes(1)
    expect(onReveal).toHaveBeenCalledWith("nss")
    expect(screen.queryByText("DEMO000000HDFXXX00")).not.toBeInTheDocument()
  })
})
