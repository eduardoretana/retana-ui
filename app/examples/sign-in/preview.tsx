"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { SignIn } from "@/registry/blocks/sign-in"

export default function SignInPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SignIn defaultEmail={atelier.email} className="w-full" />
    </div>
  )
}
