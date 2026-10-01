import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NewsletterSignup } from "@/registry/blocks/newsletter-signup"

describe("NewsletterSignup", () => {
  it("subscribes a valid email", async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn().mockResolvedValue(undefined)
    render(<NewsletterSignup publication={null} readers={null} onSubscribe={onSubscribe} />)
    await user.type(screen.getByLabelText("Email address"), "hola@costa-atelier.example")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(onSubscribe).toHaveBeenCalledWith("hola@costa-atelier.example")
    expect(await screen.findByRole("button", { name: "Subscribed" })).toBeInTheDocument()
  })
})
