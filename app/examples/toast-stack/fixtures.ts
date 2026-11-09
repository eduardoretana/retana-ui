import type { SceneLocale } from "@/app/catalog/scene-types"
import { unbreakable } from "@/app/examples/arc/demo-data"
import type { ToastType } from "@/registry/ui/toast-stack"

export type ToastSeed = {
  title: string
  description?: string
  type: ToastType
}

export const filled = { title: "Horno listo", description: "Cono 6 en el horno 2.", type: "success" as const }

export const empty = { title: "" }

export const loading = { title: "Cocción", description: "El programa sigue en curso.", type: "loading" as const }

export const error = { title: "La cocción falló", description: "No se pudo guardar la bitácora.", type: "error" as const }

export const loadedStack: ToastSeed[] = [
  { title: "Pila uno", description: "El swipe de la pila sigue activo.", type: "success" },
  { title: "Pila dos", description: "Segundo aviso, detrás del de enfrente.", type: "info" },
  { title: "Pila tres", description: "Tercer aviso de la pila.", type: "warning" },
]

export const layoutToast = { title: "Toaster del layout", description: "Este Toaster no tiene swipe." }

export function copy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      filled: { title: "Kiln ready", description: "Cone 6 in kiln 2.", type: "success" as const },
      loading: { title: "Firing", description: "The schedule is still running.", type: "loading" as const },
      error: { title: "The firing failed", description: "The log could not be saved.", type: "error" as const },
      empty: "The stack is waiting for the first notice.",
      dismissed: "The notice left downward, the axis it entered on.",
      dragging: "The notice is under the finger.",
      keyboard: "Escape dismisses the focused notice.",
      extreme: { title: unbreakable, description: unbreakable, type: "info" as const },
    }
  }
  return {
    filled: { title: "Horno listo", description: "Cono 6 en el horno 2.", type: "success" as const },
    loading: { title: "Cocción", description: "El programa sigue en curso.", type: "loading" as const },
    error: { title: "La cocción falló", description: "No se pudo guardar la bitácora.", type: "error" as const },
    empty: "La pila espera el primer aviso.",
    dismissed: "El aviso se fue hacia abajo, el eje por el que entró.",
    dragging: "El aviso está bajo el dedo.",
    keyboard: "Escape descarta el aviso enfocado.",
    extreme: { title: unbreakable, description: unbreakable, type: "info" as const },
  }
}
