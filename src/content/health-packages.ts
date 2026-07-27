export type HealthPackage = {
  slug: string;
  name: string;
  price: number;
  description: string;
  inclusions: string[];
  duration: string;
};

export const HEALTH_PACKAGES: HealthPackage[] = [
  {
    slug: "master-health-checkup",
    name: "Master Health Checkup",
    price: 4999,
    description:
      "A comprehensive full-body screening designed to catch early warning signs across your major organ systems, ideal for annual preventive care.",
    inclusions: [
      "Complete Blood Count (CBC)",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "ECG",
      "Chest X-Ray",
      "Urine Analysis",
      "Diabetes Screening (Fasting & PP Glucose)",
      "Thyroid Profile",
      "Consultation with Physician",
    ],
    duration: "3-4 hours",
  },
  {
    slug: "executive-checkup",
    name: "Executive Checkup",
    price: 8999,
    description:
      "An in-depth checkup for busy professionals, combining every essential screening with cardiac and imaging assessments for a complete health picture.",
    inclusions: [
      "Complete Blood Count (CBC)",
      "Lipid Profile",
      "Liver & Kidney Function Test",
      "Cardiac Stress Test (TMT)",
      "2D Echocardiogram",
      "Chest X-Ray",
      "Ultrasound Abdomen",
      "Thyroid & Diabetes Profile",
      "Consultation with Physician",
      "Consultation with Cardiologist",
    ],
    duration: "4-5 hours",
  },
  {
    slug: "womens-wellness-package",
    name: "Women's Wellness Package",
    price: 5499,
    description:
      "A focused screening package addressing the health needs of women, covering reproductive, bone, and hormonal health alongside general wellness.",
    inclusions: [
      "Complete Blood Count (CBC)",
      "Pap Smear",
      "Mammography",
      "Bone Density Scan (DEXA)",
      "Hormone Panel",
      "Thyroid Profile",
      "Iron Studies",
      "Consultation with Gynecologist",
    ],
    duration: "3-4 hours",
  },
  {
    slug: "senior-citizen-package",
    name: "Senior Citizen Package",
    price: 6499,
    description:
      "An age-appropriate checkup covering the conditions most relevant to older adults, from bone and heart health to vision and hearing.",
    inclusions: [
      "Complete Blood Count (CBC)",
      "Bone Density Scan (DEXA)",
      "ECG & 2D Echo",
      "Lipid Profile",
      "Kidney & Liver Function Test",
      "Vision & Hearing Screening",
      "Prostate Screening (PSA, for men)",
      "Consultation with Physician",
    ],
    duration: "Same day",
  },
  {
    slug: "diabetes-package",
    name: "Diabetes Package",
    price: 2999,
    description:
      "A targeted panel for diagnosing and monitoring diabetes, tracking both current blood sugar levels and long-term glycemic control.",
    inclusions: [
      "HbA1c",
      "Fasting Blood Glucose",
      "Post-Prandial Blood Glucose",
      "Kidney Function Test",
      "Lipid Profile",
      "Diabetic Eye Checkup",
      "Consultation with Physician",
    ],
    duration: "2-3 hours",
  },
  {
    slug: "cardiac-package",
    name: "Cardiac Package",
    price: 7499,
    description:
      "A dedicated heart-health screening for individuals with cardiac risk factors or a family history of heart disease.",
    inclusions: [
      "ECG",
      "2D Echocardiogram",
      "Cardiac Stress Test (TMT)",
      "Lipid Profile",
      "Chest X-Ray",
      "Consultation with Cardiologist",
    ],
    duration: "3-4 hours",
  },
];
