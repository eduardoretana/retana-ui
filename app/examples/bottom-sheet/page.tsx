import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Hoja inferior",
  description: "Asoma a media altura y se abre del todo al arrastrar o con las flechas.",
}

export default function BottomSheetPage() {
  return (
    <ExampleFrame title="Hoja inferior" description="Asoma a media altura. El asa, la rueda o las flechas la llevan a altura completa.">
      <Demo />
    </ExampleFrame>
  )
}
