"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  TrendingUp,
  ArrowLeftRight,
  Heart,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { Wordmark } from "@/components/shared/wordmark";
import { logoutAction } from "@/lib/auth/actions";
import type { Investor } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
  { href: "/dashboard/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function DashboardShell({
  user,
  children,
}: {
  user: Investor;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ivory-muted flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-charcoal/10 bg-white">
        <div className="px-6 py-5 border-b border-charcoal/10">
          <Wordmark />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald/10 text-emerald"
                    : "text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-charcoal/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-white text-sm font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-charcoal">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-charcoal/50">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-2 flex w-full items-center gap-3 rounded-card px-3 py-2 text-sm font-medium text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal transition-colors"
            >
              <LogOut size={18} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex md:hidden items-center justify-between border-b border-charcoal/10 bg-white px-4 py-3">
          <Wordmark />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white text-xs font-semibold">
            {getInitials(user.firstName, user.lastName)}
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-charcoal/10 bg-white px-2 py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium ${
                  isActive ? "text-emerald" : "text-charcoal/50"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}