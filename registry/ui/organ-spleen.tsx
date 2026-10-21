import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/spleen-3d at 5059a95. The GLB stays in that
// repository under its own licence; see attribution.source.
export const spleenModel: OrganModel = {
  name: "Spleen",
  src: "https://cdn.jsdelivr.net/gh/organui/spleen-3d@5059a958d2c39547294d39de8ec296fda3888148/public/models/spleen.glb",
  bytes: 1695732,
  defaultView: "Posterior",
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
      id: "spleen",
      label: "Spleen",
      group: "Spleen",
      tone: "chart-1", shade: -0.05,
      description:
        "The largest lymphatic organ. It filters blood, removes worn-out red blood cells, and helps the immune system respond to infection.",
    },
    {
      id: "splenic-artery",
      label: "Splenic artery",
      group: "Splenic vessels",
      tone: "chart-1", shade: 0.05,
      description:
        "Carries blood from the celiac trunk along the upper border of the pancreas to the spleen.",
    },
    {
      id: "splenic-vein",
      label: "Splenic vein",
      group: "Splenic vessels",
      tone: "chart-4", shade: 0.03,
      description:
        "Drains blood from the spleen behind the pancreas. It joins the superior mesenteric vein to form the portal vein, which carries it to the liver.",
    },
    {
      id: "celiac-trunk",
      label: "Celiac trunk",
      group: "Splenic vessels",
      tone: "chart-1", shade: 0.1,
      description:
        "A short branch of the abdominal aorta that divides to supply the stomach, liver and spleen. The splenic artery is its largest branch.",
    },
    {
      id: "superior-mesenteric-vein",
      label: "Superior mesenteric vein",
      group: "Splenic vessels",
      tone: "chart-4", shade: 0.11,
      description:
        "Drains the small intestine and joins the splenic vein behind the neck of the pancreas.",
    },
    {
      id: "stomach",
      label: "Stomach",
      group: "Neighbouring organs",
      tone: "chart-1", shade: 0.16,
      description:
        "Lies in front of and to the right of the spleen. The spleen’s front surface rests against the back of the stomach.",
    },
    {
      id: "pancreas",
      label: "Pancreas",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.14,
      description:
        "Its tail reaches toward the splenic hilum, and the splenic vessels run along its upper border and back.",
    },
    {
      id: "left-kidney",
      label: "Left kidney",
      group: "Neighbouring organs",
      tone: "chart-1", shade: 0.03,
      description:
        "Sits behind and below the spleen. The spleen’s inner surface touches the upper part of the left kidney.",
    },
    {
      id: "left-adrenal",
      label: "Left adrenal gland",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.06,
      description:
        "A small hormone-producing gland on top of the left kidney, close to the spleen’s inner surface.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/spleen-3d/blob/5059a958d2c39547294d39de8ec296fda3888148/public/models/ATTRIBUTION.md",
  },
}

export type SpleenProps = Omit<OrganViewerProps, "model">

export function Spleen(props: SpleenProps) {
  return <OrganViewer model={spleenModel} {...props} />
}
