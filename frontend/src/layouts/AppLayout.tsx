import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost p-2 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search inspections, products…"
                className="w-64 rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative btn-ghost p-2" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
            </button>
            <div className="flex items-center gap-2.5 border-l border-ink-200 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                SM
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-tight text-ink-800">Sunil Menon</p>
                <p className="text-xs leading-tight text-ink-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
