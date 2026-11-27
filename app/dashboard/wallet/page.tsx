import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { walletService } from "@/lib/services/wallet-service";
import { paymentService } from "@/lib/services/payment-service";
import { withdrawalService } from "@/lib/services/withdrawal-service";
import { koboToNaira } from "@/lib/money";
import { WalletClient } from "@/components/dashboard/wallet-client";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; guard for TS

  const wallet = await walletService.getWalletByUserId(user.id);
  const deposits = await paymentService.getByUserId(user.id);
  const withdrawals = await withdrawalService.getByUserId(user.id);

  // Adapt DB rows → frontend shapes.
  // WalletView balances are BigInt kobo; WalletClient expects naira numbers.
  // Deposit/Withdrawal rows have amountKobo (BigInt); the client expects amount.
  const walletForClient = wallet
    ? {
        id: wallet.id,
        userId: wallet.userId,
        availableBalance: koboToNaira(wallet.availableBalance),
        investedBalance: koboToNaira(wallet.investedBalance),
        earningsBalance: koboToNaira(wallet.earningsBalance),
        updatedAt: new Date().toISOString(),
      }
    : undefined;

  const depositsForClient = deposits.map((d) => ({
    id: d.id,
    userId: d.userId,
    method: d.method,
    amount: koboToNaira(d.amountKobo),
    status:
      d.status === "pending"
        ? ("pending_verification" as const)
        : d.status === "confirmed"
        ? ("confirmed" as const)
        : ("rejected" as const),
    bankReference: d.bankReference ?? undefined,
    cryptoTxHash: d.cryptoTxHash ?? undefined,
    cryptoAsset: d.cryptoAsset ?? undefined,
    cryptoNetwork: d.cryptoNetwork ?? undefined,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  const withdrawalsForClient = withdrawals.map((w) => ({
    id: w.id,
    userId: w.userId,
    method: w.method,
    amount: koboToNaira(w.amountKobo),
    status:
      w.status === "completed"
        ? ("completed" as const)
        : w.status === "rejected" || w.status === "failed"
        ? ("rejected" as const)
        : ("pending_processing" as const),
    destinationBank: (w.destinationSnapshot as { bankName?: string } | null)?.bankName,
    destinationWalletAddress: (
      w.destinationSnapshot as { walletAddress?: string } | null
    )?.walletAddress,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return (
    <Suspense fallback={null}>
      <WalletClient
        wallet={walletForClient}
        deposits={depositsForClient}
        withdrawals={withdrawalsForClient}
      />
    </Suspense>
  );
}