import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { RegisterWizard } from "@/components/onboarding/register-wizard";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <RegisterWizard />
      <Footer />
    </>
  );
}