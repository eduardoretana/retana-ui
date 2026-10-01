import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { formatPhoneNumber, parsePhoneNumber, PhoneInput } from "@/registry/ui/phone-input"

describe("PhoneInput", () => {
  it("formats national digits and reports E.164", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput label="Phone" defaultCountry="US" onValueChange={onValueChange} />)
    await user.type(screen.getByLabelText("Phone"), "2015550123")
    expect(screen.getByLabelText("Phone")).toHaveValue("(201) 555-0123")
    expect(onValueChange).toHaveBeenLastCalledWith("+12015550123", expect.objectContaining({ valid: true, status: "valid" }))
  })

  it("switches country from the picker and keeps a searchable list", async () => {
    const user = userEvent.setup()
    const onCountryChange = vi.fn()
    const onValueChange = vi.fn()
    render(<PhoneInput label="Phone" defaultCountry="US" onCountryChange={onCountryChange} onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: /Country, United States/ }))
    const search = screen.getByRole("combobox", { name: "Search countries or calling codes" })
    await user.type(search, "mex")
    await user.click(screen.getByRole("option", { name: /Mexico/ }))
    expect(onCountryChange).toHaveBeenCalledWith("MX")
    expect(screen.getByRole("button", { name: /Country, Mexico \+52/ })).toBeInTheDocument()
    await user.type(screen.getByLabelText("Phone"), "2221234567")
    expect(onValueChange).toHaveBeenLastCalledWith("+522221234567", expect.objectContaining({ valid: true }))
  })

  it("reads a pasted international number into the matching country", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput label="Phone" defaultCountry="US" onValueChange={onValueChange} />)
    const input = screen.getByLabelText("Phone")
    await user.click(input)
    await user.paste("+1 506 555 0123")
    expect(screen.getByRole("button", { name: /Country, Canada/ })).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith("+15065550123", expect.objectContaining({ valid: true }))
  })

  it("parses and formats E.164", () => {
    const parsed = parsePhoneNumber("+44 (0)7400 123456")
    expect(parsed?.country.iso).toBe("GB")
    expect(parsed?.national.endsWith("7400123456")).toBe(true)
    expect(formatPhoneNumber("+525551234567")).toContain("+52")
  })
})
