import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/prostate-3d at 204c67a. The GLB stays in that
// repository under its own licence; see attribution.source.
export const prostateModel: OrganModel = {
  name: "Prostate",
  src: "https://cdn.jsdelivr.net/gh/organui/prostate-3d@204c67a54226a19868abd0a5e8449a7f82827bf9/public/models/prostate.glb",
  bytes: 1250112,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Lateral",
      direction: [-1, 0, 0],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
  ],
  structures: [
    {
      id: "prostate",
      label: "Prostate",
      group: "Glands",
      color: "#c98a7d",
      description:
        "A walnut-sized gland below the bladder and in front of the rectum. The urethra runs through it, and it adds fluid to semen.",
    },
    {
      id: "seminal-vesicles",
      label: "Seminal vesicles",
      group: "Glands",
      color: "#d6a95f",
      description:
        "Paired coiled glands behind the bladder. They make most of the fluid in semen and join the deferent ducts above the prostate.",
    },
    {
      id: "testes",
      label: "Testes",
      group: "Testes and ducts",
      color: "#e0b9a0",
      description:
        "Paired glands in the scrotum that produce sperm and testosterone.",
    },
    {
      id: "epididymides",
      label: "Epididymides",
      group: "Testes and ducts",
      color: "#9c7bb0",
      description:
        "Tightly coiled tubes on the back of each testis, where sperm mature and are stored.",
    },
    {
      id: "deferent-ducts",
      label: "Deferent ducts",
      group: "Testes and ducts",
      color: "#6f9a8b",
      description:
        "Carry sperm from each epididymis up through the groin, over the bladder and down behind it to the prostate.",
    },
    {
      id: "corpora-cavernosa",
      label: "Corpora cavernosa",
      group: "Penis and urethra",
      color: "#b86f78",
      description:
        "Two columns of erectile tissue along the top of the penis. They fill with blood during an erection.",
    },
    {
      id: "corpus-spongiosum",
      label: "Corpus spongiosum",
      group: "Penis and urethra",
      color: "#d28f8f",
      description:
        "The column of erectile tissue along the underside of the penis. It surrounds the urethra and ends in the glans.",
    },
    {
      id: "glans-penis",
      label: "Glans penis",
      group: "Penis and urethra",
      color: "#e3a6a0",
      description:
        "The expanded tip of the corpus spongiosum, where the urethra opens.",
    },
    {
      id: "urethra",
      label: "Urethra",
      group: "Penis and urethra",
      color: "#e8c76a",
      description:
        "Carries urine from the bladder and semen from the ejaculatory ducts. It passes through the prostate and the length of the penis.",
    },
    {
      id: "dorsal-arteries",
      label: "Dorsal arteries of penis",
      group: "Vessels",
      color: "#b8564c",
      description:
        "Paired arteries along the top of the penis that supply its skin and the glans.",
    },
    {
      id: "dorsal-veins",
      label: "Dorsal veins of penis",
      group: "Vessels",
      color: "#6d8db0",
      description:
        "Run along the midline of the penis. The deep vein drains the erectile tissue toward the veins around the prostate.",
    },
    {
      id: "urinary-bladder",
      label: "Urinary bladder",
      group: "Neighbouring organs",
      color: "#c7b98e",
      description:
        "Stores urine. The prostate sits directly below it and the seminal vesicles lie against its back.",
    },
    {
      id: "rectum",
      label: "Rectum",
      group: "Neighbouring organs",
      color: "#a88a74",
      description:
        "The last part of the large intestine. It lies behind the prostate, which is why the prostate can be felt through its wall.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/prostate-3d/blob/204c67a54226a19868abd0a5e8449a7f82827bf9/public/models/ATTRIBUTION.md",
  },
}

export type ProstateProps = Omit<OrganViewerProps, "model">

export function Prostate(props: ProstateProps) {
  return <OrganViewer model={prostateModel} {...props} />
}
