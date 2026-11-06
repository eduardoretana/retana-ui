import { render, type RenderResult } from "@testing-library/react"
import axe from "axe-core"
import { describe, expect, it } from "vitest"

import { ForgotPassword } from "@/registry/blocks/forgot-password"
import { ResetPassword } from "@/registry/blocks/reset-password"
import { VerifyEmail } from "@/registry/blocks/verify-email"

document.elementFromPoint = () => document.body

const quiet = async () => {}
const strong = "Horno-2026!mx"

async function expectClean(view: RenderResult) {
  const results = await axe.run(view.container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: {
      // jsdom does not resolve the host theme, so contrast is not measurable here.
      "color-contrast": { enabled: false },
    },
  })
  const details = results.violations.flatMap((item) =>
    item.nodes.map((node) => `${item.id}: ${node.target.join(" ")} :: ${node.html}`),
  )
  expect(details).toEqual([])
  view.unmount()
}

describe("auth recovery accessibility", () => {
  it("has no axe violations across the recovery scenes", async () => {
    await expectClean(render(<ForgotPassword locale="es-MX" onSubmit={quiet} signInHref="/sign-in" />))
    await expectClean(render(<ForgotPassword locale="en" phase="invalid" defaultEmail="hola@" onSubmit={quiet} />))
    await expectClean(render(<ForgotPassword locale="en" phase="submitting" defaultEmail="ada@costa-atelier.example" onSubmit={quiet} />))
    await expectClean(render(<ForgotPassword locale="es-MX" phase="sent" defaultEmail="ada@costa-atelier.example" onSubmit={quiet} />))
    await expectClean(render(<ForgotPassword locale="en" phase="error" defaultEmail="ada@costa-atelier.example" onSubmit={quiet} />))

    await expectClean(render(<ResetPassword locale="es-MX" onSubmit={quiet} />))
    await expectClean(render(<ResetPassword locale="en" phase="invalid" defaultPassword={strong} defaultConfirm={`${strong}?`} onSubmit={quiet} />))
    await expectClean(render(<ResetPassword locale="en" phase="error" defaultPassword={strong} defaultConfirm={strong} onSubmit={quiet} />))
    await expectClean(render(<ResetPassword locale="es-MX" phase="success" onSubmit={quiet} signInHref="/sign-in" />))
    await expectClean(render(<ResetPassword tokenState="invalid" requestHref="/forgot" onSubmit={quiet} />))
    await expectClean(render(<ResetPassword tokenState="expired" requestHref="/forgot" onSubmit={quiet} />))

    await expectClean(render(<VerifyEmail locale="es-MX" email="ada@costa-atelier.example" otp onResend={quiet} onVerifyCode={async () => false} skipHref="/later" />))
    await expectClean(render(<VerifyEmail locale="en" phase="cooldown" onResend={quiet} />))
    await expectClean(render(<VerifyEmail locale="en" phase="error" email="ada@costa-atelier.example" onResend={quiet} />))
    await expectClean(render(<VerifyEmail locale="es-MX" phase="success" onResend={quiet} />))
  })
})
