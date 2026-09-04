import type { Inspection, InspectionImage, ImageCategory } from "../types";

const STORAGE_KEY = "metricheck:inspections";

function loadFromStorage(): Inspection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Inspection[];
  } catch {
    return [];
  }
}

function saveToStorage(inspections: Inspection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
  } catch {
    // ignore quota errors in demo
  }
}

export function getLocalInspections(): Inspection[] {
  return loadFromStorage();
}

export function getLocalInspection(id: string): Inspection | undefined {
  return loadFromStorage().find((i) => i.id === id);
}

export interface SaveInspectionInput {
  location?: string;
  notes?: string;
  inspector: string;
  date: string;
  imageCategories: ImageCategory[];
}

export function saveLocalInspection(input: SaveInspectionInput): Inspection {
  const existing = loadFromStorage();
  const maxNum = existing.reduce((max, i) => {
    const m = i.id.match(/INS-2026-(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 142);
  const id = `INS-2026-${String(maxNum + 1).padStart(4, "0")}`;

  const images: InspectionImage[] = input.imageCategories.map((cat, idx) => ({
    id: `local-img-${id}-${idx}`,
    category: cat,
    quality: "acceptable",
    url: `mock://local-${cat}`,
  }));

  const inspection: Inspection = {
    id,
    product: "Pending OCR extraction — demo data",
    category: "Pending OCR extraction — demo data",
    manufacturer: "Pending OCR extraction — demo data",
    location: input.location || "",
    inspector: input.inspector,
    date: input.date,
    status: "needs_review",
    reviewState: "pending",
    images,
    findings: generateDemoFindings(id, images),
    notes: input.notes,
  };

  saveToStorage([inspection, ...existing]);
  return inspection;
}

function generateDemoFindings(inspectionId: string, images: InspectionImage[]) {
  const frontImg = images.find((i) => i.category === "front") ?? images[0];
  const backImg = images.find((i) => i.category === "back") ?? images[0];

  return [
    {
      id: `df-${inspectionId}-1`,
      requirement: "Maximum Retail Price (MRP)",
      requirementDescription:
        "Every pre-packaged commodity must declare the Maximum Retail Price.",
      status: "needs_review" as const,
      detectedValue: "—",
      confidence: 0,
      source: {
        imageId: backImg.id,
        imageCategory: backImg.category,
        regionLabel: "Back Image",
        regionIndex: 2,
      },
      extractedText: "",
      evidencePreviewUrl: `mock://evidence-${inspectionId}-mrp`,
      verification: "pending" as const,
      explanation:
        "Demo finding — no OCR was performed. The MRP will be extracted automatically once the AI/OCR pipeline is connected.",
      whyReview:
        "This is a demo placeholder. No real text recognition has occurred. The finding will be populated with real extracted data in the backend phase.",
    },
    {
      id: `df-${inspectionId}-2`,
      requirement: "Net Quantity Declaration",
      requirementDescription:
        "Net quantity in terms of weight, measure, or number must be declared.",
      status: "insufficient_evidence" as const,
      detectedValue: "—",
      confidence: 0,
      source: {
        imageId: frontImg.id,
        imageCategory: frontImg.category,
        regionLabel: "Front Image",
        regionIndex: 1,
      },
      extractedText: "",
      evidencePreviewUrl: `mock://evidence-${inspectionId}-qty`,
      verification: "pending" as const,
      explanation:
        "Demo finding — no OCR was performed. Net quantity will be extracted automatically once the AI/OCR pipeline is connected.",
      whyReview:
        "This is a demo placeholder. No real text recognition has occurred.",
    },
  ];
}
