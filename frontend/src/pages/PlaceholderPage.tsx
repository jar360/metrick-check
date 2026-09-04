import type { ReactNode } from "react";
import { PageHeader } from "../components/PageHeader";
import { MockBanner } from "../components/MockBanner";
import { Construction } from "lucide-react";

export function PlaceholderPage({
  title,
  subtitle,
  description,
  icon,
}: {
  title: string;
  subtitle: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="mb-4">
        <MockBanner />
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          {icon ?? <Construction className="h-8 w-8 text-brand-500" />}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-800">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-ink-500">{description}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-400">
          This page will be implemented in the next phase
        </p>
      </div>
    </div>
  );
}
