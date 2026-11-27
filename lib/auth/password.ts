// lib/auth/password.ts
import "server-only";
import argon2 from "argon2";

const ARGON_OPTS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON_OPTS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export interface PasswordPolicyResult {
  ok: boolean;
  errors: string[];
}

export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  const errors: string[] = [];
  if (password.length < 10) errors.push("At least 10 characters.");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter.");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter.");
  if (!/[0-9]/.test(password)) errors.push("At least one digit.");
  return { ok: errors.length === 0, errors };
}