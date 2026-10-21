import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/stomach-3d at a945af4. The GLB stays in that
// repository under its own licence; see attribution.source.
export const stomachModel: OrganModel = {
  name: "Stomach",
  src: "https://cdn.jsdelivr.net/gh/organui/stomach-3d@a945af4e28cc37da63143c685293e7dae7e7f6d5/public/models/stomach.glb",
  bytes: 1161368,
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
      id: "stomach",
      label: "Stomach",
      group: "Digestive tract",
      tone: "chart-1", shade: 0.14,
      description:
        "A muscular J-shaped sac in the upper left abdomen that stores food, mixes it with digestive juices, and passes it on in small amounts.",
    },
    {
      id: "esophagus",
      label: "Esophagus (lower part)",
      group: "Digestive tract",
      tone: "chart-1", shade: 0.11,
      description:
        "The muscular tube that carries swallowed food down through the chest. It passes through the diaphragm and opens into the stomach at the cardia.",
    },
    {
      id: "duodenum",
      label: "Duodenum",
      group: "Digestive tract",
      tone: "chart-2", shade: 0.14,
      description:
        "The first part of the small intestine. It receives food from the stomach through the pylorus and curves around the head of the pancreas.",
    },
    {
      id: "celiac-trunk",
      label: "Celiac trunk",
      group: "Arteries",
      tone: "chart-1", shade: 0.01,
      description:
        "A short artery branching from the abdominal aorta. It divides into the left gastric, splenic, and common hepatic arteries, which supply the stomach and its neighbours.",
    },
    {
      id: "left-gastric-artery",
      label: "Left gastric artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.07,
      description:
        "The smallest celiac branch. It runs up toward the esophagus and along the lesser curvature of the stomach.",
    },
    {
      id: "splenic-artery",
      label: "Splenic artery",
      group: "Arteries",
      tone: "chart-1", shade: -0.02,
      description:
        "A winding branch running left behind the stomach along the pancreas to the spleen. Its branches also supply parts of the stomach.",
    },
    {
      id: "common-hepatic-artery",
      label: "Common hepatic artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.11,
      description:
        "The celiac branch running right toward the liver. Its branches help supply the stomach, duodenum, and pancreas.",
    },
    {
      id: "spleen",
      label: "Spleen",
      group: "Neighbouring organs",
      tone: "muted-foreground", shade: -0.01,
      description:
        "An organ of the immune and blood systems that sits behind and to the left of the stomach, under the ribs.",
    },
    {
      id: "pancreas",
      label: "Pancreas",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.18,
      description:
        "A gland lying behind the stomach. It releases digestive juices into the duodenum and hormones such as insulin into the blood.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/stomach-3d/blob/a945af4e28cc37da63143c685293e7dae7e7f6d5/public/models/ATTRIBUTION.md",
  },
}

export type StomachProps = Omit<OrganViewerProps, "model">

export function Stomach(props: StomachProps) {
  return <OrganViewer model={stomachModel} {...props} />
}
