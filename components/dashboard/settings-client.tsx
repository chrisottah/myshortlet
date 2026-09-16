"use client";

import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateProfileAction,
  updateBankDetailsAction,
  updateCryptoPreferenceAction,
  updateInvestmentProfileAction,
} from "@/lib/settings/actions";
import type { Investor } from "@/lib/types";

const CRYPTO_ASSETS = ["USDT", "USDC", "BTC", "ETH"] as const;
const RISK_LEVELS = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "growth", label: "Growth" },
] as const;

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-charcoal">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-charcoal/50">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsClient({ investor }: { investor: Investor | null }) {
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  if (!investor) {
    return (
      <p className="text-sm text-charcoal/50 py-8 text-center">
        Settings are only available for investor accounts.
      </p>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          Settings
        </h1>
        <p className="text-sm text-charcoal/60">
          This is a demo — changes are stored in your session only.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Profile */}
      <SectionCard title="Profile" description="Your basic account information.">
        <form action={updateProfileAction} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-charcoal/60">Email</label>
            <Input value={investor.email} disabled className="mt-1 bg-ivory-muted" />
            <p className="mt-1 text-[11px] text-charcoal/40">
              Email cannot be changed in this demo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-charcoal/60">
                First name
              </label>
              <Input
                name="firstName"
                defaultValue={investor.firstName}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/60">
                Last name
              </label>
              <Input
                name="lastName"
                defaultValue={investor.lastName}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">Phone</label>
            <Input
              name="phone"
              defaultValue={investor.phone ?? ""}
              placeholder="e.g. +234..."
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald text-ivory hover:bg-emerald/90"
          >
            Save profile
          </Button>
        </form>
      </SectionCard>

      {/* Bank Details */}
      <SectionCard
        title="Bank Details"
        description="Used for simulated bank withdrawals."
      >
        <form action={updateBankDetailsAction} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Bank name
            </label>
            <Input
              name="bankName"
              defaultValue={investor.bankDetails?.bankName ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Account number
            </label>
            <Input
              name="accountNumber"
              defaultValue={investor.bankDetails?.accountNumber ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Account name
            </label>
            <Input
              name="accountName"
              defaultValue={investor.bankDetails?.accountName ?? ""}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald text-ivory hover:bg-emerald/90"
          >
            Save bank details
          </Button>
        </form>
      </SectionCard>

      {/* Crypto Preference */}
      <SectionCard
        title="Crypto Preference"
        description="Used for simulated crypto deposits and withdrawals."
      >
        <form action={updateCryptoPreferenceAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-charcoal/60">
                Preferred asset
              </label>
              <select
                name="preferredAsset"
                defaultValue={investor.cryptoPreference?.preferredAsset ?? "USDT"}
                className="mt-1 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
              >
                {CRYPTO_ASSETS.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal/60">
                Network
              </label>
              <Input
                name="preferredNetwork"
                defaultValue={investor.cryptoPreference?.preferredNetwork ?? ""}
                placeholder="e.g. TRC20"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Wallet address (optional)
            </label>
            <Input
              name="walletAddress"
              defaultValue={investor.cryptoPreference?.walletAddress ?? ""}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald text-ivory hover:bg-emerald/90"
          >
            Save crypto preference
          </Button>
        </form>
      </SectionCard>

      {/* Investment Profile */}
      <SectionCard
        title="Investment Profile"
        description="Helps tailor opportunities shown to you."
      >
        <form action={updateInvestmentProfileAction} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Risk tolerance
            </label>
            <select
              name="riskTolerance"
              defaultValue={investor.investmentProfile.riskTolerance}
              className="mt-1 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Monthly budget (optional)
            </label>
            <Input
              type="number"
              name="monthlyBudget"
              defaultValue={investor.investmentProfile.monthlyBudget ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal/60">
              Goals (comma-separated, optional)
            </label>
            <Input
              name="goals"
              defaultValue={investor.investmentProfile.goals?.join(", ") ?? ""}
              placeholder="e.g. Retirement, Passive income"
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald text-ivory hover:bg-emerald/90"
          >
            Save investment profile
          </Button>
        </form>
      </SectionCard>
    </div>
  );
}