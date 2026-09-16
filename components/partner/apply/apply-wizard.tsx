"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormProgress } from "@/components/partner/apply/form-progress";
import { StepBasicInfo } from "@/components/partner/apply/step-basic-info";
import { StepLocation } from "@/components/partner/apply/step-location";
import { StepAmenities } from "@/components/partner/apply/step-amenities";
import { StepFinancials } from "@/components/partner/apply/step-financials";
import { StepDocuments } from "@/components/partner/apply/step-documents";
import { StepReview } from "@/components/partner/apply/step-review";
import {
  EMPTY_APPLICATION,
  PropertyApplicationData,
} from "@/lib/types/property-application";
import type { Property } from "@/lib/types/property";
import { propertyService } from "@/lib/services/property-service";
import { CheckCircle2 } from "lucide-react";

interface ApplyWizardProps {
  ownerId: string;
}

export function ApplyWizard({ ownerId }: ApplyWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PropertyApplicationData>(EMPTY_APPLICATION);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateData(patch: Partial<PropertyApplicationData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function isBasicInfoValid() {
    return data.title.trim().length > 0 && data.propertyType.length > 0;
  }

  function isLocationValid() {
    return (
      data.countryId.length > 0 &&
      data.regionId.length > 0 &&
      data.cityId.length > 0 &&
      data.addressLine.trim().length > 0
    );
  }

  function isAmenitiesValid() {
    return data.amenities.length > 0;
  }

  function isFinancialsValid() {
    return (
      data.acquisitionCost > 0 &&
      data.estimatedAnnualRevenue > 0 &&
      data.operatingCostEstimate >= 0 &&
      data.occupancyRateEstimate > 0 &&
      data.requestedFundingAmount > 0 &&
      data.requestedFundingAmount <= data.acquisitionCost
    );
  }

  function isDocumentsValid() {
    return data.documentNames.length > 0;
  }

  function isStepValid() {
    if (step === 0) return isBasicInfoValid();
    if (step === 1) return isLocationValid();
    if (step === 2) return isAmenitiesValid();
    if (step === 3) return isFinancialsValid();
    if (step === 4) return isDocumentsValid();
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
    setSubmitError(null);
    try {
      const property = propertyService.submitProperty({
        ownerId,
        title: data.title,
        description: data.description,
        type: data.propertyType as Property["type"],
        location: {
          countryId: data.countryId,
          regionId: data.regionId,
          cityId: data.cityId,
          address: data.addressLine,
        },
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        maxGuests: data.maxGuests,
        amenities: data.amenities,
        images: [],
        financials: {
          acquisitionCost: data.acquisitionCost,
          estimatedAnnualRevenue: data.estimatedAnnualRevenue,
          occupancyRateEstimate: data.occupancyRateEstimate,
          operatingCostEstimate: data.operatingCostEstimate,
        },
      });

      // Funding ask isn't part of Property — log for now, Phase 8 admin
      // console will use these to actually create the Opportunity.
      console.log("Requested funding terms:", {
        propertyId: property.id,
        requestedFundingAmount: data.requestedFundingAmount,
        expectedTermMonths: data.expectedTermMonths,
      });

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald mx-auto mb-4" />
        <h1 className="font-display text-2xl text-charcoal mb-2">
          Submitted — Under Review
        </h1>
        <p className="text-charcoal/60 mb-8">
          Thanks for submitting your property. Our team will review it and
          follow up by email once it&apos;s vetted and ready to list.
        </p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  const isLastStep = step === 5;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl text-charcoal mb-2">
        Submit your property
      </h1>
      <p className="text-charcoal/60 mb-8">
        Tell us about your property. Our team vets every submission before it
        goes live as an investment opportunity.
      </p>

      <FormProgress currentStep={step} />

      {step === 0 && <StepBasicInfo data={data} onChange={updateData} />}
      {step === 1 && <StepLocation data={data} onChange={updateData} />}
      {step === 2 && <StepAmenities data={data} onChange={updateData} />}
      {step === 3 && <StepFinancials data={data} onChange={updateData} />}
      {step === 4 && <StepDocuments data={data} onChange={updateData} />}
      {step === 5 && <StepReview data={data} />}

      {submitError && (
        <p className="text-sm text-red-600 mt-4">{submitError}</p>
      )}

      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <Button variant="outline" onClick={goBack} disabled={submitting}>
            Back
          </Button>
        ) : (
          <span />
        )}

        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for Review"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!isStepValid()}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}