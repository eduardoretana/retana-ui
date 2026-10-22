import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/gallbladder-3d at 15b03b8. The GLB stays in that
// repository under its own licence; see attribution.source.
export const gallbladderModel: OrganModel = {
  name: "Gallbladder",
  src: "https://cdn.jsdelivr.net/gh/organui/gallbladder-3d@15b03b830abe55e1081ac929dcbe6318d84e4067/public/models/gallbladder.glb",
  bytes: 3838836,
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
      id: "gallbladder",
      label: "Gallbladder",
      group: "Gallbladder",
      color: "#6f9a4f",
      description:
        "A pear-shaped sac on the underside of the liver. It stores and concentrates bile between meals and squeezes it out after eating.",
    },
    {
      id: "cystic-duct",
      label: "Cystic duct",
      group: "Bile ducts",
      color: "#9fb35a",
      description:
        "A short duct from the neck of the gallbladder. Bile flows in through it to be stored and back out when the gallbladder contracts.",
    },
    {
      id: "common-hepatic-duct",
      label: "Common hepatic duct",
      group: "Bile ducts",
      color: "#c2ad55",
      description:
        "Formed where the right and left hepatic ducts meet. It carries bile from the liver down toward the duodenum.",
    },
    {
      id: "right-hepatic-duct",
      label: "Right hepatic duct",
      group: "Bile ducts",
      color: "#d6c06a",
      description:
        "Drains bile from the right part of the liver. It is short in this model.",
    },
    {
      id: "left-hepatic-duct",
      label: "Left hepatic duct",
      group: "Bile ducts",
      color: "#b89b45",
      description:
        "Drains bile from the left part of the liver and runs across to meet the right hepatic duct.",
    },
    {
      id: "intrahepatic-ducts",
      label: "Intrahepatic bile ducts",
      group: "Bile ducts",
      color: "#dccf8e",
      description:
        "Branches inside the liver that collect bile from its segments and lead to the right and left hepatic ducts.",
    },
    {
      id: "pancreatic-duct",
      label: "Pancreatic duct",
      group: "Bile ducts",
      color: "#7d9a5e",
      description:
        "Runs the length of the pancreas. It usually joins the common bile duct just before both open into the duodenum.",
    },
    {
      id: "liver",
      label: "Liver",
      group: "Neighbouring organs",
      color: "#a55e4e",
      description:
        "Makes bile and drains it through the hepatic ducts. The gallbladder lies in a shallow fossa on its underside.",
    },
    {
      id: "duodenum",
      label: "Duodenum",
      group: "Neighbouring organs",
      color: "#c99089",
      description:
        "The first part of the small intestine. Bile and pancreatic juice enter it through the major duodenal papilla.",
    },
    {
      id: "pancreas",
      label: "Pancreas",
      group: "Neighbouring organs",
      color: "#dcb67e",
      description:
        "A gland behind the stomach. The lower common bile duct passes through or behind its head.",
    },
    {
      id: "portal-vein",
      label: "Portal vein",
      group: "Vessels",
      color: "#5f7fa6",
      description:
        "Carries blood from the gut and spleen to the liver. It runs behind the bile duct and the hepatic artery.",
    },
    {
      id: "common-hepatic-artery",
      label: "Common hepatic artery",
      group: "Vessels",
      color: "#b8564c",
      description:
        "Runs from the celiac trunk toward the liver and continues as the hepatic artery proper.",
    },
    {
      id: "hepatic-artery-proper",
      label: "Hepatic artery proper",
      group: "Vessels",
      color: "#c9725f",
      description:
        "Climbs beside the bile duct toward the liver and divides into the right and left hepatic arteries.",
    },
    {
      id: "right-hepatic-artery",
      label: "Right hepatic artery",
      group: "Vessels",
      color: "#d0836c",
      description:
        "Supplies the right part of the liver. The cystic artery to the gallbladder usually arises from it.",
    },
    {
      id: "left-hepatic-artery",
      label: "Left hepatic artery",
      group: "Vessels",
      color: "#de9878",
      description: "Supplies the left part of the liver.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/gallbladder-3d/blob/15b03b830abe55e1081ac929dcbe6318d84e4067/public/models/ATTRIBUTION.md",
  },
}

export type GallbladderProps = Omit<OrganViewerProps, "model">

export function Gallbladder(props: GallbladderProps) {
  return <OrganViewer model={gallbladderModel} {...props} />
}
