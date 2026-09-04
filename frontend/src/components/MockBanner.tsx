import { Info } from "lucide-react";

export function MockBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800">
      <Info className="h-4 w-4 shrink-0" />
      <span>{message ?? "Demo data — backend AI/OCR pipeline is not connected yet."}</span>
    </div>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
      Demo
    </span>
  );
}
