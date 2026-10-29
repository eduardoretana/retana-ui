"use client"

import { FileDiff } from "@/registry/ui/file-diff"

const patch = `diff --git a/anexo.md b/anexo.md
--- a/anexo.md
+++ b/anexo.md
@@ -1,8 +1,8 @@
 # Anexo B
 contexto uno
 contexto dos
 contexto tres
 contexto cuatro
 contexto cinco
 contexto seis
-El plazo es de 30 días.
+El plazo es de 45 días.
 La ciudad sigue siendo Norte.`

export function Demo() {
  return (
    <FileDiff
      patch={patch}
      filename="anexo.md"
      additionsLabel="agregadas"
      deletionsLabel="eliminadas"
      expandLabel="Mostrar líneas sin cambios"
      collapseLabel="Ocultar líneas sin cambios"
    />
  )
}
