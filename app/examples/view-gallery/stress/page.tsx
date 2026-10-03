"use client"

import { promotionFields, promotionViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewGallery } from "@/registry/ui/view-gallery"

export default function ViewGalleryStressPage() {
  return (
    <StressShell title="Gallery view stress" kind="promotions">
      {(records) => (
        <ViewGallery records={records} fields={promotionFields} config={promotionViews[1]!} locale="en-US" />
      )}
    </StressShell>
  )
}
