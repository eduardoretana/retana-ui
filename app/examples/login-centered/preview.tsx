"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { LoginCentered } from "@/registry/blocks/login-centered"

export default function LoginCenteredPreview() {
  return (
    <div className="bg-background">
      <LoginCentered brand={{ name: atelier.name }} demoEmail={atelier.email} />
    </div>
  )
}
