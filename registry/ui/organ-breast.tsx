import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built in this repository by scripts/models/breast.ts from the HuBMAP Human
// Reference Atlas breast reference organs. The GLB is served from organui.com
// under its own licence; see attribution.source.
export const breastModel: OrganModel = {
  name: "Breast",
  src: "https://organui.com/models/breast.glb",
  bytes: 2221312,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Right lateral",
      direction: [-1, 0, 0.25],
      structureIds: [
        "right-fat",
        "right-suspensory-ligaments",
        "right-mammary-lobes",
        "right-main-lactiferous-ducts",
        "right-main-lactiferous-sinuses",
        "right-areola",
        "right-areolar-tubercles",
        "right-nipple",
      ],
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0.25],
      structureIds: [
        "left-fat",
        "left-suspensory-ligaments",
        "left-mammary-lobes",
        "left-main-lactiferous-ducts",
        "left-main-lactiferous-sinuses",
        "left-areola",
        "left-areolar-tubercles",
        "left-nipple",
      ],
    },
  ],
  structures: [
    {
      id: "right-fat",
      label: "Right adipose tissue",
      group: "Right breast",
      color: "#ecc99b",
      description:
        "The fat that gives the right breast most of its size and shape. It fills the spaces between the lobes and lies under the skin. Hide it to see the gland inside.",
    },
    {
      id: "right-suspensory-ligaments",
      label: "Right suspensory ligaments",
      group: "Right breast",
      color: "#d8d3c4",
      description:
        "Bands of connective tissue, also called Cooper's ligaments, that run from the deep fascia over the chest muscles to the skin and support the right breast.",
    },
    {
      id: "right-mammary-lobes",
      label: "Right mammary lobes",
      group: "Right breast",
      color: "#de8f8a",
      description:
        "The 15 to 20 lobes of glandular tissue in the right breast. Each lobe is made of smaller lobules that produce milk during lactation.",
    },
    {
      id: "right-main-lactiferous-ducts",
      label: "Right lactiferous ducts",
      group: "Right breast",
      color: "#c8697a",
      description:
        "One main duct drains each lobe of the right breast and carries milk toward the nipple.",
    },
    {
      id: "right-main-lactiferous-sinuses",
      label: "Right lactiferous sinuses",
      group: "Right breast",
      color: "#a9566a",
      description:
        "Widened parts of the ducts just behind the areola of the right breast, where milk collects before it leaves through the nipple.",
    },
    {
      id: "right-areola",
      label: "Right areola",
      group: "Right breast",
      color: "#b9806c",
      description:
        "The ring of darker skin around the right nipple. It darkens and widens during pregnancy.",
    },
    {
      id: "right-areolar-tubercles",
      label: "Right areolar tubercles",
      group: "Right breast",
      color: "#a26d5c",
      description:
        "Small bumps on the right areola, also called Montgomery's tubercles. Their glands keep the areola and nipple moist.",
    },
    {
      id: "right-nipple",
      label: "Right nipple",
      group: "Right breast",
      color: "#9c5f4f",
      description:
        "The raised centre of the right areola. The lactiferous ducts open on its tip.",
    },
    {
      id: "left-fat",
      label: "Left adipose tissue",
      group: "Left breast",
      color: "#e6c08f",
      description:
        "The fat that gives the left breast most of its size and shape. It fills the spaces between the lobes and lies under the skin. Hide it to see the gland inside.",
    },
    {
      id: "left-suspensory-ligaments",
      label: "Left suspensory ligaments",
      group: "Left breast",
      color: "#cfc9b8",
      description:
        "Bands of connective tissue, also called Cooper's ligaments, that run from the deep fascia over the chest muscles to the skin and support the left breast.",
    },
    {
      id: "left-mammary-lobes",
      label: "Left mammary lobes",
      group: "Left breast",
      color: "#d4837e",
      description:
        "The 15 to 20 lobes of glandular tissue in the left breast. Each lobe is made of smaller lobules that produce milk during lactation.",
    },
    {
      id: "left-main-lactiferous-ducts",
      label: "Left lactiferous ducts",
      group: "Left breast",
      color: "#bd5f70",
      description:
        "One main duct drains each lobe of the left breast and carries milk toward the nipple.",
    },
    {
      id: "left-main-lactiferous-sinuses",
      label: "Left lactiferous sinuses",
      group: "Left breast",
      color: "#9e4c60",
      description:
        "Widened parts of the ducts just behind the areola of the left breast, where milk collects before it leaves through the nipple.",
    },
    {
      id: "left-areola",
      label: "Left areola",
      group: "Left breast",
      color: "#ad7562",
      description:
        "The ring of darker skin around the left nipple. It darkens and widens during pregnancy.",
    },
    {
      id: "left-areolar-tubercles",
      label: "Left areolar tubercles",
      group: "Left breast",
      color: "#976352",
      description:
        "Small bumps on the left areola, also called Montgomery's tubercles. Their glands keep the areola and nipple moist.",
    },
    {
      id: "left-nipple",
      label: "Left nipple",
      group: "Left breast",
      color: "#915545",
      description:
        "The raised centre of the left areola. The lactiferous ducts open on its tip.",
    },
  ],
  attribution: {
    credit:
      "HuBMAP Human Reference Atlas 3D reference organs for the breast (Heidi Schlehlein), CC BY 4.0. Adapted by OrganUI.",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/breast.ATTRIBUTION.md",
  },
}

export type BreastProps = Omit<OrganViewerProps, "model">

export function Breast(props: BreastProps) {
  return <OrganViewer model={breastModel} {...props} />
}
