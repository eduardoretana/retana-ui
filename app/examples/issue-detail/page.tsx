import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { IssueDetailDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Detalle de hallazgo",
  description: "Huecos para el previo, la explicación y el pie.",
}

export default function Page() {
  return (
    <ExampleFrame title="Detalle de hallazgo" description="Huecos para el previo, la explicación y el pie.">
      <Demo />
    </ExampleFrame>
  )
}
