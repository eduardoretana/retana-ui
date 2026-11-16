import type * as React from "react"
import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { toast, Toaster } from "sonner"
import { LayoutDashboard } from "lucide-react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminShell, type AdminNavGroup } from "@/registry/ui/admin-shell"
import { AdminKit } from "@/registry/blocks/admin-kit"

const groups: AdminNavGroup[] = [
  { label: "Sitio", items: [{ href: "resumen", label: "Resumen", icon: LayoutDashboard }] },
]

// Sonner only renders the list once a toast exists, and it adds the toast on a timer.
async function fireToast() {
  await act(async () => {
    toast("Guardado")
    await new Promise((resolve) => setTimeout(resolve, 50))
  })
}

// app/layout.tsx wraps every page in TooltipProvider; the sidebar needs it.
function mount(ui: React.ReactNode) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

function toasterCount() {
  return document.querySelectorAll("[data-sonner-toaster]").length
}

afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  cleanup()
})

describe("admin toaster default", () => {
  it("AdminShell without showToaster does not mount its own Toaster", async () => {
    mount(<AdminShell groups={groups} pathname="resumen" onNavigate={() => {}} />)
    await fireToast()
    expect(toasterCount()).toBe(0)
  })

  it("AdminKit without showToaster does not mount its own Toaster", async () => {
    mount(<AdminKit />)
    await fireToast()
    expect(toasterCount()).toBe(0)
  })

  it("a host Toaster plus AdminKit renders each toast once", async () => {
    mount(
      <>
        <Toaster />
        <AdminKit />
      </>,
    )
    await fireToast()
    expect(toasterCount()).toBe(1)
  })

  it("showToaster mounts the internal Toaster for standalone use", async () => {
    mount(<AdminShell groups={groups} pathname="resumen" onNavigate={() => {}} showToaster />)
    await fireToast()
    expect(toasterCount()).toBe(1)
  })
})
