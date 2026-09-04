import { NavLink } from "react-router-dom";
import { LayoutDashboard, FilePlus as FilePlus2, ClipboardList, Package, ListChecks, FileText, BookOpen, Users, Settings, ShieldCheck, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inspections/new", label: "New Inspection", icon: FilePlus2 },
  { to: "/inspections", label: "Inspections", icon: ClipboardList },
  { to: "/products", label: "Products", icon: Package },
  { to: "/review-queue", label: "Review Queue", icon: ListChecks, badge: 4 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/rules", label: "Rules Repository", icon: BookOpen },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-ink-900">MetriCheck</p>
              <p className="text-[11px] leading-tight text-ink-400">Compliance Inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                      }`
                    }
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-800">Sunil Menon</p>
              <p className="truncate text-xs text-ink-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
