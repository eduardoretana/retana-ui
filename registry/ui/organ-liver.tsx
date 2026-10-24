import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/liver-3d at 528ee17. The GLB stays in that
// repository under its own licence; see attribution.source.
export const liverModel: OrganModel = {
  name: "Liver",
  src: "https://cdn.jsdelivr.net/gh/organui/liver-3d@528ee1794670d3bfa23d581f91ba49d6af585b03/public/models/liver.glb",
  bytes: 5579432,
  defaultView: "Overview",
  views: [
    {
      name: "Overview",
      direction: [-0.25, 0.28, 1],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Inferior",
      direction: [0, -1, 0.01],
    },
    {
      name: "Superior",
      direction: [0, 1, 0.01],
    },
  ],
  structures: [
    {
      id: "liver",
      label: "Liver surface",
      group: "Liver",
      color: "#a85750",
      description:
        "The liver processes nutrients, stores energy, and makes bile to help digest fats. It sits beneath the diaphragm, mostly on the right side of the abdomen.",
    },
    {
      id: "gallbladder",
      label: "Gallbladder",
      group: "Biliary system",
      color: "#86a65f",
      description:
        "A small organ beneath the liver that stores bile between meals and releases it into the small intestine to support fat digestion.",
    },
    {
      id: "portal",
      label: "Portal vein",
      group: "Blood vessels",
      color: "#9783c1",
      description:
        "The hepatic portal vein brings nutrient-rich blood to the liver from the digestive organs. Its branches distribute this blood through the liver.",
    },
    {
      id: "hepatic-veins",
      label: "Hepatic veins",
      group: "Blood vessels",
      color: "#649cbb",
      description:
        "The hepatic veins carry blood away from the liver toward the inferior vena cava, returning it to the circulation.",
    },
    {
      id: "artery",
      label: "Hepatic artery",
      group: "Blood vessels",
      color: "#d99173",
      description:
        "The hepatic artery supplies oxygenated blood to the liver, alongside the nutrient-rich blood arriving through the portal vein.",
    },
    {
      id: "biliary",
      label: "Hepatic bile ducts",
      group: "Biliary system",
      color: "#b1a450",
      description:
        "A branching network collects bile from the liver. The right and left hepatic ducts join the common hepatic duct.",
    },
    {
      id: "cystic",
      label: "Cystic duct",
      group: "Biliary system",
      color: "#6b9d83",
      description:
        "The cystic duct connects the gallbladder with the bile duct system, providing a passage for stored bile.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
    license: "CC BY 4.0",
    licenseUrl: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
    source:
      "https://github.com/organui/liver-3d/blob/528ee1794670d3bfa23d581f91ba49d6af585b03/public/models/LICENSE.txt",
  },
}

export type LiverProps = Omit<OrganViewerProps, "model">

export function Liver(props: LiverProps) {
  return <OrganViewer model={liverModel} {...props} />
}
