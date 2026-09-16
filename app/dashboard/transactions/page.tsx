import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { transactionService } from "@/lib/services/transaction-service";
import { TransactionsClient } from "@/components/dashboard/transactions-client";

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  const transactions = user ? transactionService.getByUserId(user.id) : [];

  return (
    <Suspense fallback={null}>
      <TransactionsClient transactions={transactions} />
    </Suspense>
  );
}