"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { promotionFields, promotionViews, promotions } from "@/app/examples/multi-view/data"
import { ViewGallery } from "@/registry/ui/view-gallery"

export function ViewGalleryDemo() {
  return (
    <ExampleFrame wide title="Gallery view" description="Tarjetas con portada generada en la página y filtros rápidos.">
      <ViewGallery records={promotions} fields={promotionFields} config={promotionViews[1]!} locale="en-US" />
    </ExampleFrame>
  )
}
