"use client"

import { SceneDeck } from "@/app/catalog/scene-deck"

import { scenes } from "./scenes"

export function Demo() {
  return <SceneDeck scenes={scenes} />
}
