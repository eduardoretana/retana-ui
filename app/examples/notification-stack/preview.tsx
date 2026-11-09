"use client"

import { ScenePreview } from "@/app/catalog/scene-preview"

import { scenes } from "./scenes"

export default function NotificationStackPreview() {
  return <ScenePreview scenes={scenes} hero="filled" />
}
