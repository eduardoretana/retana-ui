"use client"

import { ThemeSwitch } from "@/registry/ui/theme-switch"

export default function ThemeSwitchPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ThemeSwitch theme="light" variant="eclipse" onThemeChange={() => {}} label="Tema" />
    </div>
  )
}
