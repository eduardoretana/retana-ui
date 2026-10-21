import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/intestines-3d at 8386b23. The GLB stays in that
// repository under its own licence; see attribution.source.
export const intestinesModel: OrganModel = {
  name: "Intestines",
  src: "https://cdn.jsdelivr.net/gh/organui/intestines-3d@8386b2327715f32b2ec62b403b94a3e5f6a307e2/public/models/intestines.glb",
  bytes: 2366084,
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
      name: "Left lateral",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "duodenum",
      label: "Duodenum",
      group: "Small intestine",
      tone: "chart-1", shade: 0.13,
      description:
        "The first, C-shaped part of the small intestine. It receives food from the stomach along with bile and pancreatic juices.",
    },
    {
      id: "jejunum",
      label: "Jejunum",
      group: "Small intestine",
      tone: "chart-1", shade: 0.14,
      description:
        "The middle part of the small intestine, where much of the digestion and absorption of nutrients takes place.",
    },
    {
      id: "ileum",
      label: "Ileum",
      group: "Small intestine",
      tone: "chart-1", shade: 0.09,
      description:
        "The last part of the small intestine. It continues absorbing nutrients and joins the large intestine in the lower right abdomen.",
    },
    {
      id: "appendix",
      label: "Appendix",
      group: "Large intestine",
      tone: "chart-1", shade: 0.09,
      description:
        "A narrow, finger-shaped pouch that projects from the beginning of the large intestine in the lower right abdomen.",
    },
    {
      id: "ascending-colon",
      label: "Ascending colon",
      group: "Large intestine",
      tone: "chart-2", shade: 0.1,
      description:
        "Rises along the right side of the abdomen from the start of the large intestine toward the liver. The colon absorbs water and forms stool.",
    },
    {
      id: "transverse-colon",
      label: "Transverse colon",
      group: "Large intestine",
      tone: "chart-2", shade: 0.06,
      description:
        "Crosses the upper abdomen from right to left, below the liver and stomach.",
    },
    {
      id: "descending-colon",
      label: "Descending colon",
      group: "Large intestine",
      tone: "chart-2", shade: 0.03,
      description:
        "Runs down the left side of the abdomen and carries stool toward the rectum.",
    },
    {
      id: "rectum",
      label: "Rectum",
      group: "Large intestine",
      tone: "chart-2", shade: -0.0,
      description:
        "The final straight section of the large intestine, in the pelvis, which stores stool until it leaves the body through the anus.",
    },
    {
      id: "mesocolic-taenia",
      label: "Mesocolic taenia",
      group: "Taeniae coli",
      tone: "chart-2", shade: 0.22,
      description:
        "One of three ribbon-like bands of longitudinal muscle on the colon. It runs along the side where the colon is attached by its mesentery.",
    },
    {
      id: "omental-taenia",
      label: "Omental taenia",
      group: "Taeniae coli",
      tone: "chart-2", shade: 0.16,
      description:
        "A band of longitudinal colon muscle that, on the transverse colon, runs where the greater omentum attaches.",
    },
    {
      id: "free-taenia",
      label: "Free taenia",
      group: "Taeniae coli",
      tone: "chart-2", shade: 0.25,
      description:
        "The band of longitudinal colon muscle with no attachment, visible on the front of the ascending and descending colon.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/intestines-3d/blob/8386b2327715f32b2ec62b403b94a3e5f6a307e2/public/models/LICENSE.txt",
  },
}

export type IntestinesProps = Omit<OrganViewerProps, "model">

export function Intestines(props: IntestinesProps) {
  return <OrganViewer model={intestinesModel} {...props} />
}
