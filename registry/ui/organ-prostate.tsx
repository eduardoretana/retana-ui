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
      tone: "chart-1", shade: 0.11,
      description:
        "A walnut-sized gland below the bladder and in front of the rectum. The urethra runs through it, and it adds fluid to semen.",
    },
    {
      id: "seminal-vesicles",
      label: "Seminal vesicles",
      group: "Glands",
      tone: "chart-2", shade: 0.08,
      description:
        "Paired coiled glands behind the bladder. They make most of the fluid in semen and join the deferent ducts above the prostate.",
    },
    {
      id: "testes",
      label: "Testes",
      group: "Testes and ducts",
      tone: "chart-1", shade: 0.2,
      description:
        "Paired glands in the scrotum that produce sperm and testosterone.",
    },
    {
      id: "epididymides",
      label: "Epididymides",
      group: "Testes and ducts",
      tone: "chart-5", shade: 0.07,
      description:
        "Tightly coiled tubes on the back of each testis, where sperm mature and are stored.",
    },
    {
      id: "deferent-ducts",
      label: "Deferent ducts",
      group: "Testes and ducts",
      tone: "muted-foreground", shade: 0.02,
      description:
        "Carry sperm from each epididymis up through the groin, over the bladder and down behind it to the prostate.",
    },
    {
      id: "corpora-cavernosa",
      label: "Corpora cavernosa",
      group: "Penis and urethra",
      tone: "chart-1", shade: 0.06,
      description:
        "Two columns of erectile tissue along the top of the penis. They fill with blood during an erection.",
    },
    {
      id: "corpus-spongiosum",
      label: "Corpus spongiosum",
      group: "Penis and urethra",
      tone: "chart-1", shade: 0.15,
      description:
        "The column of erectile tissue along the underside of the penis. It surrounds the urethra and ends in the glans.",
    },
    {
      id: "glans-penis",
      label: "Glans penis",
      group: "Penis and urethra",
      tone: "chart-1", shade: 0.21,
      description:
        "The expanded tip of the corpus spongiosum, where the urethra opens.",
    },
    {
      id: "urethra",
      label: "Urethra",
      group: "Penis and urethra",
      tone: "chart-2", shade: 0.13,
      description:
        "Carries urine from the bladder and semen from the ejaculatory ducts. It passes through the prostate and the length of the penis.",
    },
    {
      id: "dorsal-arteries",
      label: "Dorsal arteries of penis",
      group: "Vessels",
      tone: "chart-1", shade: 0.01,
      description:
        "Paired arteries along the top of the penis that supply its skin and the glans.",
    },
    {
      id: "dorsal-veins",
      label: "Dorsal veins of penis",
      group: "Vessels",
      tone: "chart-4", shade: 0.05,
      description:
        "Run along the midline of the penis. The deep vein drains the erectile tissue toward the veins around the prostate.",
    },
    {
      id: "urinary-bladder",
      label: "Urinary bladder",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.13,
      description:
        "Stores urine. The prostate sits directly below it and the seminal vesicles lie against its back.",
    },
    {
      id: "rectum",
      label: "Rectum",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.05,
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
