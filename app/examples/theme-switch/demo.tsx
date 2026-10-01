"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ThemeSwitch, type ThemeName, type ThemeSwitchVariant } from "@/registry/ui/theme-switch"

const variants: ThemeSwitchVariant[] = ["fade", "eclipse", "split", "rise"]

function useDocumentTheme(): ThemeName {
  return useSyncExternalStore(
    (onStoreChange) => {
      const observer = new MutationObserver(onStoreChange)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      return () => observer.disconnect()
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  )
}

export function Demo() {
  const { setTheme } = useTheme()
  const theme = useDocumentTheme()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <ThemeSwitch
            key={variant}
            theme={theme}
            variant={variant}
            onThemeChange={(next) => setTheme(next)}
            label={variant}
          />
        ))}
      </div>
      <StressCases
        empty={<ThemeSwitch theme={theme} variant="fade" iconOnly label="Theme" onThemeChange={(next) => setTheme(next)} />}
        long={
          <ThemeSwitch
            theme={theme}
            variant="split"
            label={unbreakable}
            onThemeChange={(next) => setTheme(next)}
            className="max-w-full"
          />
        }
        crowded={
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <ThemeSwitch
                key={index}
                theme={theme}
                variant={variants[index % variants.length]}
                iconOnly
                label={`Theme ${index + 1}`}
                onThemeChange={(next) => setTheme(next)}
              />
            ))}
          </div>
        }
      />
    </div>
  )
}
