"use client"

import { SceneDeck } from "@/app/catalog/scene-deck"

import { scenes } from "./scenes"

export const Demo = () => (
  <div className="ae-ember">
    <SceneDeck scenes={scenes} />
  </div>
)
