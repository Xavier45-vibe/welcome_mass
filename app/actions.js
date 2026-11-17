"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  createUser,
  findUserByEmail,
  findUserByResetToken,
  updateUser,
  hashToken,
} from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { EMAIL_RE, normalizeEmail, passwordIssues } from "@/lib/validation";
import { getAppOrigin, getMailConfig, sendPasswordResetEmail } from "@/lib/mailer";

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

export async function signup(_prev, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const values = { name, email };

  const rl = rateLimit(`signup:${await ip()}`, 10, 60_000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${rl.retryAfter}s.`, values };

  const fieldErrors = {};
  if (name.length < 2) fieldErrors.name = "Enter your full name.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  const issues = passwordIssues(password);
  if (issues.length) fieldErrors.password = `Password needs ${issues.join(", ")}.`;
  if (password !== confirm) fieldErrors.confirm = "Passwords do not match.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  if (await findUserByEmail(email))
    return { fieldErrors: { email: "An account with this email already exists." }, values };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ name, email, passwordHash });
  if (!user)
    return { fieldErrors: { email: "An account with this email already exists." }, values };
  await createSession(user);
  redirect("/dashboard");
}

export async function login(_prev, formData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const values = { email };

  const rl = rateLimit(`login:${await ip()}:${email}`, 5, 60_000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${rl.retryAfter}s.`, values };

  if (!EMAIL_RE.test(email) || !password)
    return { error: "Enter your email and password.", values };

  const user = await findUserByEmail(email);
  // Always run bcrypt to keep timing uniform (prevents user enumeration).
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !ok) return { error: "Incorrect email or password.", values };

  await createSession(user);
  redirect("/dashboard");
}

export async function forgotPassword(_prev, formData) {
  const email = normalizeEmail(formData.get("email"));
  const values = { email };

  const rl = rateLimit(`forgot:${await ip()}`, 5, 60_000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${rl.retryAfter}s.`, values };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", values };

  let mailConfig;
  let appOrigin;
  try {
    mailConfig = getMailConfig();
    appOrigin = getAppOrigin();
  } catch (error) {
    console.error("[password-reset] configuration error:", error.message);
    return { error: "Password reset is temporarily unavailable. Please try again later.", values };
  }
  if (!mailConfig && process.env.NODE_ENV === "production") {
    return { error: "Password reset email is not configured. Please contact the site administrator.", values };
  }

  const user = await findUserByEmail(email);
  let devLink = null;
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await updateUser(user.id, {
      resetTokenHash: hashToken(token),
      resetExpires: Date.now() + 30 * 60_000,
    });
    const resetUrl = new URL("/reset-password", appOrigin);
    resetUrl.searchParams.set("token", token);

    if (mailConfig) {
      try {
        await sendPasswordResetEmail({ to: email, link: resetUrl.toString() }, mailConfig);
      } catch (error) {
        await updateUser(user.id, { resetTokenHash: null, resetExpires: 0 });
        console.error("[password-reset] email delivery failed:", {
          code: error?.code,
          responseCode: error?.responseCode,
        });
        return { error: "We couldn't send a reset email right now. Please try again later.", values };
      }
    } else {
      devLink = `${resetUrl.pathname}${resetUrl.search}`;
    }
  }
  return { sent: true, devLink, localOnly: !mailConfig, values };
}

export async function resetPassword(_prev, formData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  const rl = rateLimit(`reset:${await ip()}`, 10, 60_000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${rl.retryAfter}s.` };

  const issues = passwordIssues(password);
  if (issues.length) return { fieldErrors: { password: `Password needs ${issues.join(", ")}.` } };
  if (password !== confirm) return { fieldErrors: { confirm: "Passwords do not match." } };

  const user = token ? await findUserByResetToken(token) : null;
  if (!user) return { error: "This reset link is invalid or has expired. Request a new one." };

  await updateUser(user.id, {
    passwordHash: await bcrypt.hash(password, 12),
    resetTokenHash: null,
    resetExpires: 0,
  });
  await createSession(user);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
