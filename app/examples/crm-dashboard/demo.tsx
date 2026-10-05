"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { CrmDashboard } from "@/registry/blocks/crm-dashboard"

export function Demo() {
  return <CrmDashboard headerSlot={<ThemeToggle />} />
}
