"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, Building2, ScrollText, LogOut, Menu, Home } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { AdminUser } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/properties", label: "Property Review", icon: Building2 },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-ivory-muted flex">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-charcoal/10 bg-ivory">
        <Link
          href="/"
          className="block p-6 border-b border-charcoal/10 hover:bg-charcoal/5 transition-colors"
        >
          <p className="font-display text-lg text-charcoal">MyShortlet</p>
          <p className="text-sm text-charcoal/60">Admin Console</p>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-card px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-emerald/10 text-emerald font-medium"
                    : "text-charcoal/70 hover:bg-charcoal/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-charcoal/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald/10 text-emerald flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div className="text-sm">
              <p className="text-charcoal font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-charcoal/50 text-xs">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
            >
              <LogOut size={16} /> Log out
            </button>
          </form>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
          >
            <Home size={16} /> Return to Home
          </Link>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-ivory border-b border-charcoal/10 flex items-center justify-between px-4 h-14">
        <p className="font-display text-charcoal">MyShortlet Admin</p>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-medium text-charcoal/60">
            Home
          </Link>
          <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-14 inset-x-0 z-30 bg-ivory border-b border-charcoal/10 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-card px-3 py-2 text-sm text-charcoal/70 hover:bg-charcoal/5"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-2 text-sm text-charcoal/60 pt-2">
              <LogOut size={16} /> Log out
            </button>
          </form>
        </div>
      )}

      <main className="flex-1 md:pt-0 pt-14 p-4 md:p-8">{children}</main>
    </div>
  );
}