import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  EyeOff,
  ArrowRight,
  TrendingUp,
  ListChecks,
  Eye,
  ImageIcon,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { DashboardData, Inspection, ImageQuality } from "../types";
import { getDashboardData } from "../services/mockServices";
import { PageHeader } from "../components/PageHeader";
import { MockBanner } from "../components/MockBanner";
import { StatusBadge, ReviewStateBadge, PriorityBadge, ImageQualityBadge } from "../components/Badges";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getDashboardData();
      setData(d);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const evidenceQuality = useMemo(() => {
    const counts = { good: 0, acceptable: 0, poor: 0, insufficient: 0, total: 0, retakeCount: 0 };
    if (!data) return counts;
    for (const insp of data.recentInspections) {
      for (const img of insp.images) {
        counts[img.quality]++;
        counts.total++;
        if (img.retakeRecommended) counts.retakeCount++;
      }
    }
    return counts;
  }, [data]);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !data) return <ErrorState message={error ?? "No data available."} onRetry={load} />;

  const cards = [
    { label: "Total Inspections", value: data.summary.totalInspections, icon: ClipboardCheck, color: "text-brand-600", bg: "bg-brand-50", hint: "All-time inspections recorded" },
    { label: "Verified Compliant", value: data.summary.verifiedCompliant, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", hint: "Findings confirmed as compliant" },
    { label: "Needs Review", value: data.summary.needsReview, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", hint: "Awaiting inspector verification" },
    { label: "Confirmed Non-Compliant", value: data.summary.confirmedNonCompliant, icon: XCircle, color: "text-red-600", bg: "bg-red-50", hint: "Violations confirmed by inspector" },
    { label: "Insufficient Evidence", value: data.summary.insufficientEvidence, icon: EyeOff, color: "text-ink-500", bg: "bg-ink-100", hint: "Cannot determine — needs more data" },
  ];

  const maxActivity = Math.max(...data.activity.map((a) => a.inspections), 1);
  const totalSnapshot =
    data.summary.verifiedCompliant +
    data.summary.needsReview +
    data.summary.confirmedNonCompliant +
    data.summary.insufficientEvidence;
  const snapshotSegments = [
    { label: "Verified", value: data.summary.verifiedCompliant, color: "bg-green-500", text: "text-green-700" },
    { label: "Needs Review", value: data.summary.needsReview, color: "bg-amber-500", text: "text-amber-700" },
    { label: "Insufficient Evidence", value: data.summary.insufficientEvidence, color: "bg-ink-400", text: "text-ink-600" },
    { label: "Confirmed Non-Compliant", value: data.summary.confirmedNonCompliant, color: "bg-red-500", text: "text-red-700" },
  ];
  const maxCategory = Math.max(...data.categoryDistribution.map((c) => c.count), 1);

  return (
    <div>
      <PageHeader
        title="Inspection Dashboard"
        subtitle="Overview of packaged commodity inspections and compliance status"
        actions={
          <Link to="/inspections/new" className="btn-primary">
            <ClipboardCheck className="h-4 w-4" />
            New Inspection
          </Link>
        }
      />

      <div className="mb-6">
        <MockBanner />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-ink-900">{c.value}</p>
              <p className="text-xs font-medium text-ink-600">{c.label}</p>
              <p className="mt-0.5 text-[11px] text-ink-400">{c.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Inspection Attention */}
      <div className="mt-6 card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-semibold text-ink-900">Inspection Attention</h2>
          <span className="chip bg-amber-50 text-amber-700 border border-amber-200">
            {data.attentionItems.length} items
          </span>
        </div>
        {data.attentionItems.length === 0 ? (
          <EmptyState title="No items require immediate attention" description="All findings have been verified or resolved." />
        ) : (
          <div className="space-y-3">
            {data.attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-ink-200 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-800">{item.finding}</p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {item.product} —{" "}
                    <Link to={`/inspections/${item.inspectionId}`} className="font-medium text-brand-600 hover:underline">
                      {item.inspectionId}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-amber-600">{item.reason}</p>
                </div>
                <div className="flex items-center gap-3 pl-0 sm:pl-3">
                  <ConfidenceBadge value={item.confidence} />
                  <Link to={`/inspections/${item.inspectionId}`} className="btn-secondary text-xs whitespace-nowrap">
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity + Category Distribution */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Inspection Activity</h2>
            <span className="text-xs text-ink-400">Last 6 months</span>
          </div>
          <div className="flex items-end justify-between gap-3" style={{ height: 200 }}>
            {data.activity.map((a) => (
              <div key={a.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t bg-brand-300 transition-all"
                    style={{ height: `${(a.inspections / maxActivity) * 100}%` }}
                    title={`${a.inspections} inspections`}
                  />
                  <div
                    className="w-3 rounded-t bg-green-400 transition-all"
                    style={{ height: `${(a.verified / maxActivity) * 100}%` }}
                    title={`${a.verified} verified`}
                  />
                  <div
                    className="w-3 rounded-t bg-amber-400 transition-all"
                    style={{ height: `${(a.flagged / maxActivity) * 100}%` }}
                    title={`${a.flagged} flagged`}
                  />
                </div>
                <span className="text-xs text-ink-400">{a.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-brand-300" /> Total
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-green-400" /> Verified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-amber-400" /> Flagged
            </span>
          </div>
        </div>

        {/* Category distribution */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Category Distribution</h2>
            <TrendingUp className="h-4 w-4 text-ink-300" />
          </div>
          <div className="space-y-3">
            {data.categoryDistribution.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{c.category}</span>
                  <span className="font-semibold text-ink-800">{c.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-400"
                    style={{ width: `${(c.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Snapshot + Evidence Quality */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compliance snapshot */}
        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink-900">Compliance Snapshot</h2>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-100">
            {snapshotSegments.map((seg) => (
              <div
                key={seg.label}
                className={seg.color}
                style={{ width: `${(seg.value / totalSnapshot) * 100}%` }}
                title={`${seg.label}: ${seg.value}`}
              />
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {snapshotSegments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded ${seg.color}`} />
                  <span className="text-ink-600">{seg.label}</span>
                </span>
                <span className={`font-semibold ${seg.text}`}>{seg.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <strong>Needs Review</strong> means a finding is uncertain — it is <em>not</em> the same as
              Non-Compliant. Low confidence triggers human verification, not a violation.
            </p>
          </div>
        </div>

        {/* Evidence quality */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Evidence Quality Snapshot</h2>
            <ImageIcon className="h-4 w-4 text-ink-300" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <EvidenceQualityCard label="Good" count={evidenceQuality.good} quality="good" />
            <EvidenceQualityCard label="Acceptable" count={evidenceQuality.acceptable} quality="acceptable" />
            <EvidenceQualityCard label="Poor" count={evidenceQuality.poor} quality="poor" />
            <EvidenceQualityCard label="Insufficient" count={evidenceQuality.insufficient} quality="insufficient" />
          </div>
          {evidenceQuality.retakeCount > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">{evidenceQuality.retakeCount}</span>{" "}
                  {evidenceQuality.retakeCount === 1 ? "image requires" : "images require"} retake — better
                  evidence is needed.
                </p>
              </div>
              <Link to="/review-queue" className="btn-secondary text-xs whitespace-nowrap">
                View Review Queue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent inspections table */}
      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Recent Inspections</h2>
          <Link
            to="/inspections"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3">Inspection ID</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Inspector</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Review</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.recentInspections.map((insp: Inspection) => (
                <tr key={insp.id} className="table-row">
                  <td className="px-5 py-3">
                    <Link to={`/inspections/${insp.id}`} className="font-medium text-brand-600 hover:underline">
                      {insp.id}
                    </Link>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-ink-700">{insp.product}</td>
                  <td className="px-5 py-3 text-ink-500">{insp.category}</td>
                  <td className="px-5 py-3 text-ink-500">{insp.date}</td>
                  <td className="px-5 py-3 text-ink-500">{insp.inspector}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={insp.status} />
                  </td>
                  <td className="px-5 py-3">
                    <ReviewStateBadge state={insp.reviewState} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/inspections/${insp.id}`} className="btn-ghost text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EvidenceQualityCard({
  label,
  count,
  quality,
}: {
  label: string;
  count: number;
  quality: ImageQuality;
}) {
  const iconMap: Record<ImageQuality, typeof CheckCircle2> = {
    good: CheckCircle2,
    acceptable: CheckCircle2,
    poor: AlertTriangle,
    insufficient: EyeOff,
  };
  const Icon = iconMap[quality];
  return (
    <div className="rounded-lg border border-ink-200 p-3">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-ink-400" />
        <ImageQualityBadge quality={quality} />
      </div>
      <p className="mt-2 text-2xl font-bold text-ink-900">{count}</p>
      <p className="text-xs text-ink-500">{label} images</p>
    </div>
  );
}
