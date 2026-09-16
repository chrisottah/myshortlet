"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepPersonalInfo } from "@/components/onboarding/step-personal-info";
import { StepInvestmentProfile } from "@/components/onboarding/step-investment-profile";
import { StepBankInfo } from "@/components/onboarding/step-bank-info";
import { StepReview } from "@/components/onboarding/step-review";
import {
  EMPTY_INVESTOR_APPLICATION,
  InvestorApplicationData,
  ONBOARDING_STEPS,
} from "@/lib/types/investor-application";
import { registerInvestor } from "@/lib/auth/actions";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<InvestorApplicationData>(
    EMPTY_INVESTOR_APPLICATION
  );
  const [submitting, setSubmitting] = useState(false);

  function updateData(patch: Partial<InvestorApplicationData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function isPersonalInfoValid() {
    return (
      data.firstName.trim().length > 0 &&
      data.lastName.trim().length > 0 &&
      data.email.trim().length > 0 &&
      data.phone.trim().length > 0
    );
  }

  function isInvestmentProfileValid() {
    return data.riskTolerance.length > 0 && data.monthlyBudget > 0;
  }

  function isBankInfoValid() {
    return (
      data.bankName.trim().length > 0 &&
      data.accountNumber.trim().length > 0 &&
      data.accountName.trim().length > 0
    );
  }

  function isStepValid() {
    if (step === 0) return isPersonalInfoValid();
    if (step === 1) return isInvestmentProfileValid();
    if (step === 2) return isBankInfoValid();
    return true;
  }

  function goNext() {
    setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await registerInvestor({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        riskTolerance: data.riskTolerance as "conservative" | "balanced" | "growth",
        monthlyBudget: data.monthlyBudget,
        goals: data.goals,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        cryptoAsset: data.cryptoAsset || undefined,
        cryptoNetwork: data.cryptoNetwork || undefined,
      });
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  }

  const isReviewStep = step === 3;
  const isCompleteStep = step === 4;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {!isCompleteStep && (
        <>
          <h1 className="font-display text-3xl text-charcoal mb-2">
            Create your investor account
          </h1>
          <p className="text-charcoal/60 mb-8">
            A few quick steps to set up your investment profile.
          </p>

          <ol className="flex flex-wrap items-center gap-2 mb-8">
            {ONBOARDING_STEPS.slice(0, 4).map((label, index) => (
              <li key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium border",
                    index < step && "bg-emerald border-emerald text-ivory",
                    index === step && "border-emerald text-emerald",
                    index > step && "border-charcoal/20 text-charcoal/40"
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm hidden sm:inline",
                    index === step
                      ? "text-charcoal font-medium"
                      : "text-charcoal/50"
                  )}
                >
                  {label}
                </span>
                {index < 3 && (
                  <div className="w-4 h-px bg-charcoal/15 mx-1" />
                )}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <StepPersonalInfo data={data} onChange={updateData} />
          )}
          {step === 1 && (
            <StepInvestmentProfile data={data} onChange={updateData} />
          )}
          {step === 2 && <StepBankInfo data={data} onChange={updateData} />}
          {isReviewStep && <StepReview data={data} />}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <Button variant="outline" onClick={goBack} disabled={submitting}>
                Back
              </Button>
            ) : (
              <span />
            )}

            {isReviewStep ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!isStepValid()}>
                Continue
              </Button>
            )}
          </div>
        </>
      )}

      {isCompleteStep && (
        <div className="text-center py-16">
          <CheckCircle2 className="h-12 w-12 text-emerald mx-auto mb-4" />
          <h1 className="font-display text-2xl text-charcoal mb-2">
            Account created
          </h1>
          <p className="text-charcoal/60 mb-8">
            You&apos;re all set and logged in as {data.firstName}.
          </p>
          <Button onClick={() => router.push("/")}>Go to Homepage</Button>
        </div>
      )}
    </div>
  );
}