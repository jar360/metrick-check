import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  EyeOff,
  CheckCircle2,
  Camera,
  ImageIcon,
  Info,
  Eye,
  RefreshCw,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  Barcode,
  FileText,
} from "lucide-react";
import type { Inspection, ComplianceFinding, InspectionImage, VerificationAction } from "../types";
import { getInspection } from "../services/mockServices";
import { PageHeader } from "../components/PageHeader";
import { MockBanner, DemoTag } from "../components/MockBanner";
import { Button } from "../components/Button";
import { StatusBadge, ReviewStateBadge, ImageQualityBadge } from "../components/Badges";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { LoadingState } from "../components/States";

export function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [findingOverrides, setFindingOverrides] = useState<Record<string, VerificationAction>>({});

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInspection(id);
      if (!result) {
        setError("Inspection not found.");
      } else {
        setInspection(result);
        setSelectedFindingId(result.findings[0]?.id ?? null);
        setSelectedImageId(result.images[0]?.id ?? null);
      }
    } catch {
      setError("Failed to load inspection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const findings = useMemo(() => {
    if (!inspection) return [];
    return inspection.findings.map((f) => ({
      ...f,
      verification: findingOverrides[f.id] ?? f.verification,
    }));
  }, [inspection, findingOverrides]);

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) ?? null;
  const selectedImage = inspection?.images.find((img) => img.id === selectedImageId) ?? null;

  const counts = useMemo(() => {
    const c = { total: 0, verified: 0, needsReview: 0, nonCompliant: 0, insufficient: 0 };
    for (const f of findings) {
      c.total++;
      if (f.status === "verified") c.verified++;
      else if (f.status === "needs_review") c.needsReview++;
      else if (f.status === "non_compliant") c.nonCompliant++;
      else if (f.status === "insufficient_evidence") c.insufficient++;
    }
    return c;
  }, [findings]);

  if (loading) return <LoadingState label="Loading inspection…" />;
  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-ink-800">Inspection not found</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-400">
          {error ?? "This inspection does not exist or has been removed."}
        </p>
        <Link to="/inspections" className="btn-secondary mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Inspections
        </Link>
      </div>
    );
  }

  const setVerification = (findingId: string, action: VerificationAction) => {
    setFindingOverrides((prev) => ({ ...prev, [findingId]: action }));
  };

  return (
    <div>
      <PageHeader
        title="Inspection Results"
        subtitle={inspection.product}
        actions={
          <Link to="/inspections" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Inspections
          </Link>
        }
      />

      <div className="mb-6">
        <MockBanner />
      </div>

      {/* Result Header */}
      <ResultHeader inspection={inspection} />

      {/* Compliance Overview */}
      <div className="mt-6 card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Compliance Overview</h2>
          <DemoTag />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <OverviewCard label="Total Findings" value={counts.total} icon={ClipboardCheck} color="text-ink-700" bg="bg-ink-50" />
          <OverviewCard label="Verified" value={counts.verified} icon={ShieldCheck} color="text-green-600" bg="bg-green-50" />
          <OverviewCard label="Needs Review" value={counts.needsReview} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
          <OverviewCard label="Non-Compliant" value={counts.nonCompliant} icon={XCircle} color="text-red-600" bg="bg-red-50" />
          <OverviewCard label="Insufficient Evidence" value={counts.insufficient} icon={EyeOff} color="text-ink-500" bg="bg-ink-100" />
        </div>
        {counts.needsReview > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <strong>Needs Review</strong> means a finding is uncertain and requires inspector
              verification — it is <em>not</em> the same as Non-Compliant. Low confidence triggers
              human review, not a violation.
            </p>
          </div>
        )}
      </div>

      {/* Evidence-First Findings + Image Panel */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Findings list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-semibold text-ink-900">Evidence-First Findings</h2>
            <span className="chip bg-ink-100 text-ink-500 border border-ink-200">
              {findings.length} findings
            </span>
          </div>
          {findings.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-400">No findings recorded for this inspection.</p>
            </div>
          ) : (
            findings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                isSelected={finding.id === selectedFindingId}
                onSelect={() => {
                  setSelectedFindingId(finding.id);
                  if (finding.source.imageId) setSelectedImageId(finding.source.imageId);
                }}
                onVerify={(action) => setVerification(finding.id, action)}
                linkedImage={inspection.images.find((img) => img.id === finding.source.imageId)}
              />
            ))
          )}
        </div>

        {/* Image Evidence Panel */}
        <div className="space-y-4">
          <ImageEvidencePanel
            inspection={inspection}
            selectedImage={selectedImage}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
            findings={findings}
            selectedFinding={selectedFinding}
          />

          {/* Why This Result panel */}
          {selectedFinding && (
            <WhyResultPanel finding={selectedFinding} />
          )}
        </div>
      </div>

      {/* Inspector Actions */}
      <div className="mt-6 card p-5">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Inspector Actions</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/review-queue" className="btn-secondary">
            <Eye className="h-4 w-4" />
            Go to Review Queue
          </Link>
          <Link to="/inspections" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to Inspections
          </Link>
          <Link to="/" className="btn-ghost">
            <ClipboardCheck className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
          <p className="text-xs text-ink-500">
            Verification actions update local demo state only. In the production version, these
            will persist to the inspection record and trigger downstream workflows.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultHeader({ inspection }: { inspection: Inspection }) {
  const headerInfo = [
    { icon: Calendar, label: "Date", value: inspection.date },
    { icon: User, label: "Inspector", value: inspection.inspector },
    { icon: MapPin, label: "Location", value: inspection.location || "—" },
    { icon: Barcode, label: "Barcode", value: inspection.barcode || "—" },
  ];

  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Inspection ID
            </span>
            <span className="text-sm font-bold text-ink-900">{inspection.id}</span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-ink-900">{inspection.product}</h2>
          <p className="text-sm text-ink-500">{inspection.category}</p>
          {inspection.notes && (
            <p className="mt-2 text-sm text-ink-600">
              <span className="font-medium text-ink-700">Notes: </span>
              {inspection.notes}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={inspection.status} />
          <ReviewStateBadge state={inspection.reviewState} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-4">
        {headerInfo.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-ink-400" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                  {item.label}
                </p>
                <p className="truncate text-sm text-ink-700">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardCheck;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}

function FindingCard({
  finding,
  isSelected,
  onSelect,
  onVerify,
  linkedImage,
}: {
  finding: ComplianceFinding;
  isSelected: boolean;
  onSelect: () => void;
  onVerify: (action: VerificationAction) => void;
  linkedImage?: InspectionImage;
}) {
  const isActioned = finding.verification !== "pending";
  const isVerified = finding.verification === "confirm";

  return (
    <div
      className={`card cursor-pointer p-4 transition-all ${
        isSelected ? "ring-2 ring-brand-400" : "hover:border-brand-300"
      }`}
      onClick={onSelect}
    >
      {/* Top row: requirement + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{finding.requirement}</h3>
            {isVerified && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
          </div>
          <p className="mt-0.5 text-xs text-ink-400">{finding.requirementDescription}</p>
        </div>
        <StatusBadge status={finding.status} />
      </div>

      {/* Extracted value */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-ink-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Extracted Value
          </p>
          <p className="text-sm font-semibold text-ink-800">
            {finding.detectedValue || "—"}
          </p>
          {finding.extractedText && (
            <p className="mt-0.5 truncate text-xs text-ink-400">
              OCR text: "{finding.extractedText}"
            </p>
          )}
        </div>
        <div className="rounded-lg bg-ink-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Expected Value
          </p>
          <p className="text-sm font-semibold text-ink-800">
            {finding.expectedValue || "—"}
          </p>
        </div>
      </div>

      {/* Confidence + explanation */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-500">Confidence</span>
          <ConfidenceBadge value={finding.confidence} />
        </div>
        <p className="mt-2 text-sm text-ink-600">{finding.explanation}</p>
        {finding.whyReview && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">{finding.whyReview}</p>
          </div>
        )}
      </div>

      {/* Evidence link */}
      {linkedImage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
          <ImageIcon className="h-3.5 w-3.5 text-ink-400" />
          <span>
            Evidence: {finding.source.regionLabel} — {linkedImage.category.replace("_", " ")} image
          </span>
        </div>
      )}

      {/* Verification actions */}
      <div className="mt-4 border-t border-ink-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-500">Inspector verification:</span>
          {isActioned && (
            <span className="chip bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 className="h-3 w-3" />
              {finding.verification === "confirm" ? "Verified" : finding.verification === "correct" ? "Corrected" : finding.verification === "not_visible" ? "Not Visible" : "Retake Requested"}
            </span>
          )}
          <Button
            variant="secondary"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onVerify("confirm");
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Verified
          </Button>
          <Button
            variant="ghost"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onVerify("request_new_image");
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Request Better Evidence
          </Button>
          <button
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            View Evidence
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageEvidencePanel({
  inspection,
  selectedImage,
  selectedImageId,
  onSelectImage,
  findings,
  selectedFinding,
}: {
  inspection: Inspection;
  selectedImage: InspectionImage | null;
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  findings: ComplianceFinding[];
  selectedFinding: ComplianceFinding | null;
}) {
  const linkedFindings = useMemo(() => {
    if (!selectedImage) return [];
    return findings.filter((f) => f.source.imageId === selectedImage.id);
  }, [selectedImage, findings]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-brand-500" />
        <h2 className="text-base font-semibold text-ink-900">Evidence Images</h2>
      </div>

      {/* Image thumbnails */}
      <div className="mb-4 flex flex-wrap gap-2">
        {inspection.images.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelectImage(img.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              selectedImageId === img.id
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-ink-200 text-ink-500 hover:border-brand-300 hover:bg-ink-50"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {img.category.replace("_", " ")}
            <ImageQualityBadge quality={img.quality} />
          </button>
        ))}
      </div>

      {/* Main image display */}
      {selectedImage ? (
        <div>
          <div className="relative overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
            <MockImagePlaceholder image={selectedImage} />
          </div>

          {/* Image quality info */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-500">Quality:</span>
              <ImageQualityBadge quality={selectedImage.quality} />
            </div>
            {selectedImage.retakeRecommended && (
              <span className="chip bg-amber-50 text-amber-700 border border-amber-200">
                <RefreshCw className="h-3 w-3" />
                Retake recommended
              </span>
            )}
          </div>
          {selectedImage.qualityReason && (
            <p className="mt-1.5 text-xs text-ink-400">{selectedImage.qualityReason}</p>
          )}

          {/* Linked findings */}
          {linkedFindings.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Findings from this image
              </p>
              <div className="space-y-2">
                {linkedFindings.map((f) => (
                  <div
                    key={f.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      selectedFinding?.id === f.id
                        ? "border-brand-300 bg-brand-50"
                        : "border-ink-200"
                    }`}
                  >
                    <span className="flex-1 truncate font-medium text-ink-700">
                      {f.requirement}
                    </span>
                    <StatusBadge status={f.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <ImageIcon className="h-8 w-8 text-ink-300" />
          <p className="mt-2 text-sm text-ink-400">No images available</p>
        </div>
      )}
    </div>
  );
}

function MockImagePlaceholder({ image }: { image: InspectionImage }) {
  const categoryLabels: Record<string, string> = {
    front: "Front of Package",
    back: "Back of Package",
    side: "Side / Other",
    top_bottom: "Top / Bottom",
    close_up: "Close-up",
  };

  return (
    <div className="flex h-48 w-full flex-col items-center justify-center bg-gradient-to-br from-ink-50 to-ink-100">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
        <ImageIcon className="h-8 w-8 text-ink-300" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink-500">
        {categoryLabels[image.category] ?? image.category}
      </p>
      <p className="mt-0.5 text-xs text-ink-400">Demo image — not a real photo</p>
      {image.retakeRecommended && (
        <span className="mt-2 chip bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="h-3 w-3" />
          Retake recommended
        </span>
      )}
    </div>
  );
}

function WhyResultPanel({ finding }: { finding: ComplianceFinding }) {
  const steps = [
    {
      label: "What we detected",
      value: finding.detectedValue || "No text detected",
      icon: Eye,
    },
    {
      label: "What evidence was found",
      value: finding.extractedText
        ? `"${finding.extractedText}"`
        : "No text was extracted from the evidence image.",
      icon: FileText,
    },
    {
      label: "Confidence",
      value: `${finding.confidence}% — ${
        finding.confidence >= 80
          ? "High confidence, strong evidence"
          : finding.confidence >= 60
          ? "Moderate confidence, verification may be needed"
          : finding.confidence >= 40
          ? "Low confidence, inspector verification required"
          : "Very low confidence, evidence is insufficient or uncertain"
      }`,
      icon: AlertTriangle,
    },
    {
      label: "Why it was flagged",
      value: finding.whyReview ?? finding.explanation,
      icon: Info,
    },
    {
      label: "What the inspector should verify",
      value: getInspectorGuidance(finding),
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-brand-500" />
        <h2 className="text-base font-semibold text-ink-900">Why This Result?</h2>
        <DemoTag />
      </div>

      <p className="mb-4 text-xs text-ink-400">
        Demo rule evaluation — legal rule engine will be connected in the backend phase.
      </p>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="relative flex gap-3">
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-px bg-ink-200" />
              )}
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {step.label}
                </p>
                <p className="text-sm text-ink-700">{step.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getInspectorGuidance(finding: ComplianceFinding): string {
  switch (finding.status) {
    case "verified":
      return "This finding has been verified. No further action is needed unless new evidence emerges.";
    case "needs_review":
      return "Manually verify the extracted value against the package image. If correct, mark as verified. If incorrect, correct the value. If the image is unclear, request a retake.";
    case "non_compliant":
      return "This finding has been confirmed as non-compliant. Document the discrepancy and proceed with the appropriate enforcement action.";
    case "insufficient_evidence":
      return "The required evidence was not captured or is unreadable. Request a clearer image or capture the missing side of the package before re-evaluating.";
    default:
      return "Review the finding and take appropriate action.";
  }
}
