import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/adrenals-3d at 320ccd6. The GLB stays in that
// repository under its own licence; see attribution.source.
export const adrenalsModel: OrganModel = {
  name: "Adrenals",
  src: "https://cdn.jsdelivr.net/gh/organui/adrenals-3d@320ccd6e6355cd9f5a9d5854ebe3e363aab08b70/public/models/adrenals.glb",
  bytes: 552428,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.35],
    },
  ],
  structures: [
    {
      id: "right-adrenal-gland",
      label: "Right adrenal gland",
      group: "Adrenal glands",
      color: "#d9a03f",
      description:
        "A small, roughly triangular gland capping the top of the right kidney. It sits close behind the inferior vena cava.",
    },
    {
      id: "left-adrenal-gland",
      label: "Left adrenal gland",
      group: "Adrenal glands",
      color: "#e3b65a",
      description:
        "A crescent-shaped gland along the upper inner border of the left kidney, reaching down toward the renal hilum.",
    },
    {
      id: "right-kidney",
      label: "Right kidney",
      group: "Neighbouring organs",
      color: "#a8726b",
      description:
        "Sits a little lower than the left kidney because the liver lies above it. Its adrenal gland rests on its upper pole.",
    },
    {
      id: "left-kidney",
      label: "Left kidney",
      group: "Neighbouring organs",
      color: "#b5817a",
      description:
        "The left adrenal gland lies against its upper inner border rather than on top of it.",
    },
    {
      id: "aorta",
      label: "Aorta",
      group: "Arteries",
      color: "#b8564c",
      description:
        "The main artery of the body, running down in front of the spine between the two adrenal glands. The middle suprarenal arteries come straight from it.",
    },
    {
      id: "middle-suprarenal-arteries",
      label: "Middle suprarenal arteries",
      group: "Arteries",
      color: "#d0836c",
      description:
        "Short branches from the side of the aorta that run outward to each gland.",
    },
    {
      id: "inferior-suprarenal-arteries",
      label: "Inferior suprarenal arteries",
      group: "Arteries",
      color: "#e3a989",
      description:
        "Branches of the renal arteries that climb to the lower part of each gland.",
    },
    {
      id: "renal-arteries",
      label: "Renal arteries",
      group: "Arteries",
      color: "#c9725f",
      description:
        "Carry blood from the aorta to each kidney and give off the inferior suprarenal arteries.",
    },
    {
      id: "right-suprarenal-vein",
      label: "Right suprarenal vein",
      group: "Veins",
      color: "#5f7fa6",
      description:
        "A short vein that drains the right gland straight into the back of the inferior vena cava.",
    },
    {
      id: "left-suprarenal-vein",
      label: "Left suprarenal vein",
      group: "Veins",
      color: "#7f9fbf",
      description:
        "Runs down from the left gland to join the left renal vein, so the two sides drain differently.",
    },
    {
      id: "inferior-vena-cava",
      label: "Inferior vena cava",
      group: "Veins",
      color: "#4f6f96",
      description:
        "The large vein carrying blood from the lower body to the heart. It runs to the right of the aorta, in front of the right adrenal gland.",
    },
    {
      id: "renal-veins",
      label: "Renal veins",
      group: "Veins",
      color: "#93aecb",
      description:
        "Drain each kidney into the inferior vena cava. The longer left renal vein crosses in front of the aorta and receives the left suprarenal vein.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/adrenals-3d/blob/320ccd6e6355cd9f5a9d5854ebe3e363aab08b70/public/models/ATTRIBUTION.md",
  },
}

export type AdrenalsProps = Omit<OrganViewerProps, "model">

export function Adrenals(props: AdrenalsProps) {
  return <OrganViewer model={adrenalsModel} {...props} />
}
