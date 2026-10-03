import type { Metadata } from "next"

import { ViewTimelineDemo } from "./demo"

export const metadata: Metadata = {
  title: "Timeline view",
  description: "Cronograma horizontal agrupado, con zoom y barras de inicio a fin.",
}

export default function ViewTimelinePage() {
  return <ViewTimelineDemo />
}
