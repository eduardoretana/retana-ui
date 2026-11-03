import type { Metadata } from "next"

import { GuardRulesDemo } from "./demo"

export const metadata: Metadata = {
  title: "Núcleo de guardas",
  description: "Motor puro. Evalúa WhatsApp sintético y un merge git.merge.",
}

export default function Page() {
  return <GuardRulesDemo />
}
