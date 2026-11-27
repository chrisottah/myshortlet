// lib/crypto/encrypt.ts
// Encrypt/decrypt sensitive strings (bank account numbers, KYC fields) at rest.
// AES-256-GCM. Format: v1:<ivHex>:<tagHex>:<cipherHex>
//
// NOTE: no `import "server-only"` here — this module is imported by
// prisma/seed.ts (a plain Node script) as well as by server code. It uses
// node:crypto and process.env, so it cannot run in the browser anyway.

import crypto from "node:crypto";

const KEY_HEX = process.env.ENCRYPTION_KEY;
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  );
}
const KEY = Buffer.from(KEY_HEX, "hex");

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decrypt(payload: string): string {
  const [version, ivHex, tagHex, cipherHex] = payload.split(":");
  if (version !== "v1" || !ivHex || !tagHex || !cipherHex) {
    throw new Error("Invalid ciphertext format");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(cipherHex, "hex")), decipher.final()]);
  return dec.toString("utf8");
}