"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { SignupForm } from "@/registry/blocks/signup-form"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <SignupForm defaultValues={{ email: atelier.email, name: "Inés Calderón" }} />
      <StressCases
        empty={<SignupForm />}
        long={<SignupForm defaultValues={{ name: unbreakable, email: unbreakable }} />}
      />
    </div>
  )
}
