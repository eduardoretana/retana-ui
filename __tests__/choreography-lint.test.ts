import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

/**
 * High-frequency surfaces must not stagger their rows.
 * Menus, palettes, tabs, and lists the user opens all day appear together.
 */
const HIGH_FREQUENCY = [
  "registry/ui/user-menu.tsx",
  "registry/ui/command-palette.tsx",
  "registry/ui/crm-command-menu.tsx",
  "registry/ui/slash-menu.tsx",
  "registry/ui/mega-menu.tsx",
  "registry/ui/comment-thread.tsx",
  "registry/ui/shortcut-recorder.tsx",
  "registry/ui/notification-stack.tsx",
]

const STAGGER = /staggerChildren|delayChildren|stagger\(|delay:\s*index\s*\*|animationDelay:\s*`\$\{index/

const root = path.resolve(import.meta.dirname, "..")

describe("high-frequency choreography", () => {
  it.each(HIGH_FREQUENCY)("%s appears together, without a stagger", (file) => {
    const source = fs.readFileSync(path.join(root, file), "utf8")
    expect(source).not.toMatch(STAGGER)
  })
})
