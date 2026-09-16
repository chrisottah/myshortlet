import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { investmentService } from "@/lib/services/investment-service";
import { InvestmentsClient } from "@/components/dashboard/investments-client";

export default async function InvestmentsPage() {
  const user = await getCurrentUser();

  const investments = user
    ? investmentService.getInvestmentsByInvestor(user.id)
    : [];

  const investmentsWithTitle = investments.map((inv) => {
    const opportunity = investmentService.getOpportunityById(inv.opportunityId);
    return {
      ...inv,
      opportunityTitle: opportunity?.title ?? "Unknown opportunity",
    };
  });

  return (
    <Suspense fallback={null}>
      <InvestmentsClient investments={investmentsWithTitle} />
    </Suspense>
  );
}