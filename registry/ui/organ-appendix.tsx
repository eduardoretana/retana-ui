import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built by apps/web/scripts/models/appendix.ts from BodyParts3D 3.0 meshes.
// The GLB is hosted by OrganUI under its own licence; see attribution.source.
export const appendixModel: OrganModel = {
  name: "Appendix",
  src: "https://organui.com/models/appendix.glb",
  bytes: 1786832,
  // From below and medially, where the terminal ileum does not hide it.
  defaultView: "Appendix",
  views: [
    {
      name: "Appendix",
      direction: [0.5, -0.8, 0.6],
      structureIds: ["appendix"],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
  ],
  structures: [
    {
      id: "appendix",
      label: "Vermiform appendix",
      group: "Appendix",
      color: "#d67b9a",
      description:
        "A narrow, blind-ended tube that opens into the cecum just below the ileocecal junction. Its wall is rich in lymphoid tissue, and its position varies from person to person.",
    },
    {
      id: "colon",
      label: "Cecum and ascending colon",
      group: "Large intestine",
      color: "#d8b08c",
      description:
        "The pouch-like start of the large intestine in the right iliac fossa and the colon rising from it. The three taeniae coli meet at the base of the appendix. Cut above the pelvis.",
    },
    {
      id: "ileum",
      label: "Ileum",
      group: "Small intestine",
      color: "#e2c29b",
      description:
        "The last part of the small intestine. It joins the cecum at the ileocecal valve, close to the appendix. Coils outside the right lower abdomen are cut away.",
    },
    {
      id: "right-external-iliac-artery",
      label: "Right external iliac artery",
      group: "Iliac vessels",
      color: "#c4544c",
      description:
        "Runs along the pelvic brim toward the leg. The appendix often lies just in front of it.",
    },
    {
      id: "right-external-iliac-vein",
      label: "Right external iliac vein",
      group: "Iliac vessels",
      color: "#5f7fa3",
      description:
        "Lies beside its artery and drains the right leg into the common iliac vein.",
    },
    {
      id: "right-psoas-major",
      label: "Right psoas major",
      group: "Posterior abdominal wall",
      color: "#a8675e",
      description:
        "A long hip flexor behind the cecum. An inflamed appendix lying against it can make extending the hip painful, the psoas sign. Cut above the pelvis.",
    },
    {
      id: "right-iliacus",
      label: "Right iliacus",
      group: "Posterior abdominal wall",
      color: "#b97f72",
      description:
        "Fills the iliac fossa, the hollow of the pelvic bone on which the cecum and appendix usually rest. Shown down to the hip.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/appendix.ATTRIBUTION.md",
  },
}

export type AppendixProps = Omit<OrganViewerProps, "model">

export function Appendix(props: AppendixProps) {
  return <OrganViewer model={appendixModel} {...props} />
}
