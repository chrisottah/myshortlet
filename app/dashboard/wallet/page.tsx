import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { walletService } from "@/lib/services/wallet-service";
import { paymentService } from "@/lib/services/payment-service";
import { withdrawalService } from "@/lib/services/withdrawal-service";
import { WalletClient } from "@/components/dashboard/wallet-client";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout already redirects; guard for TS

  const wallet = walletService.getWalletByUserId(user.id);
  const deposits = paymentService.getByUserId(user.id);
  const withdrawals = withdrawalService.getByUserId(user.id);

  return (
    <Suspense fallback={null}>
      <WalletClient wallet={wallet} deposits={deposits} withdrawals={withdrawals} />
    </Suspense>
  );
}