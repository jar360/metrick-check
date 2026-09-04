import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  ImageIcon,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  X,
  RefreshCw,
  Loader,
  AlertCircle,
  Camera,
  Sun,
  Eye,
  Zap,
  MapPin,
  StickyNote,
  ScanLine,
} from "lucide-react";
import type { User, ImageCategory } from "../types";
import { getUsers, createInspection, analyzeInspection, type AnalysisStage } from "../services/mockServices";
import { PageHeader } from "../components/PageHeader";
import { MockBanner, DemoTag } from "../components/MockBanner";
import { Button } from "../components/Button";

type Step = 0 | 1 | 2;

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  category: ImageCategory;
  label: string;
}

interface FormState {
  location: string;
  notes: string;
  inspector: string;
  date: string;
}

const IMAGE_SLOTS: { category: ImageCategory; label: string; description: string }[] = [
  { category: "front", label: "Front of Package", description: "Capture the front face — brand name and product name" },
  { category: "back", label: "Back of Package", description: "Capture the back label — MRP, quantity, manufacturer details" },
  { category: "side", label: "Side / Other", description: "Capture side panels or additional declarations" },
  { category: "close_up", label: "Close-up", description: "Capture a close-up of specific text regions if needed" },
];

const GUIDANCE = [
  { icon: Eye, text: "Keep all text clearly visible and legible" },
  { icon: Sun, text: "Use sufficient, even lighting — avoid shadows" },
  { icon: Zap, text: "Avoid glare and reflections on glossy packaging" },
  { icon: Camera, text: "Capture the entire label within the frame" },
];

const todayISO = () => new Date().toISOString().split("T")[0];

