import { vi } from "vitest"

vi.mock("maplibre-gl", () => import("./helpers/maplibre-mock"))

import { describeMapBrowserContract } from "@/contracts/map-browser.contract"
import { MapBrowser, type MapBrowserProps } from "@/registry/blocks/map-browser"

describeMapBrowserContract("map-browser", (props: MapBrowserProps) => <MapBrowser {...props} />)
