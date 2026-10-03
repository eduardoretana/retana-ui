"use client"

import { promotionFields, promotionViews, promotions } from "@/app/examples/multi-view/data"
import { ViewGallery } from "@/registry/ui/view-gallery"

export default function ViewGalleryPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewGallery records={promotions} fields={promotionFields} config={promotionViews[1]!} locale="en-US" />
    </div>
  )
}
