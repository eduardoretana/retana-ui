"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MessageCardFile } from "@/registry/ui/message-card-file"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta de archivo</h1>
      <StressCase label="Vacío"><MessageCardFile state="empty" emptyLabel="Sin archivo" /></StressCase>
      <StressCase label="320px" width={320}><MessageCardFile name={token} detail={token} status={token} onDownload={() => {}} /></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><MessageCardFile name={token} detail={token} status={token} onDownload={() => {}} /></div></StressCase>
    </main>
  )
}
