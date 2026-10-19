"use client"

import { StressCase } from "@/app/examples/stress-case"

import { SettingsBilling } from "@/registry/blocks/settings-billing"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ajustes y facturación</h1>
      <StressCase label="320px" width={320}>
        <SettingsBilling shell={false} />
      </StressCase>
      <StressCase label="Vacío">
        <SettingsBilling shell={false} plans={[]} invoices={[]} members={[]} usage={{ used: 0, reserved: 0, total: 0 }} workspaceName="" />
      </StressCase>
      <StressCase label="60 caracteres y diez facturas">
        <SettingsBilling
          shell={false}
          workspaceName={long}
          invoices={Array.from({ length: 10 }, (_, index) => ({
            id: `in-${index}`,
            number: `A-${index}`,
            date: "01 oct 2026",
            amount: "$1.00",
            status: "paid",
          }))}
        />
      </StressCase>
    </main>
  )
}
