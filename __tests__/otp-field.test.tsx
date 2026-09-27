import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { OtpField } from "@/registry/ui/otp-field"

describe("OtpField", () => {
  it("shows an error and starts the resend countdown", async () => {
    const user = userEvent.setup()
    const onResend = vi.fn()
    render(
      <OtpField
        state="error"
        label="Verification code"
        errorLabel="That code is not valid"
        resendLabel="Resend code"
        resendWaitLabel="Resend in"
        cooldownSeconds={30}
        onResend={onResend}
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("That code is not valid")
    await user.click(screen.getByRole("button", { name: "Resend code" }))
    expect(onResend).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: /Resend in 0:30/ })).toBeDisabled()
  })
})
