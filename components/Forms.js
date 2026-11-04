"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, forgotPassword, resetPassword } from "@/app/actions";
import { Field } from "./Field";
import { Submit } from "./Submit";

const Alert = ({ children }) =>
  children ? <div className="alert" role="alert">{children}</div> : null;

export function LoginForm() {
  const [s, action] = useActionState(login, {});
  return (
    <form action={action} noValidate={false}>
      <Alert>{s.error}</Alert>
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" defaultValue={s.values?.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        right={<Link href="/forgot-password" className="link small">Forgot password?</Link>}
      />
      <Submit>Sign in</Submit>
    </form>
  );
}

export function SignupForm() {
  const [s, action] = useActionState(signup, {});
  const e = s.fieldErrors || {};
  return (
    <form action={action}>
      <Alert>{s.error}</Alert>
      <Field label="Full name" name="name" autoComplete="name" placeholder="Jane Doe" defaultValue={s.values?.name} error={e.name} />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" defaultValue={s.values?.email} error={e.email} />
      <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" error={e.password} meter />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" placeholder="Repeat password" error={e.confirm} />
      <Submit>Create account</Submit>
    </form>
  );
}

export function ForgotForm() {
  const [s, action] = useActionState(forgotPassword, {});
  if (s.sent)
    return (
      <div>
        <div className="success" role="status">
          If an account exists for <b>{s.values.email}</b>, a reset link is on its way. It expires in 30 minutes.
        </div>
        {s.devLink && (
          <div className="devbox">
            <small>Development mode — no email provider configured</small>
            <Link href={s.devLink} className="link">Open reset link →</Link>
          </div>
        )}
        <Link href="/login" className="btn ghost">Back to sign in</Link>
      </div>
    );
  return (
    <form action={action}>
      <Alert>{s.error}</Alert>
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" defaultValue={s.values?.email} />
      <Submit>Send reset link</Submit>
    </form>
  );
}

export function ResetForm({ token }) {
  const [s, action] = useActionState(resetPassword, {});
  const e = s.fieldErrors || {};
  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <Alert>{s.error}</Alert>
      <Field label="New password" name="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" error={e.password} meter />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" placeholder="Repeat password" error={e.confirm} />
      <Submit>Reset password</Submit>
    </form>
  );
}
