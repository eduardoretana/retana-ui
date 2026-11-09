"use client"

import { SceneDeck } from "@/app/catalog/scene-deck"

import { scenes } from "./scenes"

export function ViewTimelineDemo() {
  return <SceneDeck scenes={scenes} />
}
