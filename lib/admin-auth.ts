
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "divavision_admin";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

export { SESSION_COOKIE, SESSION_DURATION };

function safeEqual(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return (
    first.length === second.length &&
    timingSafeEqual(first, second)
  );
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;

  return Boolean(expected && safeEqual(password, expected));
}

export function createAdminSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be at least 32 characters."
    );
  }

  const expiry = String(Date.now() + SESSION_DURATION);

  const signature = createHmac("sha256", secret)
    .update(expiry)
    .digest("hex");

  return `${expiry}.${signature}`;
}

export function isValidAdminSession(token?: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiry, signature] = parts;
  const expiryNumber = Number(expiry);

  if (!Number.isFinite(expiryNumber) || expiryNumber <= Date.now()) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(expiry)
    .digest("hex");

  return safeEqual(signature, expected);
}
