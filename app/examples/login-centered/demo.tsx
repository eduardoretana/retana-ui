"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { LoginCentered } from "@/registry/blocks/login-centered"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <LoginCentered brand={{ name: atelier.name }} demoEmail={atelier.email} />
      <StressCases
        empty={<LoginCentered brand={{ name: " " }} demoEmail="" delays={{ passkey: 0, email: 0, code: 0, provider: 0, verified: 0 }} />}
        long={<LoginCentered brand={{ name: unbreakable }} demoEmail={atelier.email} />}
      />
    </div>
  )
}
