import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithEmail, loginAsDemo } from "@/lib/auth/actions";

const ALLOW_DEMO_LOGIN = process.env.ALLOW_DEMO_LOGIN === "true";

const DEMO_ACCOUNTS = [
  { email: "demo.investor@myshortlet.demo", label: "Continue as Demo Investor" },
  { email: "demo.owner@myshortlet.demo", label: "Continue as Demo Property Owner" },
  { email: "demo.admin@myshortlet.demo", label: "Continue as Demo Admin" },
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
          Welcome back. Enter your email and password to continue.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <form action={loginWithEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
            {ALLOW_DEMO_LOGIN && (
              <p className="text-xs text-charcoal/40">
                Seeded demo accounts use the password{" "}
                <code className="rounded bg-charcoal/5 px-1">ChangeMe123!</code>.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        {ALLOW_DEMO_LOGIN && (
          <>
            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-charcoal/10" />
              <span className="text-xs text-charcoal/40 uppercase tracking-wide">
                Or
              </span>
              <div className="h-px flex-1 bg-charcoal/10" />
            </div>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <form key={acc.email} action={loginAsDemo}>
                  <input type="hidden" name="email" value={acc.email} />
                  <Button type="submit" variant="outline" className="w-full">
                    {acc.label}
                  </Button>
                </form>
              ))}
            </div>
          </>
        )}

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