export function NewInspectionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [form, setForm] = useState<FormState>({
    location: "",
    notes: "",
    inspector: "",
    date: todayISO(),
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [creating, setCreating] = useState(false);
  const [analysisState, setAnalysisState] = useState<"idle" | "running" | "done">("idle");
  const [analysisStages, setAnalysisStages] = useState<AnalysisStage[]>([]);
  const [analysisPercent, setAnalysisPercent] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((u) => {
        setUsers(u);
        const firstInspector = u.find((x) => x.role === "inspector" && x.status === "active");
        if (firstInspector) {
          setForm((f) => ({ ...f, inspector: firstInspector.name }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleContinue = () => {
    if (step === 0 && images.length > 0) setStep(1);
    else if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const handleStartAnalysis = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createInspection({
        location: form.location || undefined,
        notes: form.notes || undefined,
        inspector: form.inspector,
        date: form.date,
        imageCategories: images.map((img) => img.category),
      });
      setCreatedId(result.id);
      setAnalysisState("running");
      const stages: AnalysisStage[] = [
        { label: "Checking image quality", status: "pending" },
        { label: "Detecting package regions", status: "pending" },
        { label: "Reading label text", status: "pending" },
        { label: "Extracting declarations", status: "pending" },
        { label: "Mapping applicable requirements", status: "pending" },
        { label: "Preparing evidence", status: "pending" },
      ];
      setAnalysisStages(stages);
      await analyzeInspection(result.id, (stage, percent) => {
        setAnalysisStages((prev) =>
          prev.map((s) => (s.label === stage.label ? stage : s))
        );
        setAnalysisPercent(percent);
      });
      setAnalysisState("done");
    } catch {
      setCreateError("Failed to create inspection. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="New Inspection"
        subtitle="Upload package images — the system will extract product information automatically"
        actions={
          <Link to="/inspections" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        }
      />

      <div className="mb-6">
        <MockBanner />
      </div>

      <StepIndicator step={step} />

      {step === 0 && (
        <UploadImagesStep
          images={images}
          onImagesChange={setImages}
          onContinue={handleContinue}
        />
      )}

      {step === 1 && (
        <DetailsStep
          form={form}
          inspectors={users.filter((u) => u.role === "inspector")}
          loadingInspectors={loadingUsers}
          onUpdate={updateForm}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )}

      {step === 2 && (
        <SummaryStep
          form={form}
          images={images}
          onBack={handleBack}
          onEditDetails={() => setStep(1)}
          onEditImages={() => setStep(0)}
          onStartAnalysis={handleStartAnalysis}
          creating={creating}
          createError={createError}
          analysisState={analysisState}
          analysisStages={analysisStages}
          analysisPercent={analysisPercent}
          createdId={createdId}
          onGoToInspection={(id) => navigate(`/inspections/${id}`)}
          onGoToDashboard={() => navigate("/")}
        />
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: "Upload Images" },
    { num: 2, label: "Inspection Details" },
    { num: 3, label: "Summary & Analysis" },
  ];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.num} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    active ? "text-ink-900" : done ? "text-ink-600" : "text-ink-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    done ? "bg-green-400" : "bg-ink-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UploadImagesStep({
  images,
  onImagesChange,
  onContinue,
}: {
  images: UploadedImage[];
  onImagesChange: (imgs: UploadedImage[]) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Automation-first banner */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Upload Package Images</h2>
        </div>
        <p className="mb-4 text-sm text-ink-500">
          Upload clear photos of the package. The future AI/OCR pipeline will automatically extract
          product name, brand, manufacturer, MRP, quantity, and other declarations — no manual
          data entry required.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs text-brand-800">
            <strong>Automation-first:</strong> Product name, brand, manufacturer, category, and
            barcode will be extracted from these images by the OCR pipeline. You only need to
            provide inspection location and notes later.
          </p>
        </div>
      </div>

      {/* Guidance */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Image Capture Guidance</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GUIDANCE.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.text} className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
                <Icon className="h-5 w-5 shrink-0 text-brand-500" />
                <span className="text-sm text-ink-600">{g.text}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            Image quality analysis is not yet connected. The AI/OCR pipeline will evaluate image
            quality automatically in a later backend phase.
          </p>
        </div>
      </div>

      {/* Upload slots */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Package Images</h2>
          <span className="chip bg-ink-100 text-ink-500 border border-ink-200">
            {images.length} uploaded
          </span>
        </div>

        <div className="space-y-4">
          {IMAGE_SLOTS.map((slot) => (
            <ImageSlot
              key={slot.category}
              slot={slot}
              images={images.filter((img) => img.category === slot.category)}
              onAdd={(file) => {
                const newImg: UploadedImage = {
                  id: `${slot.category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  file,
                  previewUrl: URL.createObjectURL(file),
                  category: slot.category,
                  label: slot.label,
                };
                onImagesChange([...images, newImg]);
              }}
              onReplace={(imgId, file) => {
                const updated = images.map((img) => {
                  if (img.id === imgId) {
                    URL.revokeObjectURL(img.previewUrl);
                    return { ...img, file, previewUrl: URL.createObjectURL(file) };
                  }
                  return img;
                });
                onImagesChange(updated);
              }}
              onRemove={(imgId) => {
                const img = images.find((i) => i.id === imgId);
                if (img) URL.revokeObjectURL(img.previewUrl);
                onImagesChange(images.filter((i) => i.id !== imgId));
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={onContinue} disabled={images.length === 0}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ImageSlot({
  slot,
  images,
  onAdd,
  onReplace,
  onRemove,
}: {
  slot: { category: ImageCategory; label: string; description: string };
  images: UploadedImage[];
  onAdd: (file: File) => void;
  onReplace: (imgId: string, file: File) => void;
  onRemove: (imgId: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAdd(file);
    e.target.value = "";
  };

  const handleReplaceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replaceTarget) onReplace(replaceTarget, file);
    setReplaceTarget(null);
    e.target.value = "";
  };

  return (
    <div className="rounded-lg border border-ink-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-800">{slot.label}</p>
          <p className="text-xs text-ink-400">{slot.description}</p>
        </div>
        {images.length === 0 && (
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
            Add Image
          </Button>
        )}
      </div>

      {images.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 py-8 text-ink-400 transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          <Upload className="h-6 w-6" />
          <span className="mt-2 text-sm">Click to upload an image</span>
          <span className="mt-0.5 text-xs text-ink-300">JPG, PNG up to 10MB</span>
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.id} className="flex items-center gap-3 rounded-lg border border-ink-200 p-3">
              <img
                src={img.previewUrl}
                alt={img.label}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-700">{img.file.name}</p>
                <p className="text-xs text-ink-400">{(img.file.size / 1024).toFixed(0)} KB</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReplaceTarget(img.id);
                      replaceRef.current?.click();
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Replace
                  </button>
                  <span className="text-ink-200">|</span>
                  <button
                    onClick={() => onRemove(img.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-4 text-sm text-ink-400 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <Upload className="h-4 w-4" />
            Upload another
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceSelect}
      />
    </div>
  );
}

function DetailsStep({
  form,
  inspectors,
  loadingInspectors,
  onUpdate,
  onBack,
  onContinue,
}: {
  form: FormState;
  inspectors: User[];
  loadingInspectors: boolean;
  onUpdate: (key: keyof FormState, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-brand-500" />
        <h2 className="text-base font-semibold text-ink-900">Inspection Details</h2>
      </div>
      <p className="mb-5 text-sm text-ink-500">
        Provide optional context about this inspection. Product information will be extracted
        automatically from the uploaded images by the OCR pipeline.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Inspection Location">
          <input
            type="text"
            className="input"
            placeholder="e.g. Reliance Smart, Pune — Aisle 4"
            value={form.location}
            onChange={(e) => onUpdate("location", e.target.value)}
          />
        </Field>

        <Field label="Inspector">
          {loadingInspectors ? (
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <Loader className="h-4 w-4 animate-spin" />
              Loading inspectors…
            </div>
          ) : (
            <select
              className="input"
              value={form.inspector}
              onChange={(e) => onUpdate("inspector", e.target.value)}
            >
              <option value="">Select an inspector</option>
              {inspectors.map((insp) => (
                <option key={insp.id} value={insp.name}>
                  {insp.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Inspection Date">
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => onUpdate("date", e.target.value)}
          />
        </Field>

        <Field label="Notes">
          <input
            type="text"
            className="input"
            placeholder="Optional inspection notes"
            value={form.notes}
            onChange={(e) => onUpdate("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
        <p className="text-xs text-ink-500">
          All fields are optional. The inspector is pre-filled from your demo profile, and the
          date defaults to today.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onContinue}>
          Continue to Summary
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SummaryStep({
  form,
  images,
  onBack,
  onEditDetails,
  onEditImages,
  onStartAnalysis,
  creating,
  createError,
  analysisState,
  analysisStages,
  analysisPercent,
  createdId,
  onGoToInspection,
  onGoToDashboard,
}: {
  form: FormState;
  images: UploadedImage[];
  onBack: () => void;
  onEditDetails: () => void;
  onEditImages: () => void;
  onStartAnalysis: () => void;
  creating: boolean;
  createError: string | null;
  analysisState: "idle" | "running" | "done";
  analysisStages: AnalysisStage[];
  analysisPercent: number;
  createdId: string | null;
  onGoToInspection: (id: string) => void;
  onGoToDashboard: () => void;
}) {
  const summaryRows = [
    { label: "Location", value: form.location || "—" },
    { label: "Inspector", value: form.inspector || "—" },
    { label: "Date", value: form.date },
    { label: "Notes", value: form.notes || "—" },
  ];

  if (analysisState === "running") {
    return (
      <div className="card p-5">
        <div className="mb-6 flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">Demo Analysis Running</h2>
          <DemoTag />
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-500">Progress</span>
            <span className="font-semibold text-ink-700">{analysisPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${analysisPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {analysisStages.map((stage) => (
            <div key={stage.label} className="flex items-center gap-3">
              {stage.status === "complete" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              ) : stage.status === "running" ? (
                <Loader className="h-5 w-5 shrink-0 animate-spin text-brand-500" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-ink-200" />
              )}
              <span
                className={`text-sm ${
                  stage.status === "complete"
                    ? "text-ink-700"
                    : stage.status === "running"
                    ? "text-ink-900 font-medium"
                    : "text-ink-400"
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs text-brand-800">
            This is a simulated demo. AI/OCR analysis will be connected in a later backend phase.
            No real text recognition or compliance checking is happening.
          </p>
        </div>
      </div>
    );
  }

  if (analysisState === "done" && createdId) {
    return (
      <div className="card p-5">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-ink-900">Demo Inspection Saved</h2>
          <p className="mt-1 max-w-md text-sm text-ink-500">
            Inspection <span className="font-semibold text-ink-700">{createdId}</span> has been
            saved locally and the demo analysis has finished. No real OCR or AI was performed —
            this is simulated data.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <DemoTag />
            <span className="text-xs text-ink-400">AI/OCR pipeline not yet connected</span>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => onGoToInspection(createdId)}>
              <ScanLine className="h-4 w-4" />
              View Results
            </Button>
            <Button variant="secondary" onClick={onGoToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-semibold text-ink-900">Inspection Summary</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onEditImages}>
              <RefreshCw className="h-3.5 w-3.5" />
              Edit Images
            </Button>
            <Button variant="ghost" onClick={onEditDetails}>
              <RefreshCw className="h-3.5 w-3.5" />
              Edit Details
            </Button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
          <p className="text-xs text-brand-800">
            Product name, brand, manufacturer, and category will be extracted automatically from
            the uploaded images by the OCR pipeline. These fields are not required from you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex flex-col py-1">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                {row.label}
              </span>
              <span className="text-sm text-ink-700">{row.value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-semibold text-ink-900">Uploaded Images</h2>
          </div>
          <span className="chip bg-ink-100 text-ink-500 border border-ink-200">
            {images.length} {images.length === 1 ? "image" : "images"}
          </span>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <ImageIcon className="h-8 w-8 text-ink-300" />
            <p className="mt-2 text-sm text-ink-400">No images uploaded</p>
            <Button variant="secondary" onClick={onEditImages} className="mt-3">
              <Upload className="h-4 w-4" />
              Add Images
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="overflow-hidden rounded-lg border border-ink-200">
                <img
                  src={img.previewUrl}
                  alt={img.label}
                  className="h-32 w-full object-cover"
                />
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-ink-600">{img.label}</p>
                  <p className="truncate text-[11px] text-ink-400">{img.file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{createError}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack} disabled={creating}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onStartAnalysis} disabled={creating || images.length === 0}>
          {creating ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Save Demo Inspection
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
