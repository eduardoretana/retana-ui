"use client"

import { ScenePreview } from "@/app/catalog/scene-preview"

import { scenes } from "./scenes"

export default function Preview() {
  return <ScenePreview scenes={scenes} hero="filled" />
}
