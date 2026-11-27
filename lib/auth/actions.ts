"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  createSessionForUser,
  destroySession,
  getCurrentUser,
} from "./session";
import { hashPassword, verifyPassword, checkPasswordPolicy } from "./password";
import { encrypt } from "@/lib/crypto/encrypt";
import type { Role } from "@prisma/client";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const ALLOW_DEMO_LOGIN = process.env.ALLOW_DEMO_LOGIN === "true";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRedirectPathForRole(role: Role): string {
  switch (role) {
    case "investor":
      return "/dashboard";
    case "property_owner":
      return "/partner/dashboard";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

async function clientMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
  };
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ---------------------------------------------------------------------------
// Login (email + password)
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginWithEmail(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError = `/login?error=${encodeURIComponent("Invalid email or password.")}`;

  // Always run verify even if the user is missing, to keep timing consistent.
  const hash = user?.passwordHash ?? "$argon2id$v=19$m=19456,t=2,p=1$aaaaaaaaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const ok = await verifyPassword(hash, password);

  if (!user || !ok) {
    redirect(genericError);
  }

  if (user.status !== "active") {
    redirect(`/login?error=${encodeURIComponent("This account is not active. Contact support.")}`);
  }

  const meta = await clientMeta();
  await createSessionForUser(user.id, meta);
  redirect(getRedirectPathForRole(user.role));
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Register investor
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(10),
  riskTolerance: z.enum(["conservative", "balanced", "growth"]),
  monthlyBudget: z.number().int().nonnegative(),
  goals: z.array(z.string()),
  bankName: z.string().min(1),
  accountNumber: z.string().min(6),
  accountName: z.string().min(1),
  cryptoAsset: z.enum(["USDT", "USDC", "BTC", "ETH"]).optional(),
  cryptoNetwork: z.string().optional(),
});

export type RegisterInvestorInput = z.infer<typeof registerSchema>;

export async function registerInvestor(input: RegisterInvestorInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }
  const data = parsed.data;
  const policy = checkPasswordPolicy(data.password);
  if (!policy.ok) {
    redirect(`/register?error=${encodeURIComponent(policy.errors.join(" "))}`);
  }

  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/register?error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const passwordHash = await hashPassword(data.password);
  const encryptedAccountNumber = encrypt(data.accountNumber);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "investor",
        onboardingComplete: false,
        emailVerifiedAt: null,
        investorProfile: {
          create: {
            riskTolerance: data.riskTolerance,
            monthlyBudgetKobo: BigInt(data.monthlyBudget) * 100n,
            goals: data.goals,
            preferredAsset: data.cryptoAsset ?? null,
            preferredNetwork: data.cryptoNetwork ?? null,
          },
        },
        wallets: { create: { currency: "NGN" } },
        bankAccounts: {
          create: {
            bankName: data.bankName,
            accountNumber: encryptedAccountNumber,
            accountName: data.accountName,
            verified: false,
            nameMatchStatus: "pending",
          },
        },
      },
    });

    // Queue a verification email (actual sending is B5).
    const token = randomBytes(32).toString("hex");
    await tx.emailVerificationToken.create({
      data: {
        userId: created.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await tx.emailOutbox.create({
      data: {
        toEmail: created.email,
        template: "verify-email",
        payload: {
          name: created.firstName,
          link: `${APP_URL}/verify-email?token=${token}`,
        } as never,
      },
    });

    return created;
  });

  const meta = await clientMeta();
  await createSessionForUser(user.id, meta);
  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Password reset (actions only — pages are B5)
// ---------------------------------------------------------------------------

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  // Always redirect to the "sent" page, whether or not the email exists,
  // to prevent account enumeration.
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: tokenHash(token),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
        await tx.emailOutbox.create({
          data: {
            toEmail: user.email,
            template: "reset-password",
            payload: {
              name: user.firstName,
              link: `${APP_URL}/reset-password?token=${token}`,
            } as never,
          },
        });
      });
    }
  }
  redirect(`/forgot-password?sent=1`);
}

// ---------------------------------------------------------------------------
// Demo login (only when ALLOW_DEMO_LOGIN=true)
// ---------------------------------------------------------------------------

const DEMO_EMAILS = new Set([
  "demo.investor@myshortlet.demo",
  "demo.owner@myshortlet.demo",
  "demo.admin@myshortlet.demo",
]);

export async function loginAsDemo(formData: FormData) {
  if (!ALLOW_DEMO_LOGIN) {
    redirect(`/login?error=${encodeURIComponent("Demo login is disabled.")}`);
  }
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!DEMO_EMAILS.has(email)) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/login");
  const meta = await clientMeta();
  await createSessionForUser(user.id, meta);
  redirect(getRedirectPathForRole(user.role));
}