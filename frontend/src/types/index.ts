export type InspectionStatus =
  | "verified"
  | "needs_review"
  | "insufficient_evidence"
  | "non_compliant";

export type ReviewState =
  | "pending"
  | "in_review"
  | "resolved"
  | "not_required";

export type ImageCategory =
  | "front"
  | "back"
  | "side"
  | "top_bottom"
  | "close_up";

export type ImageQuality = "good" | "acceptable" | "poor" | "insufficient";

export type FindingStatus =
  | "verified"
  | "needs_review"
  | "insufficient_evidence"
  | "non_compliant";

export type VerificationAction =
  | "confirm"
  | "correct"
  | "not_visible"
  | "request_new_image"
  | "pending";

export type UserRole = "administrator" | "inspector" | "reviewer";

export type Priority = "low" | "medium" | "high";

export interface InspectionImage {
  id: string;
  category: ImageCategory;
  quality: ImageQuality;
  qualityReason?: string;
  url: string;
  retakeRecommended?: boolean;
}

export interface EvidenceRegion {
  imageId: string;
  imageCategory: ImageCategory;
  regionLabel: string;
  regionIndex: number;
}

export interface ComplianceFinding {
  id: string;
  requirement: string;
  requirementDescription: string;
  ruleRef?: string;
  status: FindingStatus;
  detectedValue: string;
  expectedValue?: string;
  confidence: number;
  source: EvidenceRegion;
  extractedText: string;
  evidencePreviewUrl: string;
  verification: VerificationAction;
  inspectorValue?: string;
  explanation: string;
  whyReview?: string;
}

export interface Inspection {
  id: string;
  product: string;
  category: string;
  barcode?: string;
  manufacturer: string;
  packer?: string;
  location: string;
  inspector: string;
  date: string;
  status: InspectionStatus;
  reviewState: ReviewState;
  findings: ComplianceFinding[];
  images: InspectionImage[];
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  manufacturer: string;
  packer?: string;
  inspectionCount: number;
  lastInspectionDate: string;
  complianceTrend: "improving" | "stable" | "declining";
  recurringIssues: string[];
}

export interface ReviewItem {
  id: string;
  inspectionId: string;
  product: string;
  finding: string;
  confidence: number;
  reason: string;
  date: string;
  priority: Priority;
  status: ReviewState;
  inspector: string;
}

export interface Rule {
  id: string;
  requirement: string;
  applicableCommodity: string;
  source: string;
  ruleVersion: string;
  lastVerified: string;
  status: "active" | "draft" | "deprecated";
  isExample: boolean;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastActive: string;
  permissions: string[];
}

export interface DashboardSummary {
  totalInspections: number;
  verifiedCompliant: number;
  needsReview: number;
  confirmedNonCompliant: number;
  insufficientEvidence: number;
}

export interface DashboardActivity {
  month: string;
  inspections: number;
  verified: number;
  flagged: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentInspections: Inspection[];
  reviewQueueCount: number;
  activity: DashboardActivity[];
  categoryDistribution: CategoryDistribution[];
  attentionItems: ReviewItem[];
}

export interface Report {
  id: string;
  type: "inspection" | "evidence" | "review_summary" | "historical_comparison";
  title: string;
  inspectionId?: string;
  date: string;
  status: "available" | "pending" | "demo";
}
