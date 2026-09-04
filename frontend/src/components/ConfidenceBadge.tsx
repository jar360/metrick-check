export function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 80 ? "text-green-600" : value >= 60 ? "text-brand-600" : value >= 40 ? "text-amber-600" : "text-red-600";
  const bar = value >= 80 ? "bg-green-500" : value >= 60 ? "bg-brand-500" : value >= 40 ? "bg-amber-500" : "bg-red-500";
  const label = value >= 80 ? "High" : value >= 60 ? "Moderate" : value >= 40 ? "Low" : "Very Low";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold ${color}`}>{value}%</span>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}
