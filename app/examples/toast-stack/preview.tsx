"use client"

import { ScenePreview } from "@/app/catalog/scene-preview"

import { scenes } from "./scenes"

export default function ToastStackPreview() {
  return <ScenePreview scenes={scenes} hero="filled" />
}
