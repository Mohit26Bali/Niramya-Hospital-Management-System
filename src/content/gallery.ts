export type GalleryItem = {
  id: string;
  title: string;
  category: string;
};

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "hospital-building", title: "Hospital Building", category: "Exterior" },
  { id: "reception-area", title: "Reception Area", category: "Facilities" },
  { id: "icu", title: "ICU", category: "Critical Care" },
  { id: "operation-theatre", title: "Operation Theatre", category: "Surgical" },
  { id: "patient-room-private", title: "Patient Room (Private)", category: "Patient Care" },
  { id: "general-ward", title: "General Ward", category: "Patient Care" },
  { id: "waiting-area", title: "Waiting Area", category: "Facilities" },
  { id: "pharmacy", title: "Pharmacy", category: "Facilities" },
  { id: "diagnostic-lab", title: "Diagnostic Lab", category: "Diagnostics" },
  { id: "cafeteria", title: "Cafeteria", category: "Facilities" },
];
