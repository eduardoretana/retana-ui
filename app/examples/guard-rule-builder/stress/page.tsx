"use client"

import { StressCase } from "@/app/examples/stress-case"
import { GuardRuleBuilder } from "@/registry/ui/guard-rule-builder"
import type { GuardRule } from "@/registry/retana/lib/guard-rules"

import { filled, nested } from "../fixtures"

const token = "N".repeat(60)

const wide: GuardRule = {
  ...nested,
  name: token,
  kinds: [token, "git.merge", "whatsapp.before_send"],
  reasonKey: token,
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Constructor de reglas</h1>
      <StressCase label="Vacío, carga y error">
        <GuardRuleBuilder rule={null} locale="es" />
        <GuardRuleBuilder rule={null} locale="es" status="loading" />
        <GuardRuleBuilder rule={filled} locale="es" status="error" errorMessage={token} />
      </StressCase>
      <StressCase label="320px y título largo" width={320}>
        <GuardRuleBuilder rule={wide} locale="es" onChange={() => {}} />
      </StressCase>
      <StressCase label="Regla del preset y anidada">
        <GuardRuleBuilder rule={filled} locale="es" onChange={() => {}} />
        <GuardRuleBuilder rule={nested} locale="en" readOnly />
      </StressCase>
    </main>
  )
}
