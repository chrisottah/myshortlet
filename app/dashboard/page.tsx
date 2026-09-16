import Link from "next/link";
import { Wallet, TrendingUp, PiggyBank, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { walletService } from "@/lib/services/wallet-service";
import { investmentService } from "@/lib/services/investment-service";
import { transactionService } from "@/lib/services/transaction-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Investor } from "@/lib/types";

export default async function DashboardOverviewPage() {
  const user = (await getCurrentUser()) as Investor;

  const wallet = walletService.getWalletByUserId(user.id);
  const investments = investmentService.getInvestmentsByInvestor(user.id);
  const recentTransactions = transactionService.getByUserId(user.id).slice(0, 5);

  const activeInvestments = investments.filter(
    (inv) => inv.status === "active" || inv.status === "approaching_maturity"
  );

  const recentInvestments = [...investments]
    .sort((a, b) => new Date(b.investedAt).getTime() - new Date(a.investedAt).getTime())
    .slice(0, 4)
    .map((inv) => ({
      investment: inv,
      opportunity: investmentService.getOpportunityById(inv.opportunityId),
    }));

  const availableBalance = wallet?.availableBalance ?? 0;
  const investedBalance = wallet?.investedBalance ?? 0;
  const earningsBalance = wallet?.earningsBalance ?? 0;

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal">
          Welcome back, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Here is a snapshot of your portfolio. All figures shown are
          illustrative and for demo purposes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available Balance"
          value={formatCurrency(availableBalance)}
          icon={Wallet}
          hint="Ready to invest or withdraw"
        />
        <StatCard
          label="Invested Balance"
          value={formatCurrency(investedBalance)}
          icon={Layers}
          hint={`${activeInvestments.length} active investment${activeInvestments.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Earnings Balance"
          value={formatCurrency(earningsBalance)}
          icon={PiggyBank}
          hint="Illustrative, accrued to date"
        />
        <StatCard
          label="Total Portfolio Value"
          value={formatCurrency(availableBalance + investedBalance + earningsBalance)}
          icon={TrendingUp}
          hint="Across all balances"
        />
      </div>

      {/* Recent investments */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-charcoal">
            Recent Investments
          </h2>
          <Link
            href="/dashboard/investments"
            className="text-sm font-medium text-emerald hover:underline"
          >
            View all
          </Link>
        </div>

        {recentInvestments.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-charcoal/20 bg-white p-8 text-center">
            <p className="text-sm text-charcoal/60">
              You haven not made any investments yet.
            </p>
            <Link
              href="/opportunities"
              className="mt-3 inline-block text-sm font-medium text-emerald hover:underline"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-card border border-charcoal/10 bg-white">
            {recentInvestments.map(({ investment, opportunity }) => (
              <div
                key={investment.id}
                className="flex items-center justify-between border-b border-charcoal/5 px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-charcoal">
                    {opportunity?.title ?? "Opportunity"}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    Invested {formatDate(investment.investedAt)} · Matures{" "}
                    {formatDate(investment.maturityDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal">
                    {formatCurrency(investment.amount)}
                  </p>
                  <span className="inline-block rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-medium capitalize text-emerald">
                    {investment.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-charcoal">
            Recent Transactions
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-medium text-emerald hover:underline"
          >
            View all
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-charcoal/20 bg-white p-8 text-center">
            <p className="text-sm text-charcoal/60">No transactions yet.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-card border border-charcoal/10 bg-white">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between border-b border-charcoal/5 px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-charcoal capitalize">
                    {txn.type}
                  </p>
                  <p className="truncate text-xs text-charcoal/50">
                    {txn.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-charcoal">
                    {formatCurrency(txn.amount)}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}