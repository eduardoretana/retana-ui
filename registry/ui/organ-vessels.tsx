import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/vessels-3d at 17257aa. The GLB stays in that
// repository under its own licence; see attribution.source.
export const vesselsModel: OrganModel = {
  name: "Vessels",
  src: "https://cdn.jsdelivr.net/gh/organui/vessels-3d@17257aaa53c885385515fd3b9fe0378da81582d0/public/models/vessels.glb",
  bytes: 2417320,
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
      name: "Head and neck",
      direction: [0, 0, 1],
      structureIds: ["carotid-arteries", "vertebral-arteries", "jugular-veins"],
    },
    {
      name: "Chest",
      direction: [0, 0, 1],
      structureIds: [
        "ascending-aorta",
        "aortic-arch",
        "descending-aorta",
        "brachiocephalic-trunk",
        "internal-thoracic-arteries",
        "pulmonary-trunk",
        "pulmonary-arteries",
        "pulmonary-veins",
        "superior-vena-cava",
        "brachiocephalic-veins",
        "azygos-system",
      ],
    },
    {
      name: "Abdomen and pelvis",
      direction: [0, 0, 1],
      structureIds: [
        "celiac-trunk",
        "hepatic-artery",
        "splenic-artery",
        "superior-mesenteric-artery",
        "inferior-mesenteric-artery",
        "renal-arteries",
        "inferior-vena-cava",
        "renal-veins",
        "portal-vein",
        "splenic-mesenteric-veins",
        "common-iliac-arteries",
        "internal-iliac-arteries",
        "external-iliac-arteries",
        "common-iliac-veins",
        "internal-iliac-veins",
        "external-iliac-veins",
      ],
    },
    {
      name: "Legs",
      direction: [0, 0, 1],
      structureIds: [
        "femoral-arteries",
        "deep-femoral-arteries",
        "popliteal-arteries",
        "anterior-tibial-arteries",
        "posterior-tibial-arteries",
        "fibular-arteries",
        "foot-arteries",
        "femoral-veins",
        "popliteal-veins",
        "great-saphenous-veins",
        "small-saphenous-veins",
      ],
    },
  ],
  structures: [
    {
      id: "carotid-arteries",
      label: "Carotid arteries",
      group: "Head and neck",
      tone: "chart-1", shade: 0.0,
      description:
        "The main arteries of the neck. Each common carotid artery divides into an internal branch for the brain and an external branch for the face and scalp.",
    },
    {
      id: "vertebral-arteries",
      label: "Vertebral arteries",
      group: "Head and neck",
      tone: "chart-1", shade: 0.07,
      description:
        "Rise from the subclavian arteries through openings in the neck vertebrae and join at the base of the skull to help supply the brain.",
    },
    {
      id: "jugular-veins",
      label: "Jugular veins",
      group: "Head and neck",
      tone: "chart-4", shade: -0.01,
      description:
        "Drain blood from the brain, face and neck. The internal jugular vein runs beside the carotid artery and joins the subclavian vein behind the collarbone.",
    },
    {
      id: "ascending-aorta",
      label: "Ascending aorta",
      group: "Chest",
      tone: "chart-1", shade: -0.04,
      description:
        "The first part of the aorta, the body’s largest artery. It leaves the left ventricle of the heart and rises toward the neck.",
    },
    {
      id: "aortic-arch",
      label: "Aortic arch",
      group: "Chest",
      tone: "chart-1", shade: -0.06,
      description:
        "Curves backward and to the left over the heart. The brachiocephalic trunk, left common carotid and left subclavian arteries leave its top.",
    },
    {
      id: "descending-aorta",
      label: "Descending aorta",
      group: "Chest",
      tone: "chart-1", shade: -0.08,
      description:
        "Runs down the back of the chest and through the diaphragm into the abdomen, where it divides into the two common iliac arteries.",
    },
    {
      id: "brachiocephalic-trunk",
      label: "Brachiocephalic trunk",
      group: "Chest",
      tone: "chart-1", shade: 0.02,
      description:
        "The first branch of the aortic arch. It divides into the right subclavian and right common carotid arteries.",
    },
    {
      id: "internal-thoracic-arteries",
      label: "Internal thoracic arteries",
      group: "Chest",
      tone: "chart-1", shade: 0.1,
      description:
        "Run down the inside of the front chest wall, beside the breastbone, and supply the chest wall and breasts.",
    },
    {
      id: "pulmonary-trunk",
      label: "Pulmonary trunk",
      group: "Chest",
      tone: "chart-4", shade: 0.04,
      description:
        "Carries blood low in oxygen from the right ventricle of the heart and divides into the right and left pulmonary arteries.",
    },
    {
      id: "pulmonary-arteries",
      label: "Pulmonary arteries",
      group: "Chest",
      tone: "chart-4", shade: 0.1,
      description:
        "Carry blood from the pulmonary trunk to each lung to pick up oxygen.",
    },
    {
      id: "pulmonary-veins",
      label: "Pulmonary veins",
      group: "Chest",
      tone: "chart-1", shade: 0.11,
      description:
        "Four short veins, two from each lung, that bring blood rich in oxygen back to the left atrium of the heart.",
    },
    {
      id: "superior-vena-cava",
      label: "Superior vena cava",
      group: "Chest",
      tone: "chart-4", shade: -0.07,
      description:
        "Formed by the two brachiocephalic veins. It returns blood from the head, neck and arms to the right atrium.",
    },
    {
      id: "brachiocephalic-veins",
      label: "Brachiocephalic veins",
      group: "Chest",
      tone: "chart-4", shade: 0.0,
      description:
        "Each forms where the internal jugular and subclavian veins meet. The left one crosses in front of the aortic arch to join the right.",
    },
    {
      id: "azygos-system",
      label: "Azygos system",
      group: "Chest",
      tone: "chart-4", shade: 0.07,
      description:
        "Veins along the spine that drain the back of the chest wall and empty into the superior vena cava.",
    },
    {
      id: "subclavian-arteries",
      label: "Subclavian arteries",
      group: "Arms",
      tone: "chart-1", shade: -0.0,
      description:
        "Arch over the top of each lung behind the collarbone. They supply the arms and give off the vertebral and internal thoracic arteries.",
    },
    {
      id: "axillary-arteries",
      label: "Axillary arteries",
      group: "Arms",
      tone: "chart-1", shade: 0.04,
      description:
        "Continue the subclavian arteries through the armpit and become the brachial arteries.",
    },
    {
      id: "brachial-arteries",
      label: "Brachial arteries",
      group: "Arms",
      tone: "chart-1", shade: 0.07,
      description:
        "Run down the inner side of the upper arm. This is the artery used for blood pressure readings at the elbow.",
    },
    {
      id: "radial-arteries",
      label: "Radial arteries",
      group: "Arms",
      tone: "chart-1", shade: 0.1,
      description:
        "Run along the thumb side of the forearm. The pulse is usually felt over this artery at the wrist.",
    },
    {
      id: "ulnar-arteries",
      label: "Ulnar arteries",
      group: "Arms",
      tone: "chart-1", shade: 0.13,
      description:
        "Run along the little-finger side of the forearm toward the palm.",
    },
    {
      id: "palmar-arches",
      label: "Deep palmar arches",
      group: "Arms",
      tone: "chart-1", shade: 0.17,
      description:
        "Loops across the palm, formed mainly by the radial artery, that send branches to the fingers.",
    },
    {
      id: "subclavian-veins",
      label: "Subclavian veins",
      group: "Arms",
      tone: "chart-4", shade: 0.02,
      description:
        "Carry blood from the arms under the collarbone to meet the internal jugular veins.",
    },
    {
      id: "axillary-veins",
      label: "Axillary veins",
      group: "Arms",
      tone: "chart-4", shade: 0.05,
      description:
        "Collect blood from the arm in the armpit and continue as the subclavian veins.",
    },
    {
      id: "cephalic-veins",
      label: "Cephalic veins",
      group: "Arms",
      tone: "chart-4", shade: 0.1,
      description:
        "Surface veins on the thumb side of the arm. They rise to the shoulder and empty into the axillary veins.",
    },
    {
      id: "basilic-veins",
      label: "Basilic veins",
      group: "Arms",
      tone: "chart-4", shade: 0.13,
      description:
        "Surface veins on the little-finger side of the arm. Near the elbow they are a common site for drawing blood.",
    },
    {
      id: "celiac-trunk",
      label: "Celiac trunk",
      group: "Abdomen",
      tone: "chart-1", shade: -0.01,
      description:
        "A short branch from the front of the aorta just below the diaphragm. It supplies the stomach, liver, spleen and pancreas.",
    },
    {
      id: "hepatic-artery",
      label: "Hepatic artery",
      group: "Abdomen",
      tone: "chart-1", shade: 0.06,
      description: "Runs from the celiac trunk to the liver.",
    },
    {
      id: "splenic-artery",
      label: "Splenic artery",
      group: "Abdomen",
      tone: "chart-1", shade: -0.04,
      description:
        "A winding artery from the celiac trunk along the top of the pancreas to the spleen.",
    },
    {
      id: "superior-mesenteric-artery",
      label: "Superior mesenteric artery",
      group: "Abdomen",
      tone: "chart-1", shade: 0.02,
      description:
        "Leaves the aorta just below the celiac trunk and supplies the small intestine and the first half of the large intestine.",
    },
    {
      id: "inferior-mesenteric-artery",
      label: "Inferior mesenteric artery",
      group: "Abdomen",
      tone: "chart-1", shade: 0.09,
      description:
        "Leaves the lower aorta and supplies the last part of the large intestine.",
    },
    {
      id: "renal-arteries",
      label: "Renal arteries",
      group: "Abdomen",
      tone: "chart-1", shade: 0.01,
      description:
        "Leave the sides of the aorta and divide as they enter each kidney. Together they carry about a fifth of the blood the heart pumps.",
    },
    {
      id: "inferior-vena-cava",
      label: "Inferior vena cava",
      group: "Abdomen",
      tone: "chart-4", shade: -0.09,
      description:
        "The body’s largest vein. It runs up the right side of the aorta and returns blood from the legs and abdomen to the right atrium.",
    },
    {
      id: "renal-veins",
      label: "Renal veins",
      group: "Abdomen",
      tone: "chart-4", shade: 0.02,
      description:
        "Drain the kidneys into the inferior vena cava. The left one is longer and crosses in front of the aorta.",
    },
    {
      id: "portal-vein",
      label: "Portal vein",
      group: "Abdomen",
      tone: "chart-4", shade: -0.03,
      description:
        "Carries blood from the intestines, stomach, pancreas and spleen to the liver, which processes it before it reaches the rest of the body.",
    },
    {
      id: "splenic-mesenteric-veins",
      label: "Splenic and mesenteric veins",
      group: "Abdomen",
      tone: "chart-4", shade: 0.11,
      description:
        "Drain the spleen and the intestines and join behind the pancreas to form the portal vein.",
    },
    {
      id: "common-iliac-arteries",
      label: "Common iliac arteries",
      group: "Pelvis",
      tone: "chart-1", shade: -0.02,
      description:
        "The two branches the aorta divides into at about the level of the navel. Each divides again into an internal and an external iliac artery.",
    },
    {
      id: "internal-iliac-arteries",
      label: "Internal iliac arteries",
      group: "Pelvis",
      tone: "chart-1", shade: 0.08,
      description:
        "Supply the pelvic organs, the buttocks and the inner thigh.",
    },
    {
      id: "external-iliac-arteries",
      label: "External iliac arteries",
      group: "Pelvis",
      tone: "chart-1", shade: 0.02,
      description:
        "Run along the brim of the pelvis and pass under the groin ligament to become the femoral arteries.",
    },
    {
      id: "common-iliac-veins",
      label: "Common iliac veins",
      group: "Pelvis",
      tone: "chart-4", shade: -0.04,
      description:
        "Join in front of the lower spine to form the inferior vena cava.",
    },
    {
      id: "internal-iliac-veins",
      label: "Internal iliac veins",
      group: "Pelvis",
      tone: "chart-4", shade: 0.08,
      description: "Drain the pelvic organs and the buttocks.",
    },
    {
      id: "external-iliac-veins",
      label: "External iliac veins",
      group: "Pelvis",
      tone: "chart-4", shade: 0.01,
      description: "Continue the femoral veins up into the pelvis.",
    },
    {
      id: "femoral-arteries",
      label: "Femoral arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.0,
      description:
        "The main arteries of the thigh. A pulse can be felt in the groin, and the artery is a common entry point for catheter procedures.",
    },
    {
      id: "deep-femoral-arteries",
      label: "Deep femoral arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.09,
      description:
        "Large branches of the femoral arteries that supply the deep thigh muscles.",
    },
    {
      id: "popliteal-arteries",
      label: "Popliteal arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.03,
      description:
        "Continue the femoral arteries behind the knee and divide into the tibial arteries.",
    },
    {
      id: "anterior-tibial-arteries",
      label: "Anterior tibial arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.11,
      description:
        "Supply the front of the lower leg and continue onto the top of the foot.",
    },
    {
      id: "posterior-tibial-arteries",
      label: "Posterior tibial arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.06,
      description:
        "Run down the back of the lower leg and pass behind the inner ankle into the sole of the foot.",
    },
    {
      id: "fibular-arteries",
      label: "Fibular arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.15,
      description:
        "Branches of the posterior tibial arteries that run along the fibula, the thinner bone of the lower leg.",
    },
    {
      id: "foot-arteries",
      label: "Foot arteries",
      group: "Legs",
      tone: "chart-1", shade: 0.19,
      description:
        "The dorsalis pedis artery on top of the foot, where a pulse can be felt, and the plantar arch across the sole.",
    },
    {
      id: "femoral-veins",
      label: "Femoral veins",
      group: "Legs",
      tone: "chart-4", shade: -0.02,
      description:
        "Deep veins of the thigh that run beside the femoral arteries. Clots in these veins are a form of deep vein thrombosis.",
    },
    {
      id: "popliteal-veins",
      label: "Popliteal veins",
      group: "Legs",
      tone: "chart-4", shade: 0.04,
      description:
        "Deep veins behind the knee that continue upward as the femoral veins.",
    },
    {
      id: "great-saphenous-veins",
      label: "Great saphenous veins",
      group: "Legs",
      tone: "chart-4", shade: 0.12,
      description:
        "The longest veins in the body. They run just under the skin from the inner ankle to the groin, where they join the femoral veins.",
    },
    {
      id: "small-saphenous-veins",
      label: "Small saphenous veins",
      group: "Legs",
      tone: "chart-4", shade: 0.16,
      description:
        "Surface veins that run up the back of the calf from the outer ankle and join the popliteal veins.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/vessels-3d/blob/17257aaa53c885385515fd3b9fe0378da81582d0/public/models/ATTRIBUTION.md",
  },
}

export type VesselsProps = Omit<OrganViewerProps, "model">

export function Vessels(props: VesselsProps) {
  return <OrganViewer model={vesselsModel} {...props} />
}
