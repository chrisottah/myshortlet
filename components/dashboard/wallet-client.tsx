"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { submitDeposit, submitWithdrawal } from "@/lib/wallet/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Wallet, Deposit, Withdrawal } from "@/lib/types";

function MethodToggle({
  value,
  onChange,
}: {
  value: "bank_transfer" | "crypto";
  onChange: (v: "bank_transfer" | "crypto") => void;
}) {
  return (
    <div className="flex gap-2">
      {(["bank_transfer", "crypto"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 rounded-card border px-3 py-2 text-sm font-medium transition-colors ${
            value === m
              ? "border-emerald bg-emerald/10 text-emerald"
              : "border-charcoal/15 text-charcoal/60 hover:bg-charcoal/5"
          }`}
        >
          {m === "bank_transfer" ? "Bank Transfer" : "Crypto"}
        </button>
      ))}
      <input type="hidden" name="method" value={value} />
    </div>
  );
}

function DepositForm() {
  const [method, setMethod] = useState<"bank_transfer" | "crypto">("bank_transfer");

  return (
    <form action={submitDeposit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Deposit method
        </label>
        <MethodToggle value={method} onChange={setMethod} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Amount (₦)
        </label>
        <input
          type="number"
          name="amount"
          min="1"
          step="1"
          required
          className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
          placeholder="e.g. 50000"
        />
      </div>

      {method === "bank_transfer" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">
            Bank transfer reference
          </label>
          <input
            type="text"
            name="bankReference"
            required
            className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
            placeholder="Reference from your bank app"
          />
          <p className="mt-1 text-xs text-charcoal/50">
            Demo: enter any reference — no real bank transfer is processed.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">
                Asset
              </label>
              <input
                type="text"
                name="cryptoAsset"
                required
                defaultValue="USDT"
                className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">
                Network
              </label>
              <input
                type="text"
                name="cryptoNetwork"
                required
                defaultValue="TRC20"
                className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">
              Transaction hash
            </label>
            <input
              type="text"
              name="cryptoTxHash"
              required
              className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
              placeholder="Demo tx hash"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full rounded-card bg-emerald px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald/90"
      >
        Submit Deposit
      </button>
    </form>
  );
}

function WithdrawForm({ availableBalance }: { availableBalance: number }) {
  const [method, setMethod] = useState<"bank_transfer" | "crypto">("bank_transfer");

  return (
    <form action={submitWithdrawal} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Withdraw to
        </label>
        <MethodToggle value={method} onChange={setMethod} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">
          Amount (₦)
        </label>
        <input
          type="number"
          name="amount"
          min="1"
          max={availableBalance}
          step="1"
          required
          className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
          placeholder="e.g. 20000"
        />
        <p className="mt-1 text-xs text-charcoal/50">
          Available: {formatCurrency(availableBalance)}
        </p>
      </div>

      {method === "bank_transfer" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">
            Destination bank account
          </label>
          <input
            type="text"
            name="destinationBank"
            required
            className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
            placeholder="Bank name & account number"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">
            Destination wallet address
          </label>
          <input
            type="text"
            name="destinationWalletAddress"
            required
            className="w-full rounded-card border border-charcoal/15 px-3 py-2 text-sm outline-none focus:border-emerald"
            placeholder="Demo wallet address"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-card border border-charcoal/20 px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
      >
        Request Withdrawal
      </button>
    </form>
  );
}

function HistoryList({
  deposits,
  withdrawals,
}: {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}) {
  const items = [
    ...deposits.map((d) => ({
      id: d.id,
      label: d.method === "bank_transfer" ? "Bank deposit" : `${d.cryptoAsset} deposit`,
      amount: d.amount,
      status: d.status,
      createdAt: d.createdAt,
      positive: true,
    })),
    ...withdrawals.map((w) => ({
      id: w.id,
      label: w.method === "bank_transfer" ? "Bank withdrawal" : "Crypto withdrawal",
      amount: w.amount,
      status: w.status,
      createdAt: w.createdAt,
      positive: false,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-charcoal/20 bg-white p-8 text-center">
        <p className="text-sm text-charcoal/60">No deposits or withdrawals yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-charcoal/10 bg-white">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-b border-charcoal/5 px-5 py-4 last:border-b-0"
        >
          <div>
            <p className="text-sm font-medium text-charcoal">{item.label}</p>
            <p className="text-xs text-charcoal/50">{formatDate(item.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-charcoal">
              {item.positive ? "+" : "-"}
              {formatCurrency(item.amount)}
            </p>
            <span className="inline-block rounded-full bg-charcoal/5 px-2 py-0.5 text-[10px] font-medium capitalize text-charcoal/60">
              {item.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalletClient({
  wallet,
  deposits,
  withdrawals,
}: {
  wallet: Wallet | undefined;
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}) {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal">Wallet</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Deposits and withdrawals are simulated for this demo — no real funds move.
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-charcoal/10 bg-white p-5">
          <p className="text-sm text-charcoal/60">Available</p>
          <p className="mt-1 font-display text-xl font-semibold text-charcoal">
            {formatCurrency(wallet?.availableBalance ?? 0)}
          </p>
        </div>
        <div className="rounded-card border border-charcoal/10 bg-white p-5">
          <p className="text-sm text-charcoal/60">Invested</p>
          <p className="mt-1 font-display text-xl font-semibold text-charcoal">
            {formatCurrency(wallet?.investedBalance ?? 0)}
          </p>
        </div>
        <div className="rounded-card border border-charcoal/10 bg-white p-5">
          <p className="text-sm text-charcoal/60">Earnings</p>
          <p className="mt-1 font-display text-xl font-semibold text-charcoal">
            {formatCurrency(wallet?.earningsBalance ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("deposit")}
              className={`rounded-card px-4 py-2 text-sm font-medium ${
                tab === "deposit"
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/60 border border-charcoal/15"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setTab("withdraw")}
              className={`rounded-card px-4 py-2 text-sm font-medium ${
                tab === "withdraw"
                  ? "bg-charcoal text-white"
                  : "bg-white text-charcoal/60 border border-charcoal/15"
              }`}
            >
              Withdraw
            </button>
          </div>

          <div className="rounded-card border border-charcoal/10 bg-white p-6">
            {tab === "deposit" ? (
              <DepositForm />
            ) : (
              <WithdrawForm availableBalance={wallet?.availableBalance ?? 0} />
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">
            History
          </h2>
          <HistoryList deposits={deposits} withdrawals={withdrawals} />
        </div>
      </div>
    </div>
  );
}