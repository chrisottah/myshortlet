import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithEmail, loginAsDemo } from "@/lib/auth/actions";

const DEMO_ACCOUNTS = [
  {
    userId: "user_inv_01",
    label: "Continue as Demo Investor",
    email: "demo.investor@myshortlet.demo",
  },
  {
    userId: "user_own_01",
    label: "Continue as Demo Property Owner",
    email: "demo.owner@myshortlet.demo",
  },
  {
    userId: "user_admin_01",
    label: "Continue as Demo Admin",
    email: "demo.admin@myshortlet.demo",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-20">
        <h1 className="font-display text-3xl text-charcoal mb-2">Log in</h1>
        <p className="text-charcoal/60 mb-8">
          Welcome back. Enter your email to continue, or use a demo account
          below.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <form action={loginWithEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
            />
            <p className="text-xs text-charcoal/40">
              Demo platform — password isn&apos;t checked, any value works.
            </p>
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-charcoal/10" />
          <span className="text-xs text-charcoal/40 uppercase tracking-wide">
            Or
          </span>
          <div className="h-px flex-1 bg-charcoal/10" />
        </div>

        <div className="space-y-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <form key={acc.userId} action={loginAsDemo}>
              <input type="hidden" name="userId" value={acc.userId} />
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-between"
              >
                <span>{acc.label}</span>
                <span className="text-xs text-charcoal/40">{acc.email}</span>
              </Button>
            </form>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-charcoal/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}