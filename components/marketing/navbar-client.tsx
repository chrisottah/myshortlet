// components/marketing/navbar-client.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { User } from "@/lib/types";
import { logoutAction } from "@/lib/auth/actions";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Investment Opportunities", href: "/opportunities" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Property Owners", href: "/partner" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

function initials(user: User) {
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
}

export function NavbarClient({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-soft text-emerald text-xs font-semibold">
                  {initials(user)}
                </div>
                <span className="text-sm font-medium text-charcoal">
                  {user.firstName}
                </span>
              </div>
              <form action={logoutAction}>
                <Button variant="outline" size="icon" type="submit" title="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald hover:bg-emerald/90 text-ivory">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72 bg-ivory">
            <SheetHeader>
              <SheetTitle>
                <Wordmark />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-charcoal/80 hover:text-charcoal"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-soft text-emerald text-xs font-semibold">
                        {initials(user)}
                      </div>
                      <span className="text-sm font-medium text-charcoal">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <form action={logoutAction}>
                      <Button variant="outline" className="w-full" type="submit">
                        Log Out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-emerald hover:bg-emerald/90 text-ivory">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}