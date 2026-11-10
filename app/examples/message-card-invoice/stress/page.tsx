"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MessageCardInvoice } from "@/registry/ui/message-card-invoice"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de monto</h1>
      <StressCase label="Vacío"><MessageCardInvoice state="empty" emptyLabel="Sin monto" /></StressCase>
      <StressCase label="320px" width={320}><MessageCardInvoice title={token} amount="$1" due={token} /></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><MessageCardInvoice title={token} amount="$1" due={token} /></div></StressCase>
    </main>
  )
}
