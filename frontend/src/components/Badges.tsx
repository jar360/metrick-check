import type { InspectionStatus, FindingStatus, ReviewState, Priority, ImageQuality } from "../types";

export function StatusBadge({ status }: { status: InspectionStatus | FindingStatus }) {
  const map: Record<string, { label: string; classes: string; dot: string }> = {
    verified: { label: "Verified", classes: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
    needs_review: { label: "Needs Review", classes: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
    insufficient_evidence: { label: "Insufficient Evidence", classes: "bg-ink-100 text-ink-600 border border-ink-200", dot: "bg-ink-400" },
    non_compliant: { label: "Non-Compliant", classes: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  };
  const s = map[status] ?? map.insufficient_evidence;
  return (
    <span className={`chip ${s.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function ReviewStateBadge({ state }: { state: ReviewState }) {
  const map: Record<ReviewState, { label: string; classes: string }> = {
    pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
    in_review: { label: "In Review", classes: "bg-brand-50 text-brand-700 border border-brand-200" },
    resolved: { label: "Resolved", classes: "bg-green-50 text-green-700 border border-green-200" },
    not_required: { label: "Not Required", classes: "bg-ink-100 text-ink-500 border border-ink-200" },
  };
  const s = map[state];
  return <span className={`chip ${s.classes}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; classes: string }> = {
    low: { label: "Low", classes: "bg-ink-100 text-ink-600 border border-ink-200" },
    medium: { label: "Medium", classes: "bg-orange-50 text-orange-700 border border-orange-200" },
    high: { label: "High", classes: "bg-red-50 text-red-700 border border-red-200" },
  };
  const s = map[priority];
  return <span className={`chip ${s.classes}`}>{s.label}</span>;
}

export function ImageQualityBadge({ quality }: { quality: ImageQuality }) {
  const map: Record<ImageQuality, { label: string; classes: string; dot: string }> = {
    good: { label: "Good", classes: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
    acceptable: { label: "Acceptable", classes: "bg-brand-50 text-brand-700 border border-brand-200", dot: "bg-brand-500" },
    poor: { label: "Poor", classes: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
    insufficient: { label: "Insufficient", classes: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
  };
  const s = map[quality];
  return (
    <span className={`chip ${s.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
