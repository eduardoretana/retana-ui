"use client"

import { ScenePreview } from "@/app/catalog/scene-preview"

import { scenes } from "./scenes"

export default function Preview() {
  return (
    <div className="ae-ember h-full bg-muted/40">
      <ScenePreview scenes={scenes} hero="filled" />
    </div>
  )
}
