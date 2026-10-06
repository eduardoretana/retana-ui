import type { ReactNode } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"

export function DeskFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-6 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <ThemeToggle />
      </header>
      <div className="h-[760px] min-h-0">{children}</div>
    </main>
  )
}
