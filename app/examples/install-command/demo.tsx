"use client"

import { InstallCommand } from "@/registry/ui/install-command"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <InstallCommand command="npx shadcn@latest add @retana/tool-call" />
    </div>
  )
}
