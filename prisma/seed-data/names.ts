export const INDIAN_MALE_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Rohan", "Kabir", "Aryan", "Dhruv", "Karthik", "Rahul",
  "Amit", "Vikram", "Anil", "Sanjay", "Rajesh", "Suresh", "Manish", "Deepak",
  "Ravi", "Ajay", "Nikhil", "Varun", "Siddharth", "Abhishek", "Gaurav", "Naveen",
  "Pranav", "Harsh", "Yash", "Vishal", "Mohit", "Tarun", "Uday", "Kunal",
];

export const INDIAN_FEMALE_FIRST_NAMES = [
  "Saanvi", "Ananya", "Diya", "Aadhya", "Kavya", "Myra", "Pari", "Anika",
  "Ira", "Riya", "Priya", "Sneha", "Neha", "Pooja", "Divya", "Shreya",
  "Kritika", "Nisha", "Meera", "Anjali", "Swati", "Rekha", "Sunita", "Kavita",
  "Lakshmi", "Radha", "Geeta", "Aditi", "Isha", "Tanvi", "Nandini", "Simran",
  "Vidya", "Rachna", "Preeti", "Komal", "Bhavna", "Manisha", "Ritu", "Sarika",
];

export const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Patel", "Mehta", "Shah",
  "Reddy", "Rao", "Nair", "Menon", "Iyer", "Iyengar", "Chopra", "Malhotra",
  "Kapoor", "Khanna", "Bhatia", "Agarwal", "Jain", "Bansal", "Mishra", "Pandey",
  "Tiwari", "Dubey", "Joshi", "Desai", "Trivedi", "Choudhary", "Yadav", "Thakur",
  "Bose", "Chatterjee", "Banerjee", "Mukherjee", "Das", "Ghosh", "Pillai", "Naidu",
];

export const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Kochi", state: "Kerala" },
  { city: "Chandigarh", state: "Punjab" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Surat", state: "Gujarat" },
];

export const DEPARTMENT_SEED = [
  { name: "Cardiology", floor: 3, description: "Heart and cardiovascular care" },
  { name: "Neurology", floor: 4, description: "Brain, spine and nervous system" },
  { name: "Orthopedics", floor: 2, description: "Bones, joints and musculoskeletal care" },
  { name: "Pediatrics", floor: 1, description: "Child and adolescent healthcare" },
  { name: "General Medicine", floor: 1, description: "Primary and internal medicine" },
  { name: "Gynecology", floor: 2, description: "Women's health and obstetrics" },
  { name: "ENT", floor: 3, description: "Ear, nose and throat care" },
  { name: "Dermatology", floor: 2, description: "Skin, hair and nail care" },
];

export const SPECIALIZATIONS: Record<string, string[]> = {
  Cardiology: ["Interventional Cardiology", "Cardiac Electrophysiology", "General Cardiology"],
  Neurology: ["Stroke & Vascular Neurology", "Epilepsy", "General Neurology"],
  Orthopedics: ["Joint Replacement", "Sports Medicine", "Spine Surgery"],
  Pediatrics: ["Neonatology", "Pediatric General Medicine", "Pediatric Cardiology"],
  "General Medicine": ["Internal Medicine", "Family Medicine", "Diabetology"],
  Gynecology: ["Obstetrics", "Reproductive Medicine", "Gynecologic Oncology"],
  ENT: ["Otology", "Rhinology", "Head & Neck Surgery"],
  Dermatology: ["Cosmetic Dermatology", "Medical Dermatology", "Dermatopathology"],
};

export const QUALIFICATIONS = ["MBBS, MD", "MBBS, MS", "MBBS, DM", "MBBS, MCh", "MBBS, DNB"];

export const DIAGNOSES = [
  "Hypertension", "Type 2 Diabetes Mellitus", "Migraine", "Viral Fever", "Asthma",
  "Fracture - Distal Radius", "Gastritis", "Iron Deficiency Anemia", "Pregnancy Checkup",
  "Acute Appendicitis", "Kidney Stones", "Upper Respiratory Tract Infection",
  "Lower Back Pain", "Osteoarthritis", "Allergic Rhinitis", "Urinary Tract Infection",
  "Hypothyroidism", "Acid Reflux Disease", "Dengue Fever", "Typhoid Fever",
  "Bronchitis", "Conjunctivitis", "Skin Allergy", "Anxiety Disorder",
];

export const SYMPTOMS_POOL = [
  "Fever", "Headache", "Fatigue", "Nausea", "Cough", "Sore throat", "Body ache",
  "Dizziness", "Shortness of breath", "Chest pain", "Abdominal pain", "Joint pain",
  "Loss of appetite", "Vomiting", "Rash",
];

export const MEDICATIONS = [
  { name: "Paracetamol", dosage: "500mg", frequency: "1-0-1" },
  { name: "Amoxicillin", dosage: "500mg", frequency: "1-1-1" },
  { name: "Metformin", dosage: "500mg", frequency: "1-0-1" },
  { name: "Amlodipine", dosage: "5mg", frequency: "1-0-0" },
  { name: "Atorvastatin", dosage: "10mg", frequency: "0-0-1" },
  { name: "Omeprazole", dosage: "20mg", frequency: "1-0-0" },
  { name: "Cetirizine", dosage: "10mg", frequency: "0-0-1" },
  { name: "Azithromycin", dosage: "500mg", frequency: "1-0-0" },
  { name: "Ibuprofen", dosage: "400mg", frequency: "1-0-1" },
  { name: "Losartan", dosage: "50mg", frequency: "1-0-0" },
  { name: "Levothyroxine", dosage: "50mcg", frequency: "1-0-0" },
  { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed" },
  { name: "Pantoprazole", dosage: "40mg", frequency: "1-0-0" },
  { name: "Ferrous Sulfate", dosage: "325mg", frequency: "1-0-1" },
  { name: "Vitamin D3", dosage: "60000 IU", frequency: "Once weekly" },
];

export function randomIndianPhone(): string {
  const prefix = ["9", "8", "7"][Math.floor(Math.random() * 3)];
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  return `+91 ${prefix}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

export function randomPincode(): string {
  return String(100000 + Math.floor(Math.random() * 899999));
}
