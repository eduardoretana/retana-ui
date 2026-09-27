"use client"

import { FileDiff } from "@/registry/ui/file-diff"

const patch = `@@ -1,3 +1,3 @@
 plazo: 30
-firma: marzo
+firma: abril
 ciudad: Norte`

export default function FileDiffPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <FileDiff patch={patch} filename="anexo.yml" additionsLabel="altas" deletionsLabel="bajas" expandLabel="Ver sin cambios" />
    </div>
  )
}
