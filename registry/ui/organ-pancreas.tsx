import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/pancreas-3d at b96dcf3. The GLB stays in that
// repository under its own licence; see attribution.source.
export const pancreasModel: OrganModel = {
  name: "Pancreas",
  src: "https://cdn.jsdelivr.net/gh/organui/pancreas-3d@b96dcf3c234b2b6dba9473661b1d604532301a67/public/models/pancreas.glb",
  bytes: 881964,
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
      name: "Inferior",
      direction: [0, -1, 0.35],
    },
  ],
  structures: [
    {
      id: "pancreas",
      label: "Pancreas",
      group: "Pancreas",
      tone: "chart-2", shade: 0.14,
      description:
        "A gland behind the stomach. Its head sits in the curve of the duodenum and its tail reaches the spleen.",
    },
    {
      id: "pancreatic-duct",
      label: "Pancreatic duct",
      group: "Pancreas",
      tone: "chart-3", shade: -0.01,
      description:
        "Carries digestive juices from the gland along its length and empties them into the duodenum.",
    },
    {
      id: "duodenum",
      label: "Duodenum",
      group: "Neighbouring organs",
      tone: "chart-1", shade: 0.13,
      description:
        "The first part of the small intestine. It curves around the head of the pancreas and receives the pancreatic duct.",
    },
    {
      id: "spleen",
      label: "Spleen",
      group: "Neighbouring organs",
      tone: "chart-1", shade: -0.03,
      description:
        "An organ in the upper left abdomen. The tail of the pancreas ends near its hilum.",
    },
    {
      id: "celiac-trunk",
      label: "Celiac trunk",
      group: "Arteries",
      tone: "chart-1", shade: 0.01,
      description:
        "A short branch of the aorta that divides into arteries supplying the stomach, liver, spleen and pancreas.",
    },
    {
      id: "common-hepatic-artery",
      label: "Common hepatic artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.06,
      description:
        "Runs from the celiac trunk toward the liver and gives off the gastroduodenal artery.",
    },
    {
      id: "gastroduodenal-artery",
      label: "Gastroduodenal artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.1,
      description:
        "Passes behind the first part of the duodenum and leads to the arteries around the pancreatic head.",
    },
    {
      id: "pancreaticoduodenal-arteries",
      label: "Pancreaticoduodenal arteries",
      group: "Arteries",
      tone: "chart-1", shade: 0.14,
      description:
        "Arcades around the head of the pancreas that supply it and the duodenum, joining branches from above and below.",
    },
    {
      id: "splenic-artery",
      label: "Splenic artery",
      group: "Arteries",
      tone: "chart-1", shade: -0.03,
      description:
        "Runs from the celiac trunk along the upper border of the pancreas to the spleen.",
    },
    {
      id: "pancreatic-arteries",
      label: "Pancreatic branches",
      group: "Arteries",
      tone: "chart-1", shade: 0.17,
      description:
        "Branches that supply the neck, body and tail of the pancreas.",
    },
    {
      id: "superior-mesenteric-artery",
      label: "Superior mesenteric artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.03,
      description:
        "Leaves the aorta behind the neck of the pancreas and supplies much of the intestine.",
    },
    {
      id: "splenic-vein",
      label: "Splenic vein",
      group: "Veins",
      tone: "chart-4", shade: 0.05,
      description:
        "Drains the spleen and runs behind the pancreas to join the superior mesenteric vein.",
    },
    {
      id: "superior-mesenteric-vein",
      label: "Superior mesenteric vein",
      group: "Veins",
      tone: "chart-4", shade: 0.1,
      description:
        "Drains much of the intestine. Its left border marks where the head of the pancreas ends and the body begins.",
    },
    {
      id: "portal-vein",
      label: "Portal vein",
      group: "Veins",
      tone: "chart-4", shade: 0.01,
      description:
        "Formed behind the neck of the pancreas where the splenic and superior mesenteric veins meet. It carries blood to the liver.",
    },
    {
      id: "pancreaticoduodenal-veins",
      label: "Pancreaticoduodenal veins",
      group: "Veins",
      tone: "chart-4", shade: 0.15,
      description:
        "Drain the head of the pancreas and the duodenum toward the portal system.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/pancreas-3d/blob/b96dcf3c234b2b6dba9473661b1d604532301a67/public/models/ATTRIBUTION.md",
  },
}

export type PancreasProps = Omit<OrganViewerProps, "model">

export function Pancreas(props: PancreasProps) {
  return <OrganViewer model={pancreasModel} {...props} />
}
