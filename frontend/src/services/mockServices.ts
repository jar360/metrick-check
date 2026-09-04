import type {
  DashboardData,
  Inspection,
  Product,
  ReviewItem,
  Report,
  Rule,
  User,
} from "../types";
import {
  mockDashboardData,
  mockInspections,
  mockProducts,
  mockReviewItems,
  mockReports,
  mockRules,
  mockUsers,
} from "../data/mockData";
import {
  getLocalInspections,
  getLocalInspection,
  saveLocalInspection,
  type SaveInspectionInput,
} from "./localInspectionStore";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getDashboardData(): Promise<DashboardData> {
  await delay(300);
  return mockDashboardData;
}

export async function getInspections(): Promise<Inspection[]> {
  await delay(300);
  return [...getLocalInspections(), ...mockInspections];
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  await delay(200);
  return getLocalInspection(id) ?? mockInspections.find((i) => i.id === id);
}

export async function getProducts(): Promise<Product[]> {
  await delay(300);
  return mockProducts;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await delay(200);
  return mockProducts.find((p) => p.id === id);
}

export async function getReviewQueue(): Promise<ReviewItem[]> {
  await delay(300);
  return mockReviewItems;
}

export async function getReports(): Promise<Report[]> {
  await delay(300);
  return mockReports;
}

export async function getRules(): Promise<Rule[]> {
  await delay(300);
  return mockRules;
}

export async function getUsers(): Promise<User[]> {
  await delay(300);
  return mockUsers;
}

export type CreateInspectionInput = SaveInspectionInput;

export async function createInspection(
  input: CreateInspectionInput
): Promise<{ id: string }> {
  await delay(400);
  const inspection = saveLocalInspection(input);
  return { id: inspection.id };
}

export interface AnalysisStage {
  label: string;
  status: "pending" | "running" | "complete";
}

export async function analyzeInspection(
  id: string,
  onProgress?: (stage: AnalysisStage, percent: number) => void
): Promise<void> {
  void id;
  const stages: string[] = [
    "Checking image quality",
    "Detecting package regions",
    "Reading label text",
    "Extracting declarations",
    "Mapping applicable requirements",
    "Preparing evidence",
  ];
  for (let i = 0; i < stages.length; i++) {
    onProgress?.({ label: stages[i], status: "running" }, Math.round((i / stages.length) * 100));
    await delay(700);
    onProgress?.({ label: stages[i], status: "complete" }, Math.round(((i + 1) / stages.length) * 100));
  }
}
