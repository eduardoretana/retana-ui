"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { SignIn } from "@/registry/blocks/sign-in"

const accounts = people.slice(0, 5).map((person) => ({
  name: person.name,
  email: `${person.id}@costa-atelier.example`,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <SignIn accounts={accounts} defaultEmail={atelier.email} />
      <StressCases empty={<SignIn accounts={accounts} />} long={<SignIn defaultEmail={unbreakable} />} />
    </div>
  )
}
