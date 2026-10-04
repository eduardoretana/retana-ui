"use client"

import { PassphraseGate } from "@/registry/ui/passphrase-gate"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <PassphraseGate mode="unlock" description="The studio shelf stays on this device." />
    </div>
  )
}
