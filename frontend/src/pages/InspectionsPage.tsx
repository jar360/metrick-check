import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Eye, ClipboardList, ArrowRight, FilePlus } from "lucide-react";
import type { Inspection, InspectionStatus } from "../types";
import { getInspections } from "../services/mockServices";
import { PageHeader } from "../components/PageHeader";
import { MockBanner } from "../components/MockBanner";
import { StatusBadge, ReviewStateBadge } from "../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

const STATUS_FILTERS: { value: InspectionStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "verified", label: "Verified" },
  { value: "needs_review", label: "Needs Review" },
  { value: "non_compliant", label: "Non-Compliant" },
  { value: "insufficient_evidence", label: "Insufficient Evidence" },
];

export function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "all">("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspections();
      setInspections(data);
    } catch {
      setError("Failed to load inspections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return inspections.filter((insp) => {
      const matchesStatus = statusFilter === "all" || insp.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        insp.id.toLowerCase().includes(q) ||
        insp.product.toLowerCase().includes(q) ||
        insp.category.toLowerCase().includes(q) ||
        insp.inspector.toLowerCase().includes(q) ||
        (insp.barcode ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [inspections, search, statusFilter]);

  if (loading) return <LoadingState label="Loading inspections…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Inspections"
        subtitle="Search and filter all packaged commodity inspections"
        actions={
          <Link to="/inspections/new" className="btn-primary">
            <FilePlus className="h-4 w-4" />
            New Inspection
          </Link>
        }
      />

      <div className="mb-6">
        <MockBanner />
      </div>

      {/* Search + Filter */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search by ID, product, category, inspector, or barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink-400" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InspectionStatus | "all")}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>
            Showing {filtered.length} of {inspections.length} inspections
          </span>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No inspections found"
            description="Try adjusting your search or filters, or create a new inspection."
            action={
              <Link to="/inspections/new" className="btn-primary">
                <FilePlus className="h-4 w-4" />
                New Inspection
              </Link>
            }
          />
        ) : (
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
                {filtered.map((insp) => (
                  <tr key={insp.id} className="table-row">
                    <td className="px-5 py-3">
                      <Link
                        to={`/inspections/${insp.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
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
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-center">
          <Link
            to="/inspections/new"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ClipboardList className="h-4 w-4" />
            Start a new inspection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
