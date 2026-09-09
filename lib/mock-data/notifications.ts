// lib/mock-data/notifications.ts

import { Notification } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const notifications: Notification[] = [
  { id: "ntf_001", userId: "user_inv_01", type: "investment_update", title: "Investment confirmed", message: "Your investment of ₦1,000,000 in The Manuela is now active.", read: true, createdAt: daysFromNow(-60) },
  { id: "ntf_002", userId: "user_inv_01", type: "withdrawal_update", title: "Withdrawal requested", message: "Your withdrawal of ₦150,000 is pending processing.", read: false, createdAt: daysFromNow(0) },
  { id: "ntf_003", userId: "user_inv_02", type: "deposit_update", title: "Deposit submitted", message: "Your deposit of ₦800,000 is pending verification.", read: false, createdAt: daysFromNow(-1) },
  { id: "ntf_004", userId: "user_inv_02", type: "investment_update", title: "Investment matured", message: "Your investment in Ivory Court has matured. Withdraw or reinvest anytime.", read: false, createdAt: daysFromNow(-15) },
  { id: "ntf_005", userId: "user_inv_03", type: "deposit_update", title: "Deposit submitted", message: "Your deposit of ₦300,000 is pending verification.", read: false, createdAt: daysFromNow(0) },
  { id: "ntf_006", userId: "user_inv_05", type: "investment_update", title: "Approaching maturity", message: "Your investment in The Manuela matures in 10 days.", read: false, createdAt: daysFromNow(-2) },
  { id: "ntf_007", userId: "user_inv_05", type: "withdrawal_update", title: "Withdrawal requested", message: "Your withdrawal of ₦300,000 is pending processing.", read: false, createdAt: daysFromNow(-1) },
  { id: "ntf_008", userId: "user_inv_07", type: "deposit_update", title: "Deposit confirmed", message: "₦600,000 has been added to your available balance.", read: true, createdAt: daysFromNow(-114) },
  { id: "ntf_009", userId: "user_inv_08", type: "withdrawal_update", title: "Withdrawal completed", message: "₦1,416,000 has been sent to your bank account.", read: true, createdAt: daysFromNow(-33) },
  { id: "ntf_010", userId: "user_own_01", type: "property_update", title: "Property under review", message: "The Regal — 3BR Townhouse is currently under admin review.", read: false, createdAt: daysFromNow(-2) },
];