"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { SignupForm } from "@/registry/blocks/signup-form"

export default function SignupFormPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SignupForm defaultValues={{ name: "Inés Calderón", email: atelier.email }} className="w-full" />
    </div>
  )
}
