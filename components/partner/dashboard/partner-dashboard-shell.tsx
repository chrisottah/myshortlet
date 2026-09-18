"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Building2, PlusCircle, Settings as SettingsIcon, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/auth/actions";
import type { PropertyOwner, Property } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/partner/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/partner/dashboard/properties", label: "My Properties", icon: Building2 },
  { href: "/partner/dashboard/settings", label: "Settings", icon: SettingsIcon },
  { href: "/partner/apply", label: "Submit New", icon: PlusCircle },
];

export function PartnerDashboardShell({
  user,
  children,
}: {
  user: PropertyOwner;
  properties: Property[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-ivory-muted flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-charcoal/10 bg-ivory">
        <Link href="/" className="block p-6 border-b border-charcoal/10 hover:bg-charcoal/5 transition-colors">
          <p className="font-display text-lg text-charcoal">MyShortlet</p>
          <p className="text-sm text-charcoal/60">Property Partner</p>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
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
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-ivory border-b border-charcoal/10 flex items-center justify-between px-4 h-14">
        <Link href="/" className="font-display text-charcoal">
          MyShortlet
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          <Menu size={22} />
        </button>
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
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-charcoal/60 pt-2"
            >
              <LogOut size={16} /> Log out
            </button>
          </form>
        </div>
      )}

      <main className="flex-1 md:pt-0 pt-14 p-4 md:p-8">{children}</main>
    </div>
  );
}