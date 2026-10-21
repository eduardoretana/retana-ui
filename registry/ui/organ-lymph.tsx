import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/lymph-3d at ce6d0cf. The GLB stays in that
// repository under its own licence; see attribution.source.
export const lymphModel: OrganModel = {
  name: "Lymph node",
  src: "https://cdn.jsdelivr.net/gh/organui/lymph-3d@ce6d0cf9c1b632d0e109fc84139e14d0b5cbd651/public/models/lymph-node.glb",
  bytes: 6116076,
  defaultView: "Front",
  hiddenIds: ["capsule"],
  views: [
    {
      name: "Front",
      direction: [0, 0, 1],
    },
    {
      name: "Hilum",
      direction: [0, 1, 0.35],
    },
    {
      name: "Side",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "capsule",
      label: "Capsule",
      group: "Lymph node",
      tone: "chart-2", shade: 0.2,
      description:
        "A tough layer of connective tissue that wraps the whole node. Strands from it run inward and divide the node into compartments.",
    },
    {
      id: "follicles",
      label: "Follicles",
      group: "Lymph node",
      tone: "chart-5", shade: 0.06,
      description:
        "Round clusters of B cells in the outer cortex. When they meet an antigen they form germinal centres and start making antibodies.",
    },
    {
      id: "paracortex",
      label: "Paracortex",
      group: "Lymph node",
      tone: "chart-4", shade: 0.04,
      description:
        "The deeper cortex, between the follicles and the medulla. It is rich in T cells, which meet antigen-presenting cells here.",
    },
    {
      id: "medulla",
      label: "Medulla",
      group: "Lymph node",
      tone: "chart-1", shade: 0.16,
      description:
        "The inner part of the node, made of medullary cords of plasma cells and macrophages and the sinuses that carry lymph towards the hilum.",
    },
    {
      id: "afferent-vessels",
      label: "Afferent lymphatic vessels",
      group: "Lymphatic vessels",
      tone: "chart-3", shade: 0.11,
      description:
        "Small vessels that bring lymph into the node through its curved outer surface. The lymph then filters through the sinuses.",
    },
    {
      id: "efferent-vessel",
      label: "Efferent lymphatic vessel",
      group: "Lymphatic vessels",
      tone: "chart-3", shade: -0.06,
      description:
        "Carries filtered lymph out of the node at the hilum, the dent in its side, onwards to the next node and eventually back to the blood.",
    },
    {
      id: "blood-vessels",
      label: "Blood vessels",
      group: "Blood vessels",
      tone: "chart-1", shade: 0.04,
      description:
        "An artery and vein enter and leave at the hilum and branch through the node. Lymphocytes leave the blood into the node through these vessels.",
    },
  ],
  attribution: {
    credit:
      "HuBMAP Human Reference Atlas 3D Reference Object Library (Kristen Browne, Heidi Schlehlein et al.), CC BY 4.0. Adapted by OrganUI.",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://github.com/organui/lymph-3d/blob/ce6d0cf9c1b632d0e109fc84139e14d0b5cbd651/public/models/ATTRIBUTION.md",
  },
}

export type LymphProps = Omit<OrganViewerProps, "model">

export function Lymph(props: LymphProps) {
  return <OrganViewer model={lymphModel} {...props} />
}
