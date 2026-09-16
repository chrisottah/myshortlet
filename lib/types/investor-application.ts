export interface InvestorApplicationData {
  // Step 1 — Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2 — Investment Profile
  riskTolerance: "conservative" | "balanced" | "growth" | "";
  monthlyBudget: number;
  goals: string[];

  // Step 3 — Bank / Withdrawal Info
  bankName: string;
  accountNumber: string;
  accountName: string;
  cryptoAsset: "USDT" | "USDC" | "BTC" | "ETH" | "";
  cryptoNetwork: string;
}

export const EMPTY_INVESTOR_APPLICATION: InvestorApplicationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  riskTolerance: "",
  monthlyBudget: 0,
  goals: [],
  bankName: "",
  accountNumber: "",
  accountName: "",
  cryptoAsset: "",
  cryptoNetwork: "",
};

export const ONBOARDING_STEPS = [
  "Personal Info",
  "Investment Profile",
  "Bank/Withdrawal",
  "Review",
  "Complete",
] as const;