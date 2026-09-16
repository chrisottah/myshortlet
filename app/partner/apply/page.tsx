import { redirect } from "next/navigation";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ApplyWizard } from "@/components/partner/apply/apply-wizard";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PartnerApplyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Please log in to submit a property."));
  }

  if (user.role !== "property_owner") {
    redirect("/login?error=" + encodeURIComponent("Only property owner accounts can submit properties."));
  }

  return (
    <>
      <Navbar />
      <ApplyWizard ownerId={user.id} />
      <Footer />
    </>
  );
}