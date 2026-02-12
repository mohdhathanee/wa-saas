import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavItem({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition " +
        (active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-100")
      }
    >
      {children}
    </Link>
  );
}

export default function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 rounded-2xl bg-gray-50 p-3">
              <div className="text-lg font-extrabold tracking-tight">WA Commerce</div>
              <div className="text-xs text-gray-500">SaaS dashboard</div>
            </div>

            <nav className="space-y-1">
              <NavItem to="/dashboard">📊 Dashboard</NavItem>
              <NavItem to="/products">🧺 Products</NavItem>
              <NavItem to="/orders">🧾 Orders</NavItem>
            </nav>

            <div className="mt-6 rounded-2xl bg-blue-50 p-3 text-xs text-blue-900">
              Tip: Share your public shop link on WhatsApp Status.
            </div>
          </aside>

          {/* Main */}
          <main className="rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{title}</h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">{actions}</div>
            </div>

            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
