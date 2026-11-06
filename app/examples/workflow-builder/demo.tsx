"use client"

import { SceneDeck } from "@/app/catalog/scene-deck"
import { ScreenFrame } from "@/registry/blocks/app-shell"
import { scenes } from "./scenes"

export const Demo = () => (
  <ScreenFrame
    shellProps={{
      workspace: { id: "nube", name: "Taller Nube", plan: "Equipo" },
      workspaces: [{ id: "nube", name: "Taller Nube", plan: "Equipo" }],
      projects: [{ id: "hilo", name: "Hilo de ejemplo" }],
      user: { name: "Ada Nube", email: "ada@nube.example", initials: "AN" },
      activeId: "assistant",
      contentLabel: "Flujo",
    }}
  >
    <SceneDeck scenes={scenes} />
  </ScreenFrame>
)